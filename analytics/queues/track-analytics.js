// @flow
const debug = require('debug')('analytics:queues:track');
import Raven from 'shared/raven';
import type { Job, TrackAnalyticsData } from 'shared/bull/types';
import { getContext, track } from '../utils';
import { handleExternalTracking } from 'shared/grindery/track';

const processJob = async (job: Job<TrackAnalyticsData>) => {
  const { userId, event, context, properties = {} } = job.data;

  debug(`Incoming job: ${event}`);

  if (!context) {
    return track(userId, event, { ...properties });
  }

  const contextProperties = await getContext({ userId, ...context });

  return await track(userId, event, {
    ...contextProperties,
    ...properties,
  });
};

export default async (job: Job<TrackAnalyticsData>) => {
  try {
    await processJob(job);
    await handleExternalTracking(job);
  } catch (err) {
    console.error('❌ Error in job:\n');
    console.error(err);
    Raven.captureException(err);
  }
};
