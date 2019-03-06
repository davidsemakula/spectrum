// @flow
require('now-env');
const IS_PROD = process.env.NODE_ENV === 'production';
import { Router } from 'express';
const jwt = require('jsonwebtoken');
const emailRouter = Router();
import { updateUserEmail } from 'shared/db/queries/user';
import { unsubscribeUserFromEmailNotification } from '../../models/usersSettings';
import { updateThreadNotificationStatusForUser } from '../../models/usersThreads';
import { updateDirectMessageThreadNotificationStatusForUser } from '../../models/usersDirectMessageThreads';
import {
  toggleUserChannelNotifications,
  getUsersPermissionsInChannels,
} from '../../models/usersChannels';
import {
  updateCommunityAdministratorEmail,
  getCommunityById,
} from '../../models/community';
import { getChannelsByCommunity } from '../../models/channel';

// $FlowIssue
emailRouter.get('/unsubscribe', (req, res) => {
  const { token } = req.query;

  // if no token was provided
  if (!token) return res.status(400).send('No token provided to unsubscribe.');

  // verify that the token signature matches our env signature
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.EMAIL_JWT_SIGNATURE);
  } catch (err) {
    // if the signature can't be verified
    let errMessage;
    if (err.name === 'TokenExpiredError') {
      errMessage =
        'This unsubscribe token has expired. You can unsubscribe from this email type in your user settings.';
    } else {
      errMessage =
        'This unsubscribe token is invalid. You can unsubscribe from this email type in your user settings.';
    }
    return res.status(400).send(errMessage);
  }

  // once the token is verified, we can decode it to get the userId and type
  const { userId, type, dataId } = jwt.decode(token);

  // if the token doesn't have the necessary info
  if (!userId || !type) {
    return res
      .status(400)
      .send(
        'We were not able to verify this request to unsubscribe. You can unsubscribe from this email type in your users settings.'
      );
  }

  // and send a database request to unsubscribe from a particular email type
  try {
    switch (type) {
      case 'dailyDigest':
      case 'weeklyDigest':
      case 'newThreadCreated':
      case 'newMessageInThreads':
      case 'newDirectMessage':
        return unsubscribeUserFromEmailNotification(userId, type).then(() =>
          res
            .status(200)
            .send('You have been successfully unsubscribed from this email.')
        );
      case 'muteChannel': {
        return toggleUserChannelNotifications(userId, dataId, false).then(() =>
          res.redirect(
            `${rootRedirect}/${community.slug}/${
              channel.slug
            }?toastType=success&toastMessage=You will no longer receive new thread emails from this channel.`
          )
        );
      }
      case 'muteCommunity': {
        const community = await getCommunityById(dataId);
        const channels = await getChannelsByCommunity(dataId);
        const channelIds = channels.map(channel => channel.id);
        const usersChannels = await getUsersPermissionsInChannels(
          channelIds.map(id => [userId, id])
        );
        const usersChannelsWithNotifications = usersChannels.filter(
          usersChannel => usersChannel && usersChannel.receiveNotifications
        );
        const channelIdsWithNotifications = usersChannelsWithNotifications.map(
          usersChannel => usersChannel.channelId
        );

        await channelIdsWithNotifications.map(
          async channelId =>
            await toggleUserChannelNotifications(userId, channelId, false)
        );

        return res.redirect(
          `${rootRedirect}/${
            community.slug
          }?toastType=success&toastMessage=You will no longer receive new thread emails from this learning group.`
        );
      }
      case 'muteThread':
        return updateThreadNotificationStatusForUser(
          dataId,
          userId,
          false
        ).then(() =>
          res
            .status(200)
            .send(
              'You will no longer receive emails about new messages in this thread.'
            )
        );
      case 'muteDirectMessageThread':
        return updateDirectMessageThreadNotificationStatusForUser(
          dataId,
          userId,
          false
        ).then(() =>
          res
            .status(200)
            .send(
              'You will no longer receive emails about new messages in this direct message conversation.'
            )
        );
      default: {
        return res
          .status(400)
          .send("We couldn't identify this type of email to unsubscribe.");
      }
    }
  } catch (err) {
    console.error(err);
    return res
      .status(400)
      .send(
        'We ran into an issue unsubscribing you from this email. You can always unsubscribe from this email type in your user settings, or get in touch with us at hi@learn.keyy.org.'
      );
  }
});

// $FlowIssue
emailRouter.get('/validate', (req, res) => {
  const { token } = req.query;

  // if no token was provided
  if (!token)
    return res.status(400).send('No token provided to validate this email.');

  // verify that the token signature matches our env signature
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.EMAIL_JWT_SIGNATURE);
  } catch (err) {
    // if the signature can't be verified
    let errMessage;
    if (err.name === 'TokenExpiredError') {
      errMessage =
        'This unsubscribe token has expired. You can re-enter your email address in your user settings to resend a confirmation email.';
    } else {
      errMessage =
        'This unsubscribe token is invalid. You can re-enter your email address in your user settings to resend a confirmation email.';
    }
    return res.status(400).send(errMessage);
  }

  // once the token is verified, we can decode it to get the userId and email
  const { userId, email, communityId } = jwt.decode(token);

  // if the token doesn't have the necessary info
  if (!userId || !email) {
    return res
      .status(400)
      .send(
        'We were not able to verify this email validation. You can re-enter your email address in your user settings to resend a confirmation email.'
      );
  }

  // if there is a community id present in the token, the user is trying to
  // validate a new administrator email address
  if (communityId) {
    try {
      return updateCommunityAdministratorEmail(communityId, email, userId).then(
        community =>
          IS_PROD
            ? res.redirect(`https://learn.keyy.org/${community.slug}/settings`)
            : res.redirect(`http://localhost:3000/${community.slug}/settings`)
      );
    } catch (err) {
      console.error(err);
      return res
        .status(400)
        .send(
          'We ran into an issue validating this email address. You can re-enter your email address in your community settings to resend a confirmation email, or get in touch with us at hi@learn.keyy.org.'
        );
    }
  }

  // and send a database request to update the user record with this email
  try {
    return updateUserEmail(userId, email).then(user => {
      const rootRedirect = IS_PROD
        ? `https://learn.keyy.org`
        : `http://localhost:3000`;

      req.login(user, err => {
        if (err) {
          return res
            .status(400)
            .send(
              'We ran into an issue validating this email address. You can re-enter your email address in your community settings to resend a confirmation email, or get in touch with us at hi@learn.keyy.org.'
            );
        }

        if (!user.username) return res.redirect(rootRedirect);
        return res.redirect(`${rootRedirect}/users/${user.username}/settings`);
      });
    });
  } catch (err) {
    console.error(err);
    return res
      .status(400)
      .send(
        'We ran into an issue validating this email address. You can re-enter your email address in your user settings to resend a confirmation email, or get in touch with us at hi@learn.keyy.org.'
      );
  }
});

export default emailRouter;
