import type { ActivityType } from 'common/types';

export function groupActivities(activities: ActivityType[]) {
  // Create an object to store grouped activities
  const grouped: Record<string, ActivityType[]> = {};

  // Sort activities by createdAt in descending order (newest first)
  const sortedActivities = [...activities].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  // Group activities by date
  sortedActivities.forEach((activity) => {
    // Get date part only from createdAt (YYYY-MM-DD)
    const date = new Date(activity.createdAt).toISOString().split('T')[0];

    // Initialize array for date if it doesn't exist
    if (!grouped[date]) {
      grouped[date] = [];
    }

    // Add activity to the corresponding date group
    grouped[date].push(activity);
  });

  return grouped;
}
