import { Injectable } from '@nestjs/common';
import Knex, { Knex as KnexT } from 'knex';
import { v4 as uuidv4 } from 'uuid'; // Import uuid for generating unique identifiers

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
        slug: 'common', // Check if a project with the slug 'common' exists
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
        'Common',
        'common',
        uuidv4().replace(/-/g, ''),
        this.knex,
        this.logger,
      ); // Create the common project
    }
  }
}
