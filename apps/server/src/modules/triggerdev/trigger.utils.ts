/* eslint-disable @typescript-eslint/no-explicit-any */

import { Knex as KnexT } from 'knex';
import { v4 as uuidv4 } from 'uuid'; // Import uuid for generating unique identifiers

export const NULL_SENTINEL = '$@null((';
import nodeCrypto from 'node:crypto';

import { LoggerService } from 'modules/logger/logger.service';

// Trigger functions
// Check if a project exists based on the provided whereClause
export async function createOrg(knex: KnexT, logger: LoggerService) {
  const commonId = process.env.TRIGGER_COMMON_ID;

  try {
    // Check if user already exists
    const existingUser = await knex('User').where({ id: commonId }).first();

    if (existingUser) {
      logger.info({
        message: `Trigger user already exist`,
        where: `TriggerdevService.createOrg`,
      });
      return; // User already exists, no need to proceed
    }

    // Create new entries using a transaction
    await knex.transaction(async (trx) => {
      // Create User
      await trx('User').insert({
        id: commonId,
        admin: true,
        authenticationMethod: 'MAGIC_LINK',
        displayName: 'Harshith',
        email: 'harshith@tegon.ai',
        name: 'Harshith',
        confirmedBasicDetails: true,
        updatedAt: new Date(),
      });

      // Create Organization
      await trx('Organization').insert({
        id: commonId,
        slug: 'tegon',
        title: 'Tegon',
        v3Enabled: true,
        updatedAt: new Date(),
      });

      // Create OrgMember
      await trx('OrgMember').insert({
        id: commonId,
        organizationId: commonId,
        userId: commonId,
        role: 'ADMIN',
        updatedAt: new Date(),
      });
    });
  } catch (error) {
    // Re-throw any errors that occur
    logger.error({
      message: `Error creating org`,
      where: `TriggerdevService.org`,
      error,
    }); // Log an error if project creation fails
  }
}

export async function checkIfProjectExist(
  whereClause: {
    name?: string;
    slug?: string;
    id?: string;
  },
  knex: KnexT,
): Promise<boolean> {
  const project = await getProject(whereClause, knex); // Get the project based on the whereClause
  return !!project; // Return true if a project exists, false otherwise
}

async function getProject(
  whereClause: {
    name?: string;
    slug?: string;
    id?: string;
  },
  knex: KnexT,
) {
  try {
    const response = await knex('Project')
      .where(whereClause) // Filter projects based on the provided whereClause
      .select('id', 'name', 'slug'); // Select the ID, name, and slug columns

    return response[0]; // Return the first project matching the whereClause
  } catch (e) {
    return undefined; // Return undefined if an error occurs
  }
}

// Create personal token taking from the .env
// Used to deploy the tegon backgrounds
export async function createPersonalToken(knex: KnexT) {
  const commonId = process.env.TRIGGER_COMMON_ID;
  const id = uuidv4().replace(/-/g, ''); // Generate a unique ID for the personal access token

  const response = await knex('PersonalAccessToken')
    .where({
      userId: commonId, // Filter by the common project user ID
    })
    .select('id'); // Select the ID column

  if (response.length > 0) {
    return; // Return if a personal access token already exists
  }

  await knex('PersonalAccessToken').insert({
    id, // ID of the personal access token
    name: 'cli', // Name of the personal access token
    userId: commonId, // User ID associated with the personal access token
    updatedAt: new Date(), // Updated timestamp
    obfuscatedToken: process.env.TRIGGER_ACCESS_TOKEN, // Obfuscated token from environment variable
    hashedToken: hashToken(process.env.TRIGGER_ACCESS_TOKEN), // Hashed token using the hashToken utility function
    encryptedToken: encryptToken(process.env.TRIGGER_ACCESS_TOKEN), // Encrypted token using the encryptToken utility function
  });
}

// Create a new project with the given name, slug, and optional secret key
export async function createProject(
  name: string,
  slug: string,
  secretKey: string,
  knex: KnexT,
  logger: LoggerService,
) {
  try {
    const id = uuidv4().replace(/-/g, ''); // Generate a unique ID for the project
    slug = slug.replace(/-/g, ''); // Remove hyphens from the slug
    const secret = secretKey ? secretKey : id; // Use the provided secret key or the project ID as the secret
    const commonId = process.env.TRIGGER_COMMON_ID;

    await knex.transaction(async (trx) => {
      await knex('Project')
        .insert({
          id, // Project ID
          name, // Project name
          organizationId: commonId, // Organization ID (common project ID)
          slug, // Project slug
          externalRef: `proj_${slug}`, // External reference for the project
          version: 'V3', // Project version
          updatedAt: new Date(), // Updated timestamp
        })
        .transacting(trx); // Use the transaction

      await knex('RuntimeEnvironment')
        .insert(
          ['dev', 'prod'].map((env: string) => ({
            id: uuidv4(), // Generate a unique ID for the runtime environment
            slug: env, // Slug for the runtime environment (dev or prod)
            apiKey: `tr_${env}_${secret}`, // API key for the runtime environment
            organizationId: commonId, // Organization ID (common project ID)
            orgMemberId: commonId, // Organization member ID (common project ID)
            projectId: id, // Project ID
            type: env === 'prod' ? 'PRODUCTION' : 'DEVELOPMENT', // Type of the runtime environment (production or development)
            pkApiKey: `tr_pk_${env}${secret}`, // Primary key API key for the runtime environment
            shortcode: env, // Shortcode for the runtime environment (dev or prod)
            updatedAt: new Date(), // Updated timestamp
          })),
        )
        .transacting(trx); // Use the transaction
    });

    return id; // Return the project ID
  } catch (error) {
    logger.error({
      message: `Error creating project`,
      where: `TriggerdevService.createProject`,
      error,
    }); // Log an error if project creation fails

    return undefined; // Return undefined if an error occurs
  }
}

export function encryptToken(value: string) {
  const nonce = nodeCrypto.randomBytes(12);
  const cipher = nodeCrypto.createCipheriv(
    'aes-256-gcm',
    process.env.TRIGGER_TOKEN,
    nonce,
  );

  let encrypted = cipher.update(value, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const tag = cipher.getAuthTag().toString('hex');

  return {
    nonce: nonce.toString('hex'),
    ciphertext: encrypted,
    tag,
  };
}

export function hashToken(token: string): string {
  const hash = nodeCrypto.createHash('sha256');
  hash.update(token);
  return hash.digest('hex');
}
