import { applySnapshot, flow, types, type Instance } from 'mobx-state-tree';
import { v4 as uuidv4 } from 'uuid'; // Make sure to install and import uuid

import { sigmaDatabase } from 'store/database';

import {
  type ApplicationStoreType,
  type TabType,
  type TabGroupType,
} from './types';

const initialId = uuidv4();

const Tab = types
  .model({
    id: types.identifier,
    entity_id: types.string,
    type: types.enumeration([
      'my_day',
      'my_tasks',
      'instructions',
      'activity',
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
        self.entity_id = type;
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
};

const ApplicationStore = types
  .model({
    rightScreenCollapsed: types.boolean,
    tabGroups: types.array(TabGroup),
    activeTabGroupId: types.maybe(types.reference(TabGroup)),
    id: initialId,
  })
  .actions((self) => {
    const updateRightScreen = (collapsed: boolean) => {
      self.rightScreenCollapsed = collapsed;
    };

    const load = flow(function* () {
      const data = yield sigmaDatabase.application.toArray();
      if (data[0] && data[0].id !== self.id) {
        applySnapshot(self, data[0]);
      }
    });

    return { load, updateRightScreen };
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
