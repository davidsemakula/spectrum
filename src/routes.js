// @flow
import * as React from 'react';
import compose from 'recompose/compose';
import {
  Route,
  Switch,
  Redirect,
  withRouter,
  type Location,
  type History,
} from 'react-router';
import { ThemeProvider } from 'styled-components';
import Loadable from 'react-loadable';
import { ErrorBoundary } from 'src/components/error';
import { CLIENT_URL, CLIENT_MAIN_DOMAIN } from './api/constants';
import generateMetaInfo from 'shared/generate-meta-info';
import GlobalStyles from './reset.css.js';
import { GlobalThreadAttachmentStyles } from 'src/components/message/threadAttachment/style';
import { theme } from 'shared/theme';
import AppViewWrapper from 'src/components/appViewWrapper';
import ScrollManager from 'src/components/scrollManager';
import Head from 'src/components/head';
import ModalRoot from 'src/components/modals/modalRoot';
import Gallery from 'src/components/gallery';
import Toasts from 'src/components/toasts';
import Composer from 'src/components/composer';
import signedOutFallback from 'src/helpers/signed-out-fallback';
import PrivateChannelJoin from 'src/views/privateChannelJoin';
import PrivateCommunityJoin from 'src/views/privateCommunityJoin';
import ThreadSlider from 'src/views/threadSlider';
import Navigation from 'src/views/navigation';
import Status from 'src/views/status';
import Login from 'src/views/login';
import DirectMessages from 'src/views/directMessages';
import { ThreadView } from 'src/views/thread';
import AnalyticsTracking from 'src/components/analyticsTracking';
import { withCurrentUser } from 'src/components/withCurrentUser';
import Maintenance from 'src/components/maintenance';
import type { GetUserType } from 'shared/graphql/queries/user/getUser';
import RedirectOldThreadRoute from './views/thread/redirect-old-route';
import NewUserOnboarding from './views/newUserOnboarding';
import QueryParamToastDispatcher from './views/queryParamToastDispatcher';
import { LoadingView } from 'src/views/viewHelpers';
import GlobalTitlebar from 'src/views/globalTitlebar';
import NoUsernameHandler from 'src/views/authViewHandler/noUsernameHandler';
import { NavigationContext } from 'src/helpers/navigation-context';

const Explore = Loadable({
  loader: () => import('./views/explore' /* webpackChunkName: "Explore" */),
  loading: ({ isLoading }) => isLoading && <LoadingView />,
});

/* prettier-ignore */
const UserView = Loadable({
  loader: () => import('./views/user'/* webpackChunkName: "UserView" */),
  loading: ({ isLoading }) => isLoading && <LoadingView />,
});

/* prettier-ignore */
const CommunityView = Loadable({
  loader: () => import('./views/community'/* webpackChunkName: "CommunityView" */),
  loading: ({ isLoading }) => isLoading && <LoadingView />,
});

/* prettier-ignore */
const CommunityLoginView = Loadable({
  loader: () => import('./views/communityLogin'/* webpackChunkName: "CommunityView" */),
  loading: ({ isLoading }) => isLoading && <LoadingView />,
});

/* prettier-ignore */
const ChannelView = Loadable({
  loader: () => import('./views/channel'/* webpackChunkName: "ChannelView" */),
  loading: ({ isLoading }) => isLoading && <LoadingView />,
});

/* prettier-ignore */
const HomeViewRedirect = Loadable({
  loader: () => import('./views/homeViewRedirect'/* webpackChunkName: "HomeViewRedirect" */),
  loading: ({ isLoading }) => isLoading && <LoadingView />,
});

/* prettier-ignore */
const Notifications = Loadable({
  loader: () => import('./views/notifications'/* webpackChunkName: "Notifications" */),
  loading: ({ isLoading }) => isLoading && <LoadingView />,
});

/* prettier-ignore */
const UserSettings = Loadable({
  loader: () => import('./views/userSettings'/* webpackChunkName: "UserSettings" */),
  loading: ({ isLoading }) => isLoading && <LoadingView />,
});

/* prettier-ignore */
const CommunitySettings = Loadable({
  loader: () => import('./views/communitySettings'/* webpackChunkName: "communitySettings" */),
  loading: ({ isLoading }) => isLoading && <LoadingView />,
});

/* prettier-ignore */
const ChannelSettings = Loadable({
  loader: () => import('./views/channelSettings'/* webpackChunkName: "channelSettings" */),
  loading: ({ isLoading }) => isLoading && <LoadingView />,
});

/* prettier-ignore */
const NewCommunity = Loadable({
  loader: () => import('./views/newCommunity'/* webpackChunkName: "NewCommunity" */),
  loading: ({ isLoading }) => isLoading && <LoadingView />,
});

/* prettier-ignore */
const NewDirectMessage = Loadable({
  loader: () => import('./views/newDirectMessage'/* webpackChunkName: "NewDirectMessage" */),
  loading: ({ isLoading }) => isLoading && <LoadingView />,
});

/* prettier-ignore */
const Pages = Loadable({
  loader: () => import('./views/pages'/* webpackChunkName: "Splash" */),
  loading: ({ isLoading }) => isLoading && null,
});

/* prettier-ignore */
const Search = Loadable({
  loader: () => import('./views/search'/* webpackChunkName: "Search" */),
  loading: ({ isLoading }) => isLoading && <LoadingView />,
});

/* prettier-ignore */
const ErrorFallback = Loadable({
  loader: () => import('./components/error'/* webpackChunkName: "Error" */),
  loading: ({ isLoading }) => isLoading && <LoadingView />
});

const HomeViewRedirectFallback = signedOutFallback(HomeViewRedirect, Pages);
const HomeFallback = signedOutFallback(HomeViewRedirect, () => (
  <Redirect to="/" />
));
const LoginFallback = signedOutFallback(() => <Redirect to="/" />, Login);
const CommunityLoginFallback = signedOutFallback(
  props => <Redirect to={`/${props.match.params.communitySlug}`} />,
  CommunityLoginView
);
const NewCommunityFallback = signedOutFallback(NewCommunity, () => (
  <Login redirectPath={`${CLIENT_URL}/new/community`} />
));
const NewDirectMessageFallback = signedOutFallback(NewDirectMessage, () => (
  <Login redirectPath={`${CLIENT_URL}/new/message`} />
));
const MessagesFallback = signedOutFallback(DirectMessages, () => (
  <Login redirectPath={`${CLIENT_URL}/messages`} />
));
const UserSettingsFallback = signedOutFallback(UserSettings, () => (
  <Login redirectPath={`${CLIENT_URL}/me/settings`} />
));
const CommunitySettingsFallback = signedOutFallback(CommunitySettings, () => (
  <Login />
));
const ChannelSettingsFallback = signedOutFallback(ChannelSettings, () => (
  <Login />
));
const NotificationsFallback = signedOutFallback(Notifications, () => (
  <Login redirectPath={`${CLIENT_URL}/notifications`} />
));
const ComposerFallback = signedOutFallback(Composer, () => (
  <Login redirectPath={`${CLIENT_URL}/new/thread`} />
));

export const RouteModalContext = React.createContext({
  isModal: false,
});

type Props = {
  currentUser: ?GetUserType,
  isLoadingCurrentUser: boolean,
  maintenanceMode?: boolean,
  location: Location,
  history: History,
};

type State = {
  navigationIsOpen: boolean,
};

const externalRedirect = url => () => {
  if (!global.location) {
    // Server mode
    return <Redirect to={url} />;
  }
  location.replace(url);
  return '';
};

// Key can be a slug or a domain name. Must be all lowercased.
// If slug is used, the final domain will be SLUG.learn.keyy.org
// No need to add alias if desired slug is the same as community slug,
// like `startup-framework`
const COMMUNITY_DOMAIN_ALIASES = {
  suf: 'startup-framework',
  'suf.inboundlabs.co': 'startup-framework',
};

class CommunityHostHelper {
  constructor(ssrHost) {
    this.ssrHost = ssrHost;
  }
  getDomainCommunitySlug() {
    const currentHost = global.location
      ? global.location.host.toLowerCase()
      : this.ssrHost;
    if (currentHost in COMMUNITY_DOMAIN_ALIASES) {
      return COMMUNITY_DOMAIN_ALIASES[currentHost];
    }
    if (
      !currentHost ||
      !currentHost.endsWith(CLIENT_MAIN_DOMAIN) ||
      currentHost === CLIENT_MAIN_DOMAIN
    ) {
      // On main domain or test domain
      return '';
    }
    const domainPart = currentHost
      .slice(0, currentHost.length - CLIENT_MAIN_DOMAIN.length - 1)
      .split('.');
    const domainPartLast = domainPart[domainPart.length - 1];
    if (domainPartLast === 'workers') {
      return '';
    }
    return COMMUNITY_DOMAIN_ALIASES[domainPartLast] || domainPartLast;
  }
  adaptCommunityRoutes(routeWrapper) {
    const routes = routeWrapper.props.children || [routeWrapper];
    const communitySlug = this.getDomainCommunitySlug();
    if (!communitySlug) {
      return routes;
    }
    const pathRe = new RegExp(`^\\/${communitySlug}(\\/|$)`);
    const wrapHistory = h => {
      const installHack = (keys, funcFactory) => {
        if (typeof keys === 'string') {
          keys = [keys];
        }
        for (const key of keys) {
          const oldFunc = h[key];
          if (!oldFunc.__hasDomainHack) {
            h[key] = funcFactory(oldFunc);
            h[key].__hasDomainHack = true;
          }
        }
      };
      const patchLocation = location => {
        if (typeof location === 'string') {
          return location.replace(pathRe, '/');
        }
        return {
          ...location,
          pathname: location.pathname.replace(pathRe, '/'),
        };
      };
      installHack(['createHref', 'replace', 'push'], oldFunc => {
        return function(location, ...args) {
          return oldFunc.call(this, patchLocation(location), ...args);
        };
      });
      return h;
    };
    const wrapComponent = Component => {
      if (!Component) {
        return undefined;
      }
      return args => {
        args = {
          ...args,
          history: wrapHistory(args.history),
        };
        args.match.params.communitySlug = communitySlug;
        return <Component {...args} />;
      };
    };
    const ret = routes.map(route => {
      const path = route.props.path.replace(/:communitySlug(\/|$)/, '');
      const component = wrapComponent(route.props.component);
      return <Route {...{ path, component }} />;
    });
    return ret;
  }
}

class Routes extends React.Component<Props, State> {
  previousLocation = this.props.location;
  state = { navigationIsOpen: false };

  componentWillUpdate(nextProps) {
    const { location } = this.props;
    // set previousLocation if props.location is not modal
    if (
      nextProps.history.action !== 'POP' &&
      (!location.state || !location.state.modal)
    ) {
      this.previousLocation = this.props.location;
    }
  }

  setNavigationIsOpen = (val: boolean) =>
    this.setState({ navigationIsOpen: val });

  render() {
    const { currentUser, isLoadingCurrentUser } = this.props;
    const { navigationIsOpen } = this.state;
    const { title, description } = generateMetaInfo();

    const communityHostHelper = new CommunityHostHelper(this.props.ssrHost);
    const isCommunityDomain = !!communityHostHelper.getDomainCommunitySlug();
    const adaptCommunityRoutes = communityHostHelper.adaptCommunityRoutes.bind(
      communityHostHelper
    );

    if (this.props.maintenanceMode) {
      return (
        <ThemeProvider theme={theme}>
          <ScrollManager>
            <GlobalStyles />
            <Head
              title="Ongoing Maintenance - Keyy"
              description="Keyy is currently undergoing scheduled maintenance downtime. Please check https://twitter.com/withkeyy for ongoing updates."
            />
            <Maintenance />
          </ScrollManager>
        </ThemeProvider>
      );
    }

    const { location } = this.props;
    const isModal = !!(
      location.state &&
      location.state.modal &&
      this.previousLocation !== location
    ); // not initial render

    // allows any UI in the tree to open or close the side navigation on mobile
    const navigationContext = {
      navigationIsOpen,
      setNavigationIsOpen: this.setNavigationIsOpen,
    };

    // allows any UI in the tree to know if it is existing within a modal or not
    // commonly used for background views to know that they are backgrounded
    const routeModalContext = { isModal };

    // TODO: Re-add domain support
    return (
      <ErrorBoundary fallbackComponent={ErrorFallback}>
        <ThemeProvider theme={theme}>
          <NavigationContext.Provider value={navigationContext}>
            {/* default meta tags, get overriden by anything further down the tree */}
            <Head title={title} description={description} />
            <GlobalStyles />
            <GlobalThreadAttachmentStyles />

            {/* dont let non-critical pieces of UI crash the whole app */}
            <ErrorBoundary>
              <Status />
            </ErrorBoundary>
            <ErrorBoundary>
              <Toasts />
            </ErrorBoundary>
            <ErrorBoundary>
              <Gallery />
            </ErrorBoundary>
            <ErrorBoundary>
              <ModalRoot />
            </ErrorBoundary>
            <ErrorBoundary>
              <QueryParamToastDispatcher />
            </ErrorBoundary>
            <ErrorBoundary>
              <AnalyticsTracking />
            </ErrorBoundary>

            {/* 
              while users should be able to browse communities/threads
              if they are signed out (eg signedOutFallback), they should not
              be allowed to use the app after signing up if they dont set a username.

              otherwise we can get into a state where people are sending DMs,
              sending messages, and posting threads without having a user profile
              that people can report or link to.

              this global component simply listens for users without a username
              to be authenticated, and if so forces a redirect to /new/user 
              prompting them to set a username
            */}
            <ErrorBoundary>
              <NoUsernameHandler currentUser={currentUser} />
            </ErrorBoundary>

            {isModal && (
              <Route
                // NOTE(@mxstbr): This custom path regexp matches threadId correctly in all cases, no matter if we prepend it with a custom slug or not.
                // Imagine our threadId is "id-123-id" (similar in shape to an actual UUID)
                // - /id-123-id => id-123-id, easy start that works
                // - /some-custom-slug~id-123-id => id-123-id, custom slug also works
                // - /~id-123-id => id-123-id => id-123-id, empty custom slug also works
                // - /some~custom~slug~id-123-id => id-123-id, custom slug with delimiter char in it (~) also works! :tada:
                path="/:communitySlug/:channelSlug/(.*~)?:threadId"
                component={props => (
                  <ThreadSlider
                    previousLocation={this.previousLocation}
                    {...props}
                  />
                )}
              />
            )}

            {/*
              this context provider allows children views to determine
              how they should behave if a modal is open. For example,
              you could tell a community view to not paginate the thread
              feed if a thread modal is open.
            */}
            <RouteModalContext.Provider value={routeModalContext}>
              {/*
                we tell the app view wrapper any time the modal state
                changes so that we can restore the scroll position to where
                it was before the modal was opened
              */}
              <AppViewWrapper {...routeModalContext}>
                <Route component={Navigation} />
                <Route component={GlobalTitlebar} />

                <div css={isModal ? { overflow: 'hidden' } : {}}>
                  {/*
                    switch only renders the first match. Subrouting happens downstream
                    https://reacttraining.com/react-router/web/api/Switch
                  */}
                  <Switch location={isModal ? this.previousLocation : location}>
                    <Route
                      exact
                      path="/"
                      component={HomeViewRedirectFallback}
                    />
                    <Route exact path="/home" component={HomeFallback} />

                    {/* Public Business Pages */}
                    <Route path="/about" component={Pages} />
                    <Route path="/contact" component={Pages} />
                    <Route path="/terms" component={Pages} />
                    <Route path="/privacy" component={Pages} />
                    <Route path="/terms.html" component={Pages} />
                    <Route path="/privacy.html" component={Pages} />
                    <Route path="/code-of-conduct" component={Pages} />
                    <Route path="/support" component={Pages} />
                    <Route path="/features" component={Pages} />
                    <Route path="/faq" component={Pages} />
                    <Route path="/apps" component={Pages} />
                    <Route
                      path="/whatIsKeyyCoin"
                      render={externalRedirect(
                          'https://learn.keyy.org/keyy-support/faq/what-is-keyy-coin~eeebf0d6-b1ea-4a69-9cc2-d45456486e25?utm_campaign=In%20App%20Usage%20-%20Learn.Keyy.org&utm_source=in%20app%20user%20menu&utm_content=What%20is%20Keyy%20Coin/'
                      )}
                    />
                    <Route
                      path="/earningBadges"
                      render={externalRedirect(
                          'https://learn.keyy.org/keyy-support/getting-started/earning-badges-in-keyy~59734ff9-747c-4d4d-8b36-12e6a1d26e6f?utm_campaign=In%20App%20Usage%20-%20Learn.Keyy.org&utm_source=in%20app%20user%20menu&utm_content=Earning%20Badges/'
                      )}
                    />
                    <Route
                      path="/earningLevels"
                      render={externalRedirect(
                          'https://learn.keyy.org/keyy-support/getting-started/earning-levels-in-keyy~246b8e07-5158-432e-83cb-62708112fdbc?utm_campaign=In%20App%20Usage%20-%20Learn.Keyy.org&utm_source=in%20app%20user%20menu&utm_content=Earning%20levels'
                      )}
                    />
                    <Route
                      path="/becomeCoach"
                      render={externalRedirect(
                          'https://www.keyy.org/become-a-coach?utm_campaign=In%20App%20Usage%20-%20Learn.Keyy.org&utm_source=in%20app%20user%20menu&utm_content=Become%20a%20Coach'
                      )}
                    />

                    {/* App Pages */}
                    <Route
                      path="/new/community"
                      component={NewCommunityFallback}
                    />
                    <Route path="/new/thread" component={ComposerFallback} />
                    <Route path="/new/search" component={Search} />
                    <Route path="/new/user" component={NewUserOnboarding} />
                    <Route
                      path="/new/message"
                      component={NewDirectMessageFallback}
                    />

                    <Route
                      path="/new"
                      render={() => <Redirect to="/new/community" />}
                    />

                    <Route path="/login" component={LoginFallback} />
                    <Route path="/explore" component={Explore} />
                    <Route
                      path="/messages/:threadId"
                      component={MessagesFallback}
                    />
                    <Route path="/messages" component={MessagesFallback} />
                    <Route
                      path="/thread/:threadId"
                      component={RedirectOldThreadRoute}
                    />
                    <Route path="/thread" render={() => <Redirect to="/" />} />
                    <Route
                      exact
                      path="/users"
                      render={() => <Redirect to="/" />}
                    />
                    <Route exact path="/users/:username" component={UserView} />
                    <Route
                      exact
                      path="/users/:username/settings"
                      component={UserSettingsFallback}
                    />
                    <Route
                      path="/notifications"
                      component={NotificationsFallback}
                    />

                    <Route
                      path="/me/settings"
                      render={() =>
                        currentUser && currentUser.username ? (
                          <Redirect
                            to={`/users/${currentUser.username}/settings`}
                          />
                        ) : currentUser && !currentUser.username ? (
                          <NewUserOnboarding />
                        ) : isLoadingCurrentUser ? null : (
                          <Login redirectPath={`${CLIENT_URL}/me/settings`} />
                        )
                      }
                    />
                    <Route
                      path="/me"
                      render={() =>
                        currentUser && currentUser.username ? (
                          <Redirect to={`/users/${currentUser.username}`} />
                        ) : isLoadingCurrentUser ? null : (
                          <Login redirectPath={`${CLIENT_URL}/me`} />
                        )
                      }
                    />

                    {/*
                        We check communitySlug last to ensure none of the above routes
                        pass. We handle null communitySlug values downstream by either
                        redirecting to home or showing a 404
                      */}
                    <Route
                      path="/:communitySlug/:channelSlug/settings"
                      component={ChannelSettingsFallback}
                    />
                    <Route
                      path="/:communitySlug/:channelSlug/join/:token"
                      component={PrivateChannelJoin}
                    />
                    <Route
                      path="/:communitySlug/:channelSlug/join"
                      component={PrivateChannelJoin}
                    />
                    <Route
                      path="/:communitySlug/settings"
                      component={CommunitySettingsFallback}
                    />
                    <Route
                      path="/:communitySlug/join/:token"
                      component={PrivateCommunityJoin}
                    />
                    <Route
                      path="/:communitySlug/login"
                      component={CommunityLoginFallback}
                    />
                    <Route
                      // NOTE(@mxstbr): This custom path regexp matches threadId correctly in all cases, no matter if we prepend it with a custom slug or not.
                      // Imagine our threadId is "id-123-id" (similar in shape to an actual UUID)
                      // - /id-123-id => id-123-id, easy start that works
                      // - /some-custom-slug~id-123-id => id-123-id, custom slug also works
                      // - /~id-123-id => id-123-id => id-123-id, empty custom slug also works
                      // - /some~custom~slug~id-123-id => id-123-id, custom slug with delimiter char in it (~) also works! :tada:
                      path="/:communitySlug/:channelSlug/(.*~)?:threadId"
                      component={ThreadView}
                    />
                    <Route
                      path="/:communitySlug/:channelSlug"
                      component={ChannelView}
                    />
                    <Route path="/:communitySlug" component={CommunityView} />
                  </Switch>
                </div>

                {isModal && (
                  <Route
                    path="/thread/:threadId"
                    component={RedirectOldThreadRoute}
                  />
                )}

                {isModal && (
                  <Route
                    path="/new/thread"
                    render={props => (
                      <ComposerFallback
                        {...props}
                        previousLocation={this.previousLocation}
                        isModal
                      />
                    )}
                  />
                )}

                {isModal && (
                  <Route
                    path="/new/message"
                    render={props => (
                      <NewDirectMessageFallback
                        {...props}
                        previousLocation={this.previousLocation}
                        isModal
                      />
                    )}
                  />
                )}
              </AppViewWrapper>
            </RouteModalContext.Provider>
          </NavigationContext.Provider>
        </ThemeProvider>
      </ErrorBoundary>
    );
  }
}

export default compose(
  withCurrentUser,
  withRouter
)(Routes);
