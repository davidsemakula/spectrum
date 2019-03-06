// @flow
import * as React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import { Link } from 'react-router-dom';
import Icon from 'src/components/icon';
import FullscreenView from 'src/components/fullscreenView';
import LoginButtonSet from 'src/components/loginButtonSet';
import {
  LargeTitle,
  LargeSubtitle,
  UpsellIconContainer,
  FullscreenContent,
  CodeOfConduct,
} from './style';
import queryString from 'query-string';
import { track, events } from 'src/helpers/analytics';
import { CLIENT_URL } from 'src/api/constants';
import { setTitlebarProps } from 'src/actions/titlebar';

type Props = {
  redirectPath: ?string,
  signinType?: ?string,
  close?: Function,
  location?: Object,
  dispatch: Function,
};

class Login extends React.Component<Props> {
  componentDidMount() {
    let redirectPath;
    const { dispatch } = this.props;
    dispatch(setTitlebarProps({ title: 'Login' }));

    if (this.props.location) {
      const searchObj = queryString.parse(this.props.location.search);
      redirectPath = searchObj.r;
    }

    track(events.LOGIN_PAGE_VIEWED, { redirectPath });
  }

  render() {
    const { redirectPath, signinType = 'signin' } = this.props;

    const viewTitle =
      signinType === 'login' ? 'Welcome back!' : 'Sign in to get started';

    const viewSubtitle =
      signinType === 'login'
        ? "We're happy to see you again - sign in below to get back into the conversation!"
        : 'Keyy is an alternative educational experience designed to help achieve your goals with less time, frustration, and money - while feeling inspired, challenged and loved.';

    return (
      <FullscreenView closePath={CLIENT_URL}>
        <FullscreenContent
          data-cy="login-page"
          style={{ justifyContent: 'center' }}
        >
          <UpsellIconContainer>
            <Icon glyph={'login-page-logo'} size={120} tipText={'logo'} />
          </UpsellIconContainer>
          <LargeTitle>{viewTitle}</LargeTitle>
          <LargeSubtitle>{viewSubtitle}</LargeSubtitle>

          <LoginButtonSet redirectPath={redirectPath} signinType={signinType} />

          <CodeOfConduct>
            By using Keyy, you agree to our{' '}
            <a
              href="https://learn.keyy.org/keyy-support/getting-started/keyys-code-of-conduct~87204628-d977-4945-af9d-2f60d3e38c9f"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                track(events.CODE_OF_CONDUCT_CLICKED, { location: 'login' })
              }
            >
              Code of Conduct
            </a>
            ,{' '}
            <a
              href="https://www.keyy.org/privacypolicy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy Policy
            </a>{' '}
            and{' '}
            <a
              href="https://www.keyy.org/termsofservice"
              target="_blank"
              rel="noopener noreferrer"
            >
              Terms of Service
            </a>
            .
          </CodeOfConduct>
        </FullscreenContent>
      </FullscreenView>
    );
  }
}

export default compose(
  withRouter,
  connect()
)(Login);
