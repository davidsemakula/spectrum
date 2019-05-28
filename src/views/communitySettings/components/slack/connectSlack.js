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

    const url = `/api/slack/connect?community=${community.id}&${
      isOnboarding ? 'onboarding=1' : ''
    }`;

    return (
      <SectionCard>
        <SectionTitleWithIcon>
          <Icon glyph={'slack-colored'} size={32} />
          Connect a Slack team
        </SectionTitleWithIcon>
        <SectionSubtitle>
          Invite your Slack team to your learning group or get notified when new
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
