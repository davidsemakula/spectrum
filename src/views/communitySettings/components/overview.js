// @flow
import * as React from 'react';
import EditForm from './editForm';
import EditCTAForm from './editCTAForm';
import ChannelList from './channelList';
import BrandedLogin from './brandedLogin';
import { SectionsContainer, Column } from 'src/components/settingsViews/style';
import SlackSettings from './slack';
import Watercooler from './watercooler';
import HubSpotSettings from './hubspot';
import ZapierSettings from './zapier';
import { ErrorBoundary, SettingsFallback } from 'src/components/error';

type Props = {
  communitySlug: string,
  community: Object,
};

class Overview extends React.Component<Props> {
  render() {
    const { community, communitySlug } = this.props;

    return (
      <SectionsContainer>
        <Column>
          <ErrorBoundary fallbackComponent={SettingsFallback}>
            <EditForm community={community} />
          </ErrorBoundary>
          {community.isPrivate ? (
            <ErrorBoundary fallbackComponent={SettingsFallback}>
              <EditCTAForm community={community} />
            </ErrorBoundary>
          ) : null}
        </Column>
        <Column>
          <ErrorBoundary fallbackComponent={SettingsFallback}>
            <SlackSettings id={community.id} />
          </ErrorBoundary>

          <ErrorBoundary fallbackComponent={SettingsFallback}>
            <BrandedLogin id={community.id} />
          </ErrorBoundary>

          <ErrorBoundary fallbackComponent={SettingsFallback}>
            <Watercooler id={community.id} />
          </ErrorBoundary>

          <ErrorBoundary fallbackComponent={SettingsFallback}>
            <ChannelList id={community.id} communitySlug={communitySlug} />
          </ErrorBoundary>

          <ErrorBoundary fallbackComponent={SettingsFallback}>
            <HubSpotSettings id={community.id} />
          </ErrorBoundary>

          <ErrorBoundary fallbackComponent={SettingsFallback}>
            <ZapierSettings community={community} />
          </ErrorBoundary>
        </Column>
      </SectionsContainer>
    );
  }
}

export default Overview;
