import { TabViewType } from 'store/application';
import { useContextStore } from 'store/global-context-provider';
import { historyManager } from 'store/history';
export const useApplication = () => {
  const { applicationStore } = useContextStore();
  const { rightScreenCollapsed } = applicationStore;
  const tabGroup = applicationStore.getTabGroup();

  const addTab = () => {
    tabGroup.addTab();
  };

  const setActiveTab = (tabId: string) => {
    tabGroup.setActiveTab(tabId);
  };

  const removeTab = (tabId: string) => {
    tabGroup.removeTab(tabId);
  };

  // Tab related function
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateActiveTabData = (data: any) => {
    tabGroup.activeTab.updateData(data);
  };

  // Tab related function
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateTabData = (index: number, data: any) => {
    const tab = tabGroup.tabs[index];
    tab.updateData(data);
    historyManager.save(applicationStore);
  };

  const updateTabType = (
    index: number,
    type: TabViewType,
    entityId?: string,
  ) => {
    const tab = tabGroup.tabs[index];

    tab.changeType(type, entityId);
    historyManager.save(applicationStore);
  };

  const updateRightScreen = (tab: string) => {
    const secondTab = tabGroup.tabs[1];
    if (secondTab.type !== tab) {
      secondTab.changeType(tab as TabViewType);
      applicationStore.updateRightScreen(false);
    } else if (secondTab.type === tab && rightScreenCollapsed) {
      applicationStore.updateRightScreen(false);
    } else if (!rightScreenCollapsed && secondTab.type === tab) {
      applicationStore.updateRightScreen(true);
    }
  };

  return {
    activeTab: tabGroup.activeTab,
    addTab,
    removeTab,
    tabs: tabGroup.tabs,
    setActiveTab,
    updateTabData,
    updateActiveTabData,
    updateTabType,
    rightScreenCollapsed: applicationStore.rightScreenCollapsed,
    updateRightScreen,
    closeRightScreen: () => applicationStore.updateRightScreen(true),

    // Hover issues and selected
    hoverTask: applicationStore.hoverTask,
    selectedTasks: applicationStore.selectedTasks,
    setHoverTask: applicationStore.setHoverTask,
    clearSelectedTask: applicationStore.clearSelectedTask,
    addToSelectedTask: applicationStore.addToSelectedTask,
    removeSelectedTask: applicationStore.removeSelectedTask,
  };
};
