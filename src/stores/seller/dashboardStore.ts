import { create } from 'zustand';
import { SellerDashboardUIState } from '@/types';

export const useSellerDashboardUIStore = create<SellerDashboardUIState>((set, get) => ({
  selectedMetric: 'revenue',
  showDetailedView: false,
  expandedSections: [],
  selectedTimeRange: '30days',

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

  setSelectedTimeRange: (range) => set({ selectedTimeRange: range }),

  reset: () => set({ 
    selectedMetric: 'revenue',
    showDetailedView: false,
    expandedSections: [],
    selectedTimeRange: '30days'
  }),
}));
