// @flow
import * as React from 'react';
import {
  Footer,
  FooterGrid,
  Masthead,
  Support,
  Apps,
  Safety,
  SocialLinks,
} from '../style';
import { Link } from 'react-router-dom';
import Icon from 'src/components/icon';
import { Logo } from 'src/components/logo';
import { track, events } from 'src/helpers/analytics';

export default () => {
  return (
    <Footer>
      <FooterGrid>
        <Masthead>
          <Link to="/">
            <Logo />
          </Link>
          <SocialLinks>
            <a
              href="https://github.com/withspectrum"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon glyph="github" hoverColor={'text.reverse'} />
            </a>
            <a
              href="https://twitter.com/withkeyy"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon glyph="twitter" hoverColor={'text.reverse'} />
            </a>
          </SocialLinks>
        </Masthead>
        <Apps>
          <span>Apps</span>
          <Link to={`/apps`}>Mac</Link>
        </Apps>
        <Support>
          <span>Support</span>
          <Link to={`/spectrum`}>Learning group</Link>
          <Link to={`/spectrum/hugs-n-bugs`}>Bug reports</Link>
          <Link to={`/spectrum/feature-requests`}>Feature requests</Link>
          <a href="mailto:hi@learn.keyy.org">Email support</a>
        </Support>
        <Safety>
          <span>Safety</span>
          <a
            href="https://learn.keyy.org/keyy-support/getting-started/keyys-code-of-conduct~87204628-d977-4945-af9d-2f60d3e38c9f"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              track(events.CODE_OF_CONDUCT_CLICKED, {
                location: 'splash page footer',
              })
            }
          >
            Code of Conduct
          </a>
          <a
            href="https://www.keyy.org/privacypolicy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy
          </a>
          <a
            href="https://www.keyy.org/termsofservice"
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms of Service
          </a>
        </Safety>
      </FooterGrid>
    </Footer>
  );
};
