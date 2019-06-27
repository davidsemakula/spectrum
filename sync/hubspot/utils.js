import slugg from 'slugg';
import moment from 'moment';
import { btoa } from 'b2a';
import { _ } from 'lodash';

import {
  parseEventType,
  parseEventTypeProperties,
  refreshToken,
  createOrUpdateTimelineEvent,
} from './index';
import { getCommunitySettings } from 'api/models/communitySettings';
import { decryptString } from 'shared/encryption';

const EVENT_TYPE_MAP = {
  'signed up': ['Sign Up', 'user.modifiedAt'],
  'signed in': ['Sign In', null],
  'logged out': ['Log Out', null],
  'profile edited': ['Update Profile', 'user.modifiedAt'],
  'community created': ['Create Community', 'community.createdAt'],
  'user joined community': ['Join Community', null],
  'channel created': ['Create Channel', 'channel.createdAt'],
  'user joined channel': ['Join Channel', null],
  'thread created': ['Create Thread', 'thread.createdAt'],
  'message created': ['Create Message', 'message.timestamp'],
  'thread reaction created': ['Like', 'threadReaction.createdAt'],
};

export function translateEventType(eventName) {
  const [eventTypeName, dateField] = EVENT_TYPE_MAP[eventName];

  if (eventTypeName) {
    return parseEventType(eventTypeName) || {};
  }
  return null;
}

export function getEventDateField(eventName) {
  const [eventTypeName, dateField] = EVENT_TYPE_MAP[eventName];
  return dateField || null;
}

export function parseMessageBody(body) {
  // TODO: Parse draft js messages
  return '';
}

export async function syncUserActivity(type, data) {
  const hsEventType = translateEventType(type),
    applicationUrl = 'https://learn.keyy.org';

  if (
    !hsEventType ||
    !hsEventType.id ||
    !hsEventType.name ||
    !data ||
    !data.user ||
    !data.user.email
  ) {
    return;
  }

  const hsEventTypeId = hsEventType.id,
    hsEventTypeName = hsEventType.name;

  let hsData = {};

  if (data) {
    if (data.user) {
      hsData.userId = data.user.id;
      hsData.username = data.user.username;
      hsData.name = data.user.name;
      hsData.profileUrl = `${applicationUrl}/users/${data.user.username}`;
    }

    if (data.community) {
      hsData.communityId = data.community.id;
      hsData.communityName = data.community.name;
      hsData.communitySlug = data.community.slug;
      hsData.communityUrl = `${applicationUrl}/${data.community.slug}`;
    }

    if (data.channel) {
      hsData.channelId = data.channel.id;
      hsData.channelName = data.channel.name;
      hsData.channelSlug = data.channel.slug;
      hsData.channelUrl = `${applicationUrl}/${data.community.slug}/${
        data.channel.slug
      }`;
    }

    if (data.thread) {
      hsData.threadId = data.thread.id;
      hsData.threadTitle = data.thread.content.title;
      hsData.threadBody = parseMessageBody(data.thread.content.body);
      hsData.threadSlug = `${slugg(data.thread.content.title)}~${
        hsData.threadId
      }`;
      hsData.threadUrl = `${applicationUrl}${
        !data.community || !data.channel
          ? '/thread'
          : `/${data.community.slug}/${data.channel.slug}`
      }/${hsData.threadSlug}`;
    }

    if (data.message) {
      hsData.messageId = data.message.id;
      hsData.messageBody = parseMessageBody(data.message.content.body);
      hsData.messageSlug = `${slugg(data.thread.content.title)}~${
        hsData.threadId
      }`;
      if (hsData.threadUrl) {
        hsData.messageUrl = `${hsData.threadUrl}?m=${btoa(
          new Date(data.message.timestamp).getTime() - 1
        )}`;
      }
    }

    if (data.threadReaction) {
      hsData.likeId = data.threadReaction.id;
    }

    const dateField = getEventDateField(type);

    if (dateField) {
      let createdAt = data;

      dateField.split('.').forEach(key => {
        createdAt = createdAt[key];
      });

      if (typeof createdAt === 'string') {
        hsData.timestamp = moment(createdAt).valueOf();
      }
    }
  }

  let tokens = [];

  if (data.community && data.community.id) {
    const communitySettings = await getCommunitySettings(data.community.id);
    if (
      communitySettings &&
      communitySettings.hubspotSettings &&
      communitySettings.hubspotSettings.temp //refreshToken
    ) {
      const token =
        communitySettings.hubspotSettings
          .temp; /*decryptString(
        communitySettings.hubspotSettings.refreshToken
      );*/
      if (token) {
        tokens.push(token);
      }
    }
  }

  const HUBSPOT_REFRESH_TOKEN = process.env.HUBSPOT_REFRESH_TOKEN;
  if (HUBSPOT_REFRESH_TOKEN) {
    tokens.push(HUBSPOT_REFRESH_TOKEN);
  }

  let hsEventId = null;

  if (tokens.length) {
    if (['signed up', 'signed in', 'logged out'].includes(type)) {
      let prefix = 'user';
      switch (type) {
        case 'signed up':
          prefix = 'sign-up';
          break;
        case 'signed in':
          prefix = 'sign-in';
          break;
        case 'logged out':
          prefix = 'log-out';
          break;
      }
      hsEventId = `${prefix}-${data.user.id}-${hsData.timestamp ||
        moment().valueOf()}`;
    } else {
      ['community', 'channel', 'thread', 'message', 'thread reaction'].forEach(
        key => {
          const contentKey = key === 'thread reaction' ? 'threadReaction' : key;
          if (new RegExp(key).test(type) && data[contentKey]) {
            hsEventId = `${key === 'like' ? 'thread-reaction' : key}-${
              data[contentKey].id
            }`;
          }
        }
      );
    }
  }

  const hsAllowedProps = parseEventTypeProperties(hsEventTypeName);

  for (let token of tokens) {
    let accessToken = null;

    try {
      accessToken = await refreshToken(token);
    } catch (e) {
      accessToken = null;
    }

    if (accessToken) {
      try {
        createOrUpdateTimelineEvent(
          hsEventId,
          data.user.email,
          hsEventTypeId,
          accessToken,
          _.pick(hsData, hsAllowedProps),
          data.user
        ).catch(() => {});
      } catch (e) {}
    }
  }

  return null;
}
