import type { ModuleFilterConfig } from '@/shared/types/data-filter'

export const leaderboardManagementFilterConfig: ModuleFilterConfig = {
  moduleKey: 'leaderboard-management',
  moduleName: 'Leaderboard Management',
  sections: [
    {
      id: 'by-leaderboard',
      title: 'By Leaderboard',
      defaultExpanded: true,
      fields: [
        {
          id: 'rank',
          label: 'Rank',
          type: 'number-range',
          fromPlaceholder: '1',
          toPlaceholder: '100',
        },
        {
          id: 'expertId',
          label: 'Expert ID',
          type: 'search',
          placeholder: 'Enter Expert ID',
        },
        {
          id: 'name',
          label: 'Expert Name',
          type: 'search',
          placeholder: 'Enter Expert Name',
        },
        {
          id: 'type',
          label: 'Type',
          type: 'checkbox-group',
          options: [
            { label: 'Concierge', value: 'concierge' },
            { label: 'Venue', value: 'venue' },
          ],
        },
        {
          id: 'region',
          label: 'Region',
          type: 'checkbox-group',
          options: [
            { label: 'Regional', value: 'regional' },
            { label: 'Pan India', value: 'panindia' },
          ],
        },
        {
          id: 'category',
          label: 'Category',
          type: 'checkbox-group',
          options: [
            { label: 'Entertainment', value: 'Entertainment' },
            { label: 'Music', value: 'Music' },
            { label: 'Dance', value: 'Dance' },
            { label: 'Sports', value: 'Sports' },
            { label: 'Technology', value: 'Technology' },
            { label: 'Legal', value: 'Legal' },
          ],
        },
        {
          id: 'location',
          label: 'Location',
          type: 'search',
          placeholder: 'Enter Location',
        },
        {
          id: 'events',
          label: 'No. Of Events',
          type: 'number-range',
          fromPlaceholder: '0',
          toPlaceholder: '1000',
        },
        {
          id: 'rating',
          label: 'Ratings',
          type: 'number-range',
          fromPlaceholder: '0.0',
          toPlaceholder: '5.0',
        },
        {
          id: 'score',
          label: 'Score / Points',
          type: 'number-range',
          fromPlaceholder: '0',
          toPlaceholder: '1000',
        },
        {
          id: 'isPremier',
          label: 'Is Premier',
          type: 'checkbox-group',
          options: [
            { label: 'Yes', value: 'true' },
            { label: 'No', value: 'false' },
          ],
        },
      ],
    },
  ],
}
