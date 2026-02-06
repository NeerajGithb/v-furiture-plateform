import { create } from 'zustand';
import { AnalyticsUIState } from '@/types';

export const useAnalyticsUIStore = create<AnalyticsUIState>((set, get) => ({
  selectedMetric: 'revenue',
  showDetailedView: false,
  expandedSections: [],

  setSelectedMetric: (metric: string) => set({ selectedMetric: metric }),
  
  setShowDetailedView: (show: boolean) => set({ showDetailedView: show }),
  
  toggleSection: (section: string) => {
    const { expandedSections } = get();
    const isExpanded = expandedSections.includes(section);
    
    set({
      expandedSections: isExpanded
        ? expandedSections.filter(s => s !== section)
        : [...expandedSections, section]
    });
  },

  reset: () => set({ 
    selectedMetric: 'revenue',
    showDetailedView: false,
    expandedSections: []
  }),
}));