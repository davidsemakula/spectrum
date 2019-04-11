// @flow
const debug = require('debug')('mercury:queue:process-message-created');
import {
  updateReputation,
  updateUserReputation,
} from '../models/usersCommunities';
import { getThread } from '../models/thread';
import { getMessageCount } from '../models/user';
import {
  MESSAGE_CREATED,
  MESSAGE_CREATED_SCORE,
  MESSAGE_CREATED_POST_AUTHOR_SCORE,
  MESSAGE_CREATED_POST_AUTHOR_BONUS,
  MESSAGES_CREATED_SCORE_10,
  MESSAGES_CREATED_10,
  MESSAGES_CREATED_SCORE_5,
  MESSAGES_CREATED_5,
  MESSAGES_CREATED_SCORE_1,
  MESSAGES_CREATED_1,
} from '../constants';
import type { ReputationEventJobData } from 'shared/bull/types';
import { trackQueue } from 'shared/bull/queues';
import { events } from 'shared/analytics';

export default async (data: ReputationEventJobData) => {
  // entityId represents the threadId
  const { userId, entityId } = data;

  // get the communityId where the message was posted
  const { communityId, creatorId } = await getThread(entityId);

  // if the message creator and thread creator aren't the same person, give reputation to the message creator - this avoids people spamming their own threads to gain reputation
  const updateMessageCreatorReputation =
    userId !== creatorId
      ? await updateReputation(
          userId,
          communityId,
          MESSAGE_CREATED_SCORE,
          MESSAGE_CREATED
        )
      : Promise.resolve();

  // if the message creator and thread creator aren't the same person, give reputation to the thread creator - this avoids people spamming their own threads to gain reputation
  const updateThreadCreatorReputation =
    userId !== creatorId
      ? await updateReputation(
          creatorId,
          communityId,
          MESSAGE_CREATED_POST_AUTHOR_SCORE,
          MESSAGE_CREATED_POST_AUTHOR_BONUS
        )
      : Promise.resolve();

  let promiseArray = [
    // give reputation to the person who posted the message
    updateMessageCreatorReputation,
    // give reputation to the thread creator
    updateThreadCreatorReputation,
  ];

  const numExistingMessages = await getMessageCount(userId);
  let repEventScore = null;

  if (numExistingMessages >= 10) {
    promiseArray.push(
      updateUserReputation(
        userId,
        MESSAGES_CREATED_SCORE_10,
        MESSAGES_CREATED_10
      )
    );

    if (numExistingMessages === 10) {
      repEventScore = MESSAGES_CREATED_SCORE_10;
    }
  } else if (numExistingMessages >= 5) {
    promiseArray.push(
      updateUserReputation(userId, MESSAGES_CREATED_SCORE_5, MESSAGES_CREATED_5)
    );

    if (numExistingMessages === 5) {
      repEventScore = MESSAGES_CREATED_SCORE_5;
    }
  } else if (numExistingMessages >= 1) {
    promiseArray.push(
      updateUserReputation(userId, MESSAGES_CREATED_SCORE_1, MESSAGES_CREATED_1)
    );

    if (numExistingMessages === 1) {
      repEventScore = MESSAGES_CREATED_SCORE_1;
    }
  }

  if (repEventScore) {
    trackQueue.add({
      userId,
      event: events.TOTAL_MESSAGES_CREATED,
      context: {
        userId,
        threshold: numExistingMessages,
        score: repEventScore,
      },
    });
  }

  debug(`Processing message created reputation event`);
  debug(`Got communityId: ${communityId}`);
  return Promise.all(promiseArray);
};
