import { applySnapshot, flow, types, type Instance } from 'mobx-state-tree';
import { v4 as uuidv4 } from 'uuid'; // Make sure to install and import uuid

import { sigmaDatabase } from 'store/database';

import {
  type ApplicationStoreType,
  type TabType,
  type TabGroupType,
  FiltersModel,
  DisplayViewModel,
  type UpdateBody,
  type FiltersModelType,
  type UpdateDisplaySettingsBody,
  type DisplaySettingsModelType,
  TimeBasedFilterEnum,
  GroupingEnum,
} from './types';
import { historyLoad } from 'store/history';

const initialId = uuidv4();

const Tab = types
  .model({
    id: types.identifier,
    entity_id: types.union(types.string, types.undefined),
    type: types.enumeration([
      'my_day',
      'my_tasks',
      'lists',
      'instructions',
      'ai',
    ]),
    order: types.number,
    data: types.frozen(),
  })
  .actions((self) => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateData(data: any) {
      self.data = { ...self.data, ...data };
    },

    changeType(type: string, entity_id?: string) {
      self.type = type;
      if (entity_id) {
        self.entity_id = entity_id;
      } else {
        self.entity_id = undefined;
      }
    },
  }));

const TabGroup = types
  .model({
    id: types.identifier,
    tabs: types.array(Tab),
    activeTab: types.maybe(types.reference(Tab)),
  })
  .actions((self) => ({
    setActiveTab(tabId: string) {
      self.activeTab = self.tabs.find((tab) => tab.id === tabId);
    },

    addTab(tab?: Instance<typeof Tab>) {
      if (!tab) {
        const id = uuidv4();
        const newTab = Tab.create({
          id,
          entity_id: undefined,
          type: 'my_day',
          order: 0,
          data: {},
        });
        self.tabs.push(newTab);
        self.activeTab = newTab;
      } else {
        self.tabs.push(tab);
        self.activeTab = tab;
      }
    },
    removeTab(tabId: string) {
      const tab = self.tabs.find((tab) => tab.id === tabId);
      const index = self.tabs.findIndex((tab) => tab.id === tabId);

      if (self.tabs.length === 1) {
        return;
      }

      if (tab !== undefined) {
        if (self.activeTab === tab) {
          if (self.tabs.length === 1) {
            self.activeTab = undefined;
          } else {
            const nextIndex =
              index + 1 < self.tabs.length ? index + 1 : index - 1;
            self.activeTab = self.tabs[nextIndex];
          }
        }
        self.tabs.splice(index, 1);
      }
    },
  }));

export const defaultApplicationStoreValue: {
  rightScreenCollapsed: boolean;
  tabGroups: Array<Instance<typeof TabGroup>>;
  selectedTasks: string[];
  filters: FiltersModelType;
  displaySettings: DisplaySettingsModelType;
} = {
  rightScreenCollapsed: true,
  tabGroups: [
    TabGroup.create({
      id: uuidv4(),
      tabs: [
        {
          id: initialId,
          entity_id: 'my_day',
          type: 'my_day',
          order: 0,
          data: { date: new Date() },
        },
        {
          id: uuidv4(),
          entity_id: 'ai',
          type: 'ai',
          order: 0,
          data: {},
        },
      ],
      activeTab: initialId,
    }),
  ],
  filters: {},
  displaySettings: {
    grouping: GroupingEnum.schedule,
    completedFilter: TimeBasedFilterEnum.All,
    showEmptyGroups: false,
  },
  selectedTasks: [],
};

const ApplicationStore = types
  .model({
    rightScreenCollapsed: types.boolean,
    tabGroups: types.array(TabGroup),
    activeTabGroupId: types.maybe(types.reference(TabGroup)),
    id: initialId,
    selectedTasks: types.array(types.string),
    hoverTask: types.union(types.string, types.undefined),
    filters: FiltersModel,
    displaySettings: DisplayViewModel,
  })
  .actions((self) => {
    const updateRightScreen = (collapsed: boolean) => {
      self.rightScreenCollapsed = collapsed;
    };

    const load = flow(function* () {
      const data = yield sigmaDatabase.application.toArray();
      if (data[0] && data[0].id !== self.id) {
        try {
          applySnapshot(self, data[0]);
          historyLoad(data[0]);
        } catch (e) {}
      }
    });
    const addToSelectedTask = (taskId: string, reset: boolean) => {
      if (reset) {
        self.selectedTasks.replace([taskId]);
      } else {
        self.selectedTasks.push(taskId);
      }
    };
    const removeSelectedTask = (taskId: string) => {
      if (self.selectedTasks.length === 1) {
        self.selectedTasks.replace([]);
      } else {
        const index = self.selectedTasks.indexOf(taskId);
        self.selectedTasks.splice(index, 1);
      }
    };
    const clearSelectedTask = () => {
      self.selectedTasks.replace([]);
    };
    const setHoverTask = (taskId: string) => {
      self.hoverTask = taskId;
    };

    const updateFilters = (updateBody: UpdateBody) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const currentFilters = (self.filters as any).toJSON();

      const toUpdateBody = { ...updateBody };
      const mergedAttributes = {
        ...currentFilters,
        ...toUpdateBody,
      };

      self.filters = FiltersModel.create(mergedAttributes);
    };

    const deleteFilter = (filter: keyof FiltersModelType) => {
      self.filters[filter] = undefined;
    };

    const updateDisplaySettings = (updateBody: UpdateDisplaySettingsBody) => {
      self.displaySettings = { ...self.displaySettings, ...updateBody };
    };

    return {
      load,
      updateRightScreen,
      addToSelectedTask,
      removeSelectedTask,
      clearSelectedTask,
      setHoverTask,
      updateFilters,
      deleteFilter,
      updateDisplaySettings,
    };
  })
  .views((self) => ({
    getTabs() {
      return self.tabGroups[0].tabs;
    },

    getTabGroup() {
      return self?.tabGroups[0];
    },
  }));

export type { ApplicationStoreType, TabType, TabGroupType };
export { ApplicationStore };
