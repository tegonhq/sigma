export interface TabType {
  id: string;
  entity_id: string;
  type: string;
  order: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;

  // Functions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateData: (data: any) => void;
  changeType: (type: TabViewType, entityId?: string) => void;
}

export enum TabViewType {
  MY_DAY = 'my_day',
  MY_TASKS = 'my_tasks',
  MY_PAGES = 'my_pages',
  PAGE = 'page',
}

export interface TabGroupType {
  id: string;
  tabs: TabType[];
  activeTab: TabType;

  // Functions
  addTab: (tab?: TabType) => void;
  removeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
}

export interface ApplicationStoreType {
  id: string;
  sidebarCollapsed: boolean;
  rightScreenCollapsed: boolean;
  tabGroups: TabGroupType[];
  activeTabGroupId: TabGroupType;

  // Functions
  getTabGroup: () => TabGroupType;
  getTabs: () => TabType[];
  load: () => Promise<void>;
  updateRightScreen: (collapsed: boolean) => void;
  updateSideBar: (collapsed: boolean) => void;
}
