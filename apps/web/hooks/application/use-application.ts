import type { TabViewType } from 'store/application';
import { useContextStore } from 'store/global-context-provider';
import { historyManager } from 'store/history';

export const useApplication = () => {
  const { applicationStore } = useContextStore();
  const tabGroup = applicationStore.getTabGroup();

  const addTab = () => {
    tabGroup.addTab();
    saveSnapshot();
  };

  const setActiveTab = (tabId: string) => {
    tabGroup.setActiveTab(tabId);
    saveSnapshot();
  };

  const removeTab = (tabId: string) => {
    tabGroup.removeTab(tabId);
    saveSnapshot();
  };

  const saveSnapshot = async () => {
    historyManager.pushSnapshot(applicationStore);
  };

  const back = async () => {
    historyManager.goBack(applicationStore);
  };

  const forward = async () => {
    historyManager.goForward(applicationStore);
  };

  // Tab related function
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateTabData = (data: any) => {
    tabGroup.activeTab.updateData(data);
    saveSnapshot();
  };

  const updateTabType = (type: TabViewType, entityId?: string) => {
    tabGroup.activeTab.changeType(type, entityId);
    saveSnapshot();
  };

  return {
    activeTab: tabGroup.activeTab,
    addTab,
    removeTab,
    tabs: tabGroup.tabs,
    forward,
    back,
    setActiveTab,
    updateTabData,
    updateTabType,
    sidebarCollapsed: applicationStore.sidebarCollapsed,
    rightScreenCollapsed: applicationStore.rightScreenCollapsed,
    updateRightScreen: applicationStore.updateRightScreen,
    updateSideBar: applicationStore.updateSideBar,
  };
};
