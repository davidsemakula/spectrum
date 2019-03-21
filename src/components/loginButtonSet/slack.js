// @flow
import * as React from 'react';
import type { ButtonProps } from './';
import { SlackButton, Label, A } from './style';
import Icon from '../icons';

export const SlackSigninButton = (props: ButtonProps) => {
  const { href, preferred, showAfter, onClickHandler } = props;

  return (
    <A onClick={() => onClickHandler && onClickHandler('slack')} href={href}>
      <SlackButton showAfter={showAfter} preferred={preferred}>
        <Icon glyph={'slack'} />
        <Label>Sign in with Slack</Label>
      </SlackButton>
    </A>
  );
};
