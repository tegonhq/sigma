interface Workspace {
  name: string;
  slug: string;
  icon: string;
  id: string;
  preferences?: {
    timezone?: string;
  };
}

export interface User {
  fullname: string;
  email: string;
  id: string;
  username: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mcp: any;
  workspace: Workspace;
  image?: string;
}
