import { subMinutes, isAfter, parseISO, isBefore } from 'date-fns';
import { type IAnyStateTreeNode, types, flow } from 'mobx-state-tree';

import type { AgentWorklogType } from 'common/types';

import { solDatabase } from 'store/database';

import { AgentWorklog } from './models';

export const AgentWorklogsStore: IAnyStateTreeNode = types
  .model({
    agentWorklogs: types.array(AgentWorklog),
    workspaceId: types.union(types.string, types.undefined),
  })
  .actions((self) => {
    const update = (agentWorklog: AgentWorklogType, id: string) => {
      const indexToUpdate = self.agentWorklogs.findIndex(
        (obj) => obj.id === id,
      );

      if (indexToUpdate !== -1) {
        // Update the object at the found index with the new data
        self.agentWorklogs[indexToUpdate] = {
          ...self.agentWorklogs[indexToUpdate],
          ...agentWorklog,
          // TODO fix the any and have a type with Issuetype
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;
      } else {
        self.agentWorklogs.push(agentWorklog);
      }
    };
    const deleteById = (id: string) => {
      const indexToDelete = self.agentWorklogs.findIndex(
        (obj) => obj.id === id,
      );

      if (indexToDelete !== -1) {
        self.agentWorklogs.splice(indexToDelete, 1);
      }
    };

    const load = flow(function* () {
      const agentWorklogs = yield solDatabase.agentWorklogs.toArray();

      // Get current time and calculate 10 minutes ago

      const now = new Date();
      const tenMinutesAgo = subMinutes(now, 10);

      // Filter logs created in the last 10 minutes
      const recentLogs = agentWorklogs.filter((log: AgentWorklogType) => {
        const createdAt = parseISO(log.createdAt);

        return isAfter(createdAt, tenMinutesAgo);
      });

      // Sort the recent logs by updatedAt (newest first)
      const sortedLogs = [...recentLogs].sort((a, b) =>
        b.updatedAt.localeCompare(a.updatedAt),
      );

      // Delete logs older than 10 minutes from the database
      const oldLogIds = agentWorklogs
        .filter((log: AgentWorklogType) => {
          const createdAt = parseISO(log.createdAt);

          return isBefore(createdAt, tenMinutesAgo);
        })
        .map((log: AgentWorklogType) => log.id);

      if (oldLogIds.length > 0) {
        yield solDatabase.agentWorklogs.bulkDelete(oldLogIds);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      self.agentWorklogs = sortedLogs as any;
    });

    return { update, deleteById, load };
  })
  .views((self) => ({
    get getAgentWorklogs() {
      return self.agentWorklogs;
    },
    getAgentWorklogForTask(taskId: string) {
      return self.agentWorklogs.find((ag) => ag.modelId === taskId);
    },
  }));

export interface AgentWorklogStoreType {
  agentWorklogs: AgentWorklogType[];
  workspaceId: string;

  update: (agentWorklog: AgentWorklogType, id: string) => Promise<void>;
  deleteById: (id: string) => Promise<void>;
  load: () => Promise<void>;

  getAgentWorklogs: AgentWorklogType[];
  getAgentWorklogForTask: (taskId: string) => AgentWorklogType[];
}
