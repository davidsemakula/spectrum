// @flow
import * as React from 'react';
import type { GetSlackSettingsType } from 'shared/graphql/queries/community/getCommunitySlackSettings';
import {
  SectionCard,
  SectionTitleWithIcon,
  SectionSubtitle,
  SectionCardFooter,
} from 'src/components/settingsViews/style';
import { OutlineButton } from 'src/components/button';
import Icon from 'src/components/icon';

type Props = {
  community: GetSlackSettingsType,
  isOnboarding: boolean,
};

class ImportSlackTeam extends React.Component<Props> {
  render() {
    const { community, isOnboarding = false } = this.props;

    const url = isOnboarding
      ? `https://slack.com/oauth/authorize?client_id=${
          process.env.SLACK_CLIENT_ID
        }&scope=users:read.email%20users:read%20chat:write:bot%20groups:read%20channels:read&state=${
          community.id
        }&redirect_uri=${
          process.env.NODE_ENV === 'development'
            ? 'http://localhost:3001/api/slack/onboarding'
            : 'https://chat.grindery.io/api/slack/onboarding'
        }`
      : `https://slack.com/oauth/authorize?client_id=${
          process.env.SLACK_CLIENT_ID
        }&scope=users:read.email%20users:read%20chat:write:bot%20groups:read%20channels:read&state=${
          community.id
        }&redirect_uri=${
          process.env.NODE_ENV === 'development'
            ? 'http://localhost:3001/api/slack'
            : 'https://chat.grindery.io/api/slack'
        }`;

    return (
      <SectionCard>
        <SectionTitleWithIcon>
          <Icon glyph={'slack-colored'} size={32} />
          Connect a Slack team
        </SectionTitleWithIcon>
        <SectionSubtitle>
          Invite your Slack team to your community or get notified when new
          conversations are created.
        </SectionSubtitle>

        <SectionCardFooter>
          <a href={url}>
            <OutlineButton>Connect a Slack team</OutlineButton>
          </a>
        </SectionCardFooter>
      </SectionCard>
    );
  }
}

export default ImportSlackTeam;
