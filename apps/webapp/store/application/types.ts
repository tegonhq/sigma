import { types } from 'mobx-state-tree';

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
  LIST = 'lists',
  INSTRUCTIONS = 'instructions',
  AI = 'ai',
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

export enum FilterTypeEnum {
  IS = 'IS',
  IS_NOT = 'IS_NOT',
  INCLUDES = 'INCLUDES',
  EXCLUDES = 'EXCLUDES',
  UNDEFINED = 'UNDEFINED',
}
export interface FilterModelType {
  value: string[];
  filterType: FilterTypeEnum;
}

export interface FilterModelTimeBasedType {
  filterType: TimeBasedFilterEnum;
}

export interface FiltersModelType {
  status?: FilterModelType;
  list?: FilterModelType;
  tag?: FilterModelType;

  // For issues coming from Slack, Github
  source?: FilterModelType;
}

export interface UpdateBody {
  filters: Partial<FiltersModelType>;
}

export enum GroupingEnum {
  plan = 'plan',
  list = 'list',
  status = 'status',
}

export enum TimeBasedFilterEnum {
  All = 'All',
  PastDay = 'Past day',
  PastWeek = 'Past week',
  None = 'None',
}

export interface DisplaySettingsModelType {
  grouping: GroupingEnum;
  completedFilter: TimeBasedFilterEnum;
  showEmptyGroups: boolean;
}

export interface UpdateDisplaySettingsBody
  extends Partial<DisplaySettingsModelType> {}

export const FilterModel = types.model({
  value: types.union(types.array(types.string), types.array(types.number)),
  filterType: types.enumeration(['IS', 'IS_NOT', 'INCLUDES', 'EXCLUDES']),
});

export const FiltersModel = types.model({
  status: types.union(types.undefined, FilterModel),
  tag: types.union(types.undefined, FilterModel),
  list: types.union(types.undefined, FilterModel),

  // For issues coming from Slack, Github
  source: types.union(types.undefined, FilterModel),
});

export const DisplayViewModel = types.model({
  grouping: types.enumeration(['status', 'list', 'plan']),
  completedFilter: types.enumeration(['All', 'Past day', 'Past week', 'None']),
  showEmptyGroups: types.boolean,
});

export interface ApplicationStoreType {
  id: string;
  rightScreenCollapsed: boolean;
  tabGroups: TabGroupType[];
  activeTabGroupId: TabGroupType;
  displaySettings: DisplaySettingsModelType;
  filters: FiltersModelType;

  // Functions
  getTabGroup: () => TabGroupType;
  getTabs: () => TabType[];
  load: () => Promise<void>;
  updateRightScreen: (collapsed: boolean) => void;

  selectedTasks: string[];
  hoverTask: string;
  clearSelectedTask: () => void;
  addToSelectedTask: (taskId: string, reset: boolean) => void;
  removeSelectedTask: (taskId: string) => void;
  setHoverTask: (taskId: string) => void;

  updateFilters: (updateBody: UpdateBody) => void;
  deleteFilter: (filter: keyof FiltersModelType) => void;
  updateDisplaySettings: (updateBody: UpdateDisplaySettingsBody) => void;
}
