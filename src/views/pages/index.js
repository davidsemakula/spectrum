// @flow
import * as React from 'react';
import { Redirect } from 'react-router';
import Nav from './components/nav';
import Support from './support';
import Features from './features';
import Home from './home';
import Terms from './terms';
import Privacy from './privacy';
import Faq from './faq';
import Apps from './apps';
import { StyledViewGrid } from './style';

type Props = {
  match: Object,
};

const REDIRECT_MAPPING = {
  "/about": "https://www.keyy.org/about",
  "/terms": "https://www.keyy.org/termsofservice",
  "/privacy": "https://www.keyy.org/privacypolicy",
  "/code-of-conduct": "https://learn.keyy.org/keyy-support/getting-started/keyys-code-of-conduct~87204628-d977-4945-af9d-2f60d3e38c9f",
  "/support": "https://learn.keyy.org/keyy-support/",
};

class Pages extends React.Component<Props> {
  renderPage = () => {
    const redirectUrl = REDIRECT_MAPPING[this.props.match.path.replace(/\.html?$/i, "")];
    if (redirectUrl) {
      if (global.location) {
        global.location.replace(redirectUrl);
      }
      return <Redirect to={redirectUrl} />;
    }
    switch (this.props.match.path) {
      case '/support': {
        return <Support {...this.props} />;
      }
      case '/features': {
        return <Features {...this.props} />;
      }
      case '/terms':
      case '/terms.html': {
        return <Terms {...this.props} />;
      }
      case '/privacy':
      case '/privacy.html': {
        return <Privacy {...this.props} />;
      }
      case '/faq': {
        return <Faq {...this.props} />;
      }
      case '/apps': {
        return <Apps {...this.props} />;
      }
      case '/':
      case '/about':
      default: {
        return <Home {...this.props} />;
      }
    }
  };

  render() {
    const {
      match: { path },
    } = this.props;
    const dark = path === '/' || path === '/about';

    return (
      <StyledViewGrid>
        <div style={{ position: 'relative' }}>
          <Nav
            dark={dark ? 'true' : undefined}
            location={this.props.match.path.substr(1)}
          />
          {this.renderPage()}
        </div>
      </StyledViewGrid>
    );
  }
}

export default Pages;
