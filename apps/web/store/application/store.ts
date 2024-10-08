import { type IAnyStateTreeNode, type Instance, types } from 'mobx-state-tree';

export const defaultApplicationStoreValue: {
  sidebarCollapsed: boolean;
} = {
  sidebarCollapsed: false,
};

export const ApplicationStore: IAnyStateTreeNode = types
  .model({
    sidebarCollapsed: types.boolean,
  })
  .actions((self) => ({
    updateSideBar(collapsed: boolean) {
      self.sidebarCollapsed = collapsed;
    },
  }));

export type ApplicationStoreType = Instance<typeof ApplicationStore> & {
  sidebarCollapsed: boolean;
};
