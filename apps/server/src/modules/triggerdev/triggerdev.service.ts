import { Injectable } from '@nestjs/common';
import Knex, { Knex as KnexT } from 'knex';

import { LoggerService } from 'modules/logger/logger.service';

import {
  checkIfProjectExist,
  createOrg,
  createPersonalToken,
  createProject,
} from './trigger.utils';

export const TriggerProjects = {
  Common: 'common', // Define a constant for the common project
};

@Injectable()
export class TriggerdevService {
  private readonly logger: LoggerService = new LoggerService('TriggerService'); // Logger instance for logging
  knex: KnexT; // Knex instance for database operations

  constructor() {
    this.knex = Knex({
      client: 'pg', // Use PostgreSQL as the database client
      connection: process.env.TRIGGER_DATABASE_URL, // Database connection URL from environment variable
    });
  }

  afterInit() {
    this.logger.info({
      message: 'Trigger service Module initiated',
      where: `TriggerdevService.afterInit`,
    }); // Log a message after initialization
  }

  async initCommonProject() {
    await createOrg(this.knex, this.logger);

    const commonProjectExists = await checkIfProjectExist(
      {
        slug: 'sol_common', // Check if a project with the slug 'common' exists
      },
      this.knex,
    );

    createPersonalToken(this.knex); // Create a personal access token

    if (!commonProjectExists) {
      this.logger.info({
        message: `Common project doesn't exist`,
        where: `TriggerdevService.initCommonProject`,
      }); // Log a message if the common project doesn't exist
      await createProject(
        'Sol Common',
        'sol_common',
        process.env.TRIGGER_TOKEN,
        this.knex,
        this.logger,
      ); // Create the common project
    }
  }
}
