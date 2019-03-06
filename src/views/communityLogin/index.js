// @flow
import * as React from 'react';
import compose from 'recompose/compose';
import FullscreenView from 'src/components/fullscreenView';
import LoginButtonSet from 'src/components/loginButtonSet';
import { CommunityAvatar } from 'src/components/avatar';
import { CLIENT_URL } from 'src/api/constants';
import {
  Title,
  Subtitle,
  LoginImageContainer,
  FullscreenContent,
  CodeOfConduct,
} from './style';
import viewNetworkHandler, {
  type ViewNetworkHandlerType,
} from 'src/components/viewNetworkHandler';
import {
  getCommunityByMatch,
  type GetCommunityType,
} from 'shared/graphql/queries/community/getCommunity';
import queryString from 'query-string';
import { track, events } from 'src/helpers/analytics';
import { LoadingView, ErrorView } from 'src/views/viewHelpers';

type Props = {
  data: {
    community: GetCommunityType,
  },
  ...$Exact<ViewNetworkHandlerType>,
  history: Object,
  location: Object,
  match: Object,
  redirectPath: ?string,
};

type State = {
  redirectPath: ?string,
};

export class Login extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      redirectPath: props.redirectPath,
    };
  }

  escape = () => {
    this.props.history.push(`/${this.props.match.params.communitySlug}`);
  };

  componentDidMount() {
    const { location, redirectPath } = this.props;

    if (redirectPath) {
      this.setState({ redirectPath });
    }

    if (location && !redirectPath) {
      const searchObj = queryString.parse(this.props.location.search);
      this.setState({ redirectPath: searchObj.r });
    }

    track(events.LOGIN_PAGE_VIEWED, { redirectPath: this.state.redirectPath });
  }

  render() {
    const {
      data: { community },
      isLoading,
      match,
    } = this.props;
    const { redirectPath } = this.state;

    if (community && community.id) {
      const { brandedLogin } = community;

      return (
        <FullscreenView closePath={`${CLIENT_URL}`}>
          <FullscreenContent
            data-cy="community-login-page"
            style={{ justifyContent: 'center' }}
          >
            <LoginImageContainer>
              <CommunityAvatar
                community={community}
                showHoverProfile={false}
                size={88}
              />
            </LoginImageContainer>
            <Title>Sign in to the {community.name} learning group</Title>
            <Subtitle>
              {brandedLogin.message && brandedLogin.message.length > 0
                ? brandedLogin.message
                : 'Keyy is an alternative educational experience designed to help achieve your goals with less time, frustration, and money - while feeling inspired, challenged and loved.'}
            </Subtitle>

            <LoginButtonSet
              redirectPath={
                redirectPath || `${CLIENT_URL}/${match.params.communitySlug}`
              }
              signinType={'signin'}
            />

            <CodeOfConduct>
              By using Keyy, you agree to our{' '}
              <a
                href="https://learn.keyy.org/keyy-support/getting-started/keyys-code-of-conduct~87204628-d977-4945-af9d-2f60d3e38c9f"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  track(events.CODE_OF_CONDUCT_CLICKED, {
                    location: 'branded login',
                  })
                }
              >
                Code of Conduct
              </a>
            </CodeOfConduct>
          </FullscreenContent>
        </FullscreenView>
      );
    }

    if (isLoading) return <LoadingView />;

    return <ErrorView />;
  }
}

export default compose(
  getCommunityByMatch,
  viewNetworkHandler
)(Login);
