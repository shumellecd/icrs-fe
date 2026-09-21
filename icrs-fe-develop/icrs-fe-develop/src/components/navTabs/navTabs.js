export function navTabs(initialTab = null) {
  return {
    activeTab: initialTab,

    select(tab) {
      this.activeTab = tab;
    },

    isActive(tab) {
      return this.activeTab === tab;
    },
  };
}
