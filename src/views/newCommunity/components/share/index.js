// @flow
import React from 'react';
import { withRouter } from 'react-router';
import compose from 'recompose/compose';
import {
  OutlineButton,
  PrimaryButton,
  FacebookButton,
  TwitterButton,
} from 'src/components/button';
import { ButtonRow, InputRow, Input } from './style';
import { Description } from '../../style';
import { Loading } from 'src/components/loading';
import Clipboard from 'react-clipboard.js';

import DOMAIN from 'shared/site-domain';

const Share = ({ community, onboarding }) => {
  if (!community) return <Loading />;

  return (
    <div>
      <ButtonRow>
        <FacebookButton
          href={`https://www.facebook.com/sharer/sharer.php?u=https://${DOMAIN}/${encodeURIComponent(
            community.slug
          )}&t=Come hang out with me in the ${
            community.name
          } community on Grindery!`}
        >
          Share on Facebook
        </FacebookButton>

        <TwitterButton
          href={`https://twitter.com/share?text=Come hang out with me in the ${
            community.name
          } community on @withgrindery!&url=https://${DOMAIN}/${encodeURIComponent(
            community.slug
          )}`}
        >
          Share on Twitter
        </TwitterButton>
      </ButtonRow>

      <Clipboard
        component="div"
        data-clipboard-text={`https://${DOMAIN}/${community.slug}`}
      >
        <InputRow>
          <Input>{`https://${DOMAIN}/${community.slug}`}</Input>
        </InputRow>
      </Clipboard>

      {onboarding && (
        <ButtonRow>
          <Description centered>
            You’re ready to start building your community - you can view it now,
            or manage your settings at any time
          </Description>
          <OutlineButton to={`/${community.slug}/settings`}>
            View community settings
          </OutlineButton>
          <PrimaryButton to={`/${community.slug}`}>
            Go to my community
          </PrimaryButton>
        </ButtonRow>
      )}
    </div>
  );
};

export default compose(withRouter)(Share);
