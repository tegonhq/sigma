import { Activity, GetActivityBySourceDto, GetActivityDto } from '@sigma/types';
import axios from 'axios';

export async function getActivityById(
  activityDto: GetActivityDto,
): Promise<Activity> {
  const response = await axios.get(
    `/api/v1/activity/${activityDto.activityId}`,
  );

  return response.data;
}

export async function getActivityBySourceId(
  sourceDto: GetActivityBySourceDto,
): Promise<Activity> {
  const response = await axios.get(
    `/api/v1/activity/source/${sourceDto.sourceId}`,
  );

  return response.data;
}
