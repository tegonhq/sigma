import { JsonObject } from '../common';
import { IntegrationAccount } from '../integration-account';
import { Workspace } from '../workspace';

export class OAuth2Params {
  authorization_url: string;
  authorization_params?: Record<string, string>;
  default_scopes?: string[];
  scope_separator?: string;
  scope_identifier?: string;
  token_url: string;
  token_params?: Record<string, string>;
  redirect_uri_metadata?: string[];
  token_response_metadata?: string[];
  token_expiration_buffer?: number; // In seconds.
  scopes?: string[];
}

export type AuthType = 'OAuth2' | 'APIKey';

export class APIKeyParams {
  'header_name': string;
  'format': string;
}

export class Spec {
  auth: Record<string, OAuth2Params | APIKeyParams>;
  other_data?: JsonObject;
}

export class IntegrationDefinition {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deleted: Date | null;
  name: string;
  slug: string;
  description: string;
  icon: string;
  config?: any;
  spec?: any;
  version?: string;
  url?: string;
  workspace?: Workspace;
  workspaceId?: string;
  IntegrationAccount?: IntegrationAccount[];
}

export class PublicIntegrationDefinition {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deleted: Date | null;
  name: string;
  slug: string;
  description: string;
  icon: string;
  config?: any;
  spec?: Spec;
  workspace?: Workspace;
  workspaceId?: string;
  IntegrationAccount?: IntegrationAccount[];
}
