// @flow
import React from 'react';
import { withRouter } from 'react-router';
import compose from 'recompose/compose';
import { OutlineButton, Button } from 'src/components/button';
import { ButtonRow, InputRow, Input } from './style';
import { Description } from '../../style';
import { Loading } from '../../../../components/loading';
import Clipboard from 'react-clipboard.js';

const Share = ({ community, history, onboarding }) => {
  if (!community) return <Loading />;

  return (
    <div>
      <ButtonRow>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=https://learn.keyy.org/${encodeURIComponent(
            community.slug
          )}&t=Come hang out with me in the ${
            community.name
          } learning group on Keyy!`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button
            icon="facebook"
            gradientTheme={'none'}
            hoverColor={'social.facebook.default'}
            color={'social.facebook.default'}
          >
            Share on Facebook
          </Button>
        </a>
        <a
          href={`https://twitter.com/share?text=Come hang out with me in the ${
            community.name
          } learning group on @withkeyy!&url=https://learn.keyy.org/${encodeURIComponent(
            community.slug
          )}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button
            icon="twitter"
            gradientTheme={'none'}
            hoverColor={'social.twitter.default'}
            color={'social.twitter.default'}
          >
            Share on Twitter
          </Button>
        </a>
      </ButtonRow>

      <Clipboard
        component="div"
        data-clipboard-text={`https://learn.keyy.org/${community.slug}`}
      >
        <InputRow>
          <Input>{`https://learn.keyy.org/${community.slug}`}</Input>
        </InputRow>
      </Clipboard>

      {onboarding && (
        <ButtonRow>
          <Description centered>
            You're ready to start building your learning group - you can view it
            now, or manage your settings at any time
          </Description>
          <a href={`/${community.slug}/settings`}>
            <OutlineButton>View learning group settings</OutlineButton>
          </a>
          <a href={`/${community.slug}`}>
            <Button>Go to my learning group</Button>
          </a>
        </ButtonRow>
      )}
    </div>
  );
};

export default compose(withRouter)(Share);
