// @flow
import * as React from 'react';
import compose from 'recompose/compose';
import { getCurrentUser } from 'shared/graphql/queries/user/getUser';
import type { GetUserType } from 'shared/graphql/queries/user/getUser';
import { setTrackingContexts } from 'src/actions/authentication';

type Props = {
  data: { user: GetUserType },
};

class AnalyticsTracking extends React.Component<Props> {
  componentDidMount() {
    const AMPLITUDE_API_KEY =
      process.env.NODE_ENV === 'production'
        ? process.env.AMPLITUDE_API_KEY
        : process.env.AMPLITUDE_API_KEY_DEVELOPMENT;
    if (AMPLITUDE_API_KEY) {
      try {
        window.amplitude.getInstance().init(AMPLITUDE_API_KEY);
        window.amplitude.getInstance().setOptOut(false);
      } catch (err) {
        console.warn('Unable to start tracking', err.message);
      }
    } else {
      console.warn('No amplitude api key, tracking in development mode');
    }
  }

  componentDidUpdate(prev: Props) {
    const {
      data: { user },
    } = this.props;

    if (!prev.data.user && user) {
      setTrackingContexts(user);

      if (window.Intercom) {
        window.Intercom('boot', {
          app_id: 'daw37xn5',
          name: user.name,
          email: user.email,
          //Website visitor so may not have any user related info
        });
      }
    }
  }

  render() {
    return null;
  }
}

export default compose(getCurrentUser)(AnalyticsTracking);
