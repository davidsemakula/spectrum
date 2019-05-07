// @flow
import Raven from 'shared/raven';
import type { GraphQLContext } from '../../';
import type { EditUserInput } from 'shared/db/queries/user';
import UserError from '../../utils/UserError';
import {
  getUserByUsername,
  getUserById,
  editUser,
  getUsersByEmail,
  setUserPendingEmail,
} from 'shared/db/queries/user';
import { events } from 'shared/analytics';
import { trackQueue, processReputationEventQueue } from 'shared/bull/queues';
import { isAuthedResolver as requireAuth } from '../../utils/permissions';
import isEmail from 'validator/lib/isEmail';
import { sendEmailValidationEmailQueue } from 'shared/bull/queues';

export default requireAuth(
  async (_: any, args: EditUserInput, ctx: GraphQLContext) => {
    const { user: currentUser, updateCookieUserData } = ctx;
    const { input } = args;

    // If the user is trying to change their username check whether there's a person with that username already
    if (input.username) {
      if (input.username === 'null' || input.username === 'undefined') {
        trackQueue.add({
          userId: currentUser.id,
          event: events.USER_EDITED_FAILED,
          properties: {
            reason: 'bad username input',
          },
        });

        return new UserError('Nice try! 😉');
      }

      const dbUser = await getUserByUsername(input.username);
      if (dbUser && dbUser.id !== currentUser.id) {
        trackQueue.add({
          userId: currentUser.id,
          event: events.USER_EDITED_FAILED,
          properties: {
            reason: 'username taken',
          },
        });

        return new UserError(
          'Looks like that username got swooped! Try another?'
        );
      }
    }

    if (input.email && typeof input.email === 'string') {
      const pendingEmail = input.email;

      // if user is changing their email, make sure it's not taken by someone else
      if (pendingEmail !== currentUser.email || !currentUser.email) {
        if (!isEmail(input.email)) {
          return new UserError('Please enter a valid email address.');
        }

        const dbUsers = await getUsersByEmail(pendingEmail);
        if (dbUsers && dbUsers.length > 0) {
          return new UserError('Please enter a valid email address.');
        }

        // the user will have to confirm their email for it to be saved in
        // order to prevent spoofing your email as someone elses
        await setUserPendingEmail(currentUser.id, pendingEmail).then(() => {
          sendEmailValidationEmailQueue.add({
            email: pendingEmail,
            userId: currentUser.id,
          });
        });
      }
    }

    const editedUser = await editUser(args, currentUser.id);

    await updateCookieUserData({
      ...editedUser,
    }).catch(err => {
      Raven.captureException(
        new Error(`Error updating cookie user data: ${err.message}`)
      );
      return editedUser;
    });

    if (
      ![
        'email',
        'name',
        'description',
        'username',
        'website',
        'profilePhoto',
        'coverPhoto',
      ]
        .map(key => {
          return !!editedUser[key];
        })
        .includes(false)
    ) {
      // Only trigger for users with completed profiles
      processReputationEventQueue.add({
        userId: currentUser.id,
        type: 'profile completed',
        entityId: currentUser.id,
      });
    }

    return editedUser;
  }
);
