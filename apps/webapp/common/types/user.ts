interface Workspace {
  name: string;
  slug: string;
  icon: string;
  id: string;
  preferences?: {
    timezone?: string;
    scheduleId?: string;
    autonomy?: number;
    tone?: number;
    playfulness?: number;

    memory_host?: string;
    memory_api_key?: string;
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
