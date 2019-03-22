// @flow

const debug = require('debug')('shared:grindery:track');
import Raven from 'shared/raven';
import { indexUserProfile } from './people';
import type { Job, TrackAnalyticsData } from 'shared/bull/types';
import { events } from 'shared/analytics';

export async function handleExternalTracking(job: Job<TrackAnalyticsData>) {
  const { userId, event } = job.data;
  if (
    [
      events.USER_CREATED,
      events.USER_ADDED_PROVIDER,
      events.USER_EDITED,
      events.USER_ADDED_EMAIL,
    ].includes(event)
  ) {
    indexUserProfile(userId).catch(e => Raven.captureException(e));
  }
}
