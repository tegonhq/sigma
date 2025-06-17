import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModelNameEnum, TaskHookAction } from '@redplanethq/sol-sdk';
import { tasks } from '@trigger.dev/sdk/v3';
import { Client } from 'pg';
import {
  LogicalReplicationService,
  Wal2JsonPlugin,
} from 'pg-logical-replication';
import { listActivityHandler } from 'triggers/list/list-activity-handler';
import { v4 as uuidv4 } from 'uuid';

import ActivityService from 'modules/activity/activity.service';
import { LoggerService } from 'modules/logger/logger.service';
import { PagesService } from 'modules/pages/pages.service';
import { SyncGateway } from 'modules/sync/sync.gateway';
import SyncActionsService from 'modules/sync-actions/sync-actions.service';
import { TaskHooksService } from 'modules/tasks-hook/tasks-hook.service';

import {
  logChangeType,
  logType,
  tableHooks,
  tablesToSendMessagesFor,
} from './replication.interface';

const REPLICATION_SLOT_PLUGIN = 'wal2json';

@Injectable()
export default class ReplicationService {
  client: Client;
  private readonly logger: LoggerService = new LoggerService(
    'ReplicationService',
  );
  private replicationSlotName = `sigma_replication_slot_${uuidv4().replace(/-/g, '')}`;

  constructor(
    private configService: ConfigService,
    private syncGateway: SyncGateway,
    private syncActionsService: SyncActionsService,
    private pagesService: PagesService,
    private taskHooksService: TaskHooksService,
    private activity: ActivityService,
  ) {
    this.client = new Client({
      user: configService.get('POSTGRES_USER'),
      host: configService.get('DB_HOST'),
      database: configService.get('POSTGRES_DB'),
      password: configService.get('POSTGRES_PASSWORD'),
      port: configService.get('DB_PORT'),
    });
  }

  async init() {
    await this.client.connect();

    await this.deleteOrphanedSlots();
    await this.createReplicationSlot();
    await this.setupReplication();
    await this.setupReplicationIdentity();
  }

  async deleteOrphanedSlots() {
    try {
      // Query to find all inactive replication slots
      const findInactiveSlotsQuery = `
        SELECT slot_name 
        FROM pg_replication_slots 
        WHERE active = false;
      `;

      const result = await this.client.query(findInactiveSlotsQuery);

      // Loop through and delete each inactive slot
      for (const row of result.rows) {
        const slotName = row.slot_name;
        try {
          await this.deleteSlot(slotName);
          this.logger.info({
            message: `Orphaned replication slot ${slotName} deleted successfully.`,
            where: `ReplicationService.deleteOrphanedSlots`,
          });
        } catch (error) {
          this.logger.error({
            message: `Error deleting replication slot ${slotName}:`,
            where: `ReplicationService.deleteOrphanedSlots`,
            error,
          });
        }
      }
    } catch (error) {
      this.logger.error({
        message: 'Error finding or deleting orphaned replication slots:',
        where: `ReplicationService.deleteOrphanedSlots`,
        error,
      });
    }
  }

  async deleteSlot(name: string) {
    try {
      const deleteReplicationSlotQuery = `SELECT pg_drop_replication_slot('${name}')`;

      await this.client.query(deleteReplicationSlotQuery);
    } catch (err) {
      this.logger.error({
        message: `Drop relication slot: ${JSON.stringify(err)}`,
      });
    }
  }

  async checkForSlot() {
    const checkReplicationSlotQuery = `
    SELECT * FROM pg_replication_slots WHERE slot_name = '${this.replicationSlotName}'
  `;

    const checkSlotResult = await this.client.query(checkReplicationSlotQuery);

    if (checkSlotResult.rows.length > 0) {
      await this.deleteSlot(this.replicationSlotName);
    }
  }

  async createReplicationSlot() {
    try {
      await this.checkForSlot();

      const createReplicationSlotQuery = `
        SELECT * FROM pg_create_logical_replication_slot(
          '${this.replicationSlotName}',
          '${REPLICATION_SLOT_PLUGIN}'
        )
      `;

      // Create replication slot
      const result = await this.client.query(createReplicationSlotQuery);

      this.logger.info({
        message: 'Replication slot created successfully:',
        where: `ReplicationService.createReplicationSlot`,
        payload: { row: result.rows[0] },
      });
    } catch (error) {
      this.logger.error({
        message: 'Error creating replication slot:',
        where: `ReplicationService.createReplicationSlot`,
        error,
      });
    }
  }

  getChangedData(change: logChangeType) {
    // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style, @typescript-eslint/no-explicit-any
    const changedData: { [key: string]: { oldValue: any; newValue: any } } = {};
    const keyNames = change.oldkeys?.keynames || [];
    const oldValues = change.oldkeys?.keyvalues || [];
    const columnNames = change.columnnames || [];
    const newValues = change.columnvalues || [];

    // Create a map of old values by key name
    // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style, @typescript-eslint/no-explicit-any
    const oldValueMap: { [key: string]: any } = {};
    keyNames.forEach((keyName, index) => {
      oldValueMap[keyName] = oldValues[index];
    });

    // Compare each column to see if the value has changed
    columnNames.forEach((columnName, index) => {
      const oldValue = oldValueMap[columnName];
      const newValue = newValues[index];

      // Check if the old value and new value are different
      if (
        oldValue !== newValue &&
        oldValue !== 'undefined' &&
        newValue !== null
      ) {
        changedData[columnName] = {
          oldValue,
          newValue,
        };
      }
    });

    return changedData;
  }

  async setupReplication() {
    const dbSchema = this.configService.get('DB_SCHEMA');
    const clientConfig = {
      host: this.configService.get('DB_HOST'),
      database: this.configService.get('POSTGRES_DB'),
      user: this.configService.get('POSTGRES_USER'),
      password: this.configService.get('POSTGRES_PASSWORD'),
      port: this.configService.get('DB_PORT'),
    };
    const service = new LogicalReplicationService(clientConfig);
    const plugin = new Wal2JsonPlugin({});
    service
      .subscribe(plugin, this.replicationSlotName)
      .catch((e) => {
        this.logger.error({ message: `WAL error: ${JSON.stringify(e)}` });
      })
      .then(() => {
        this.logger.info({
          message: 'Replication server connected',
          where: `ReplicationService.setupReplication`,
        });
      });

    service.on('data', (_lsn: string, log: logType) => {
      // log contains change data in JSON format
      if (log.change) {
        log.change.forEach(async (change: logChangeType) => {
          if (change.schema !== dbSchema || change.kind === 'delete') {
            return;
          }

          // Log or process the changed data
          const { columnvalues, columnnames } = change;
          const modelName = change.table as ModelNameEnum;
          const deletedIndex = columnnames?.indexOf('deleted');
          const isDeleted = deletedIndex !== -1 && !!columnvalues[deletedIndex];
          const idIndex = columnnames.indexOf('id');
          const modelId = columnvalues[idIndex];

          if (tablesToSendMessagesFor.has(modelName)) {
            const syncActionData =
              await this.syncActionsService.upsertSyncAction(
                _lsn,
                isDeleted ? 'delete' : change.kind,
                modelName,
                modelId,
              );

            const recipientId = syncActionData.workspaceId;

            this.syncGateway.wss
              .to(recipientId)
              .emit('message', JSON.stringify(syncActionData));
          }

          // this will create problem in scaling
          if (tableHooks.has(modelName)) {
            const changedData = this.getChangedData(change);
            if (ModelNameEnum.Page === modelName) {
              this.pagesService.handleHooks({
                pageId: modelId,
                changedData,
                action: convertToActionType(isDeleted ? 'delete' : change.kind),
              });
            }

            if (
              ModelNameEnum.Activity === modelName &&
              change.kind === 'insert'
            ) {
              this.activity.runActivity(modelId);
            }

            if (ModelNameEnum.List === modelName) {
              await tasks.trigger<typeof listActivityHandler>(
                'list-activity-handler',
                {
                  listId: modelId,
                  action: convertToActionType(
                    isDeleted ? 'delete' : change.kind,
                  ),
                },
              );
            }

            if (ModelNameEnum.Task === modelName) {
              this.taskHooksService.executeHookWithId(
                modelId,
                convertToActionType(isDeleted ? 'delete' : change.kind),
                changedData,
              );
            }
          }
        });
      } else {
        this.logger.info({ message: 'No change data in log' });
      }
    });
  }

  async setupReplicationIdentity() {
    try {
      for (const [tableName] of tableHooks) {
        const query = `ALTER TABLE sigma."${tableName}" REPLICA IDENTITY FULL;`;
        await this.client.query(query);
        this.logger.info({
          message: `Set REPLICA IDENTITY FULL for table ${tableName}`,
          where: 'ReplicationService.setupReplicationIdentity',
        });
      }
    } catch (error) {
      this.logger.error({
        message: 'Error setting REPLICA IDENTITY',
        where: 'ReplicationService.setupReplicationIdentity',
        error,
      });
    }
  }
}

function convertToActionType(action: string): TaskHookAction {
  switch (action.toLowerCase()) {
    case 'insert':
      return 'create';
    case 'update':
      return 'update';
    case 'delete':
      return 'delete';
  }

  return null;
}
