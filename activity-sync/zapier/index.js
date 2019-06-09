import axios from 'axios';
import _ from 'lodash';

export function shareCommunityActivity(type, community, data) {
  if (community && community.zapierSettings && community.zapierSettings.url) {
    return axios.post(community.zapierSettings.url, {
      type,
      community: _.omit(community, ['zapierSettings']),
      ..._.omit(data || {}, ['community', 'type']),
    });
  }
  return null;
}
