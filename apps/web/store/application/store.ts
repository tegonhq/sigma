import { applySnapshot, flow, types, type Instance } from 'mobx-state-tree';
import { v4 as uuidv4 } from 'uuid'; // Make sure to install and import uuid

import {
  type ApplicationStoreType,
  type TabType,
  type TabGroupType,
} from './types';
import { sigmaDatabase } from 'store/database';

const initialId = uuidv4();

const Tab = types
  .model({
    id: types.identifier,
    entity_id: types.string,
    type: types.enumeration([
      'my_day',
      'page',
      'my_pages',
      'my_tasks',
      'my_events',
      'new',
    ]),
    order: types.number,
    data: types.frozen(),
  })
  .actions((self) => ({
    updateData(data: any) {
      self.data = { ...self.data, ...data };
    },
    changeType(type: string, entity_id?: string) {
      self.type = type;
      if (entity_id) {
        self.entity_id = entity_id;
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
          entity_id: 'my_day',
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
      if (tab !== undefined) {
        self.tabs.splice(index, 1);
        if (self.activeTab === tab) {
          self.activeTab = self.tabs.length > 0 ? self.tabs[0] : undefined;
        }
      }
    },
  }));

export const defaultApplicationStoreValue: {
  sidebarCollapsed: boolean;
  tabGroups: Array<Instance<typeof TabGroup>>;
} = {
  sidebarCollapsed: false,
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
      ],
      activeTab: initialId,
    }),
  ],
};

const ApplicationStore = types
  .model({
    sidebarCollapsed: types.boolean,
    tabGroups: types.array(TabGroup),
    activeTabGroupId: types.maybe(types.reference(TabGroup)),
    id: initialId,
  })
  .actions((self) => {
    const updateSideBar = (collapsed: boolean) => {
      self.sidebarCollapsed = collapsed;
    };

    const load = flow(function* () {
      const data = yield sigmaDatabase.application.toArray();
      if (data[0] && data[0].id !== self.id) {
        applySnapshot(self, data[0]);
      }
    });

    return { load, updateSideBar };
  })
  .views((self) => ({
    getTabs() {
      return self.tabGroups[0].tabs;
    },

    getTabGroup() {
      return self.tabGroups[0];
    },
  }));

export type { ApplicationStoreType, TabType, TabGroupType };
export { ApplicationStore };
