export interface GenericInputSpecification {
  input_specification?: {
    type: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    properties: Record<string, any>;
  };
}

export interface AuthSpecification extends GenericInputSpecification {
  token_url?: string;
  auth_mode?: string;
  authorization_url?: string;
  authorization_params?: Record<string, string>;
  token_params?: Record<string, string>;
  refresh_params?: Record<string, string>;
  scope_seperator?: string;
  default_scopes?: string[];
  headers?: Record<string, string>;
}

export interface Specification {
  auth_specification: Record<string, AuthSpecification>;
  other_inputs?: GenericInputSpecification;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  other_data?: Record<string, any>;
}

export interface IntegrationDefinitionType {
  id: string;
  createdAt: string;
  updatedAt: string;

  name: string;
  icon: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  spec: any;
  workspaceId: string;

  url: string;
  version: string;
}
