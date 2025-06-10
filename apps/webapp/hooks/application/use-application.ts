import {
  TabViewType,
  type FiltersModelType,
  type UpdateBody,
  type UpdateDisplaySettingsBody,
} from 'store/application';
import { useContextStore } from 'store/global-context-provider';
import { historyManager } from 'store/history';

export const useApplication = () => {
  const { applicationStore } = useContextStore();
  const { rightScreenCollapsed } = applicationStore;

  const getTabGroup = () => {
    const tabGroup = applicationStore.getTabGroup();
    return tabGroup;
  };

  const addTab = () => {
    getTabGroup().addTab();
  };

  const setActiveTab = (tabId: string) => {
    getTabGroup().setActiveTab(tabId);
    historyManager.save(applicationStore);
  };

  const removeTab = (tabId: string) => {
    getTabGroup().removeTab(tabId);
  };

  const back = async () => {
    historyManager.goBack(applicationStore);
  };

  const forward = async () => {
    historyManager.goForward(applicationStore);
  };

  // Tab related function
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateActiveTabData = (data: any) => {
    getTabGroup().activeTab.updateData(data);
  };

  // Tab related function
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateTabData = (index: number, data: any) => {
    const tab = getTabGroup().tabs[index];
    tab.updateData(data);
    historyManager.save(applicationStore);
  };

  const updateConversationId = (conversationId: string) => {
    const activeTab = getTabGroup().activeTab;

    activeTab.updateConversationId(conversationId);

    historyManager.save(applicationStore);
  };

  const changeActiveTab = (
    type: TabViewType,
    {
      entityId,
      conversationId,
      data,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }: { entityId?: string; conversationId?: string; data?: any },
  ) => {
    const activeTab = getTabGroup().activeTab;

    activeTab.changeType(type, entityId);
    activeTab.updateConversationId(conversationId);
    activeTab.updateData(data);

    historyManager.save(applicationStore);
  };

  const updateRightScreen = (tab: string) => {
    const secondTab = getTabGroup().tabs[1];
    if (secondTab.type !== tab) {
      secondTab.changeType(tab as TabViewType);
      applicationStore.updateRightScreen(false);
    } else if (secondTab.type === tab && rightScreenCollapsed) {
      applicationStore.updateRightScreen(false);
    } else if (!rightScreenCollapsed && secondTab.type === tab) {
      applicationStore.updateRightScreen(true);
    }
  };

  const updateDisplaySettings = (
    displaySettings: UpdateDisplaySettingsBody,
  ) => {
    applicationStore.updateDisplaySettings(displaySettings);

    historyManager.save(applicationStore);
  };

  const deleteFilter = (filter: keyof FiltersModelType) => {
    applicationStore.deleteFilter(filter);

    historyManager.save(applicationStore);
  };

  const updateFilters = (updateBody: UpdateBody) => {
    applicationStore.updateFilters(updateBody);

    historyManager.save(applicationStore);
  };

  return {
    activeTab: getTabGroup().activeTab,
    addTab,
    removeTab,
    back,
    forward,
    tabs: getTabGroup()?.tabs,
    displaySettings: applicationStore.displaySettings,
    filters: applicationStore.filters,

    setActiveTab,
    updateTabData,
    updateActiveTabData,
    changeActiveTab,
    updateConversationId,
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

    // Filter and display in tasks
    updateDisplaySettings,
    deleteFilter,
    updateFilters,
  };
};
