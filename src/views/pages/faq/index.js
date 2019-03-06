// @flow
import * as React from 'react';
import PageFooter from '../components/footer';
import { Wrapper } from '../style';
import {
  ContentContainer,
  Heading,
  Section,
  SectionTitle,
  SectionDescription,
} from '../pricing/style';
import { PrivacyTermsList } from '../terms/style';
import Head from 'src/components/head';

class FAQ extends React.Component<{}> {
  componentDidMount() {}

  render() {
    return (
      <Wrapper data-cy="faq-page">
        <Head
          title={'Keyy · FAQ'}
          description={'Frequently asked questions about Keyy'}
        />

        <ContentContainer>
          <Heading>Frequently Asked Questions</Heading>

          <Section>
            <SectionTitle>
              What happens when I delete my account on Keyy?
            </SectionTitle>

            <SectionDescription>
              We want deleting your Keyy account to be as simple and
              straightforward as possible. As soon as you confirm that you would
              like to delete your account, the following events happen
              immediately:
            </SectionDescription>

            <PrivacyTermsList>
              <li>
                All of your personal profile information will be deleted in our
                database. This includes your name, username, profile photo,
                cover photo, description, and any connections to 3rd party
                social networks (that you use to sign in to Keyy).
              </li>
              <li>
                All existing memberships you have in any learning group will be
                disabled.
              </li>
              <li>
                You will be logged out and returned to the Keyy home page.
              </li>
            </PrivacyTermsList>

            <SectionDescription>
              The messages and conversations that you have posted will not be
              deleted, in order to preserve the integrity of the public nature
              of discussions on Keyy. Any messages or conversations that remain
              undeleted will not be identifiable as yours.
            </SectionDescription>

            <SectionDescription>
              If you wish to delete any messages or conversations on Keyy,
              please do this prior to deleting your account. You can view all
              conversations where you’re active by viewing your profile.
            </SectionDescription>

            <SectionDescription>
              All backups containing personal information are deleted after 30
              days.
            </SectionDescription>
          </Section>
        </ContentContainer>
        <PageFooter />
      </Wrapper>
    );
  }
}
export default FAQ;
