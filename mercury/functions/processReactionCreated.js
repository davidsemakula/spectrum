// @flow
const debug = require('debug')('mercury:queue:process-reaction-created');
import {
  updateReputation,
  updateUserReputation,
} from '../models/usersCommunities';
import { getMessage } from '../models/message';
import { getThread } from '../models/thread';
import { getReactionByOthersCount } from '../models/user';
import {
  REACTION_CREATED,
  REACTION_CREATED_POST_AUTHOR_BONUS,
  REACTION_CREATED_SCORE,
  REACTION_CREATED_POST_AUTHOR_SCORE,
  REACTIONS_CREATED_SCORE_10,
  REACTIONS_CREATED_10,
  REACTIONS_CREATED_SCORE_5,
  REACTIONS_CREATED_5,
  REACTIONS_CREATED_SCORE_1,
  REACTIONS_CREATED_1,
} from '../constants';
import type { ReputationEventJobData } from 'shared/bull/types';

/*
  If a reaction was created, it is the message creator who should receive reputation, not the reaction leaver. Therefore the userId passed in from reaction mutation doesn't matter; instead we need to get the userId of the person who left the message.

  In addition, we should reward the person who created the parent thread for sparking a conversation that resulted in reactions and productive messages
*/

export default async (data: ReputationEventJobData) => {
  // entityId represents the messageId
  const { entityId } = data;

  // get the message that the reaction was left on
  const { threadId, senderId, threadType } = await getMessage(entityId);

  // ignore reactions left on messages in DMs
  if (threadType === 'directMessageThread') return;

  // get the original thread creator and communityId
  const { communityId, creatorId } = await getThread(threadId);

  let promiseArray = [];

  const numReactionsByOthers = await getReactionByOthersCount(senderId, 'like');

  if (![1, 5, 10].includes(numReactionsByOthers)) {
    promiseArray.push(
      // give reputation to the person who posted the message
      updateReputation(
        senderId,
        communityId,
        REACTION_CREATED_SCORE,
        REACTION_CREATED
      )
    );
  }

  promiseArray.push(
    // give reputation to the person who created the thread - smaller amount
    updateReputation(
      creatorId,
      communityId,
      REACTION_CREATED_POST_AUTHOR_SCORE,
      REACTION_CREATED_POST_AUTHOR_BONUS
    )
  );

  if (numReactionsByOthers >= 10) {
    promiseArray.push(
      updateUserReputation(
        senderId,
        REACTIONS_CREATED_SCORE_10,
        REACTIONS_CREATED_10
      )
    );
  } else if (numReactionsByOthers >= 5) {
    promiseArray.push(
      updateUserReputation(
        senderId,
        REACTIONS_CREATED_SCORE_5,
        REACTIONS_CREATED_5
      )
    );
  } else if (numReactionsByOthers >= 1) {
    promiseArray.push(
      updateUserReputation(
        senderId,
        REACTIONS_CREATED_SCORE_1,
        REACTIONS_CREATED_1
      )
    );
  }

  debug(`Processing reaction created reputation event`);
  debug(`Got communityId: ${communityId}`);
  return Promise.all(promiseArray);
};
