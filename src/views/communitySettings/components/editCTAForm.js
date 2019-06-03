// @flow
import * as React from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import editCommunityMutation from 'shared/graphql/mutations/community/editCommunity';
import type { EditCommunityType } from 'shared/graphql/mutations/community/editCommunity';
import type { GetCommunityType } from 'shared/graphql/queries/community/getCommunity';
import { addToastWithTimeout } from 'src/actions/toasts';
import { PrimaryOutlineButton } from 'src/components/button';
import { Input, TextArea, Error } from 'src/components/formElements';
import {
  Form,
  FormTitle,
  Description,
  Actions,
} from 'src/components/editForm/style';
import { SectionCard, SectionTitle } from 'src/components/settingsViews/style';
import type { Dispatch } from 'redux';

type State = {
  name: string,
  slug: string,
  description: string,
  communityId: string,
  website: string,
  image: string,
  coverPhoto: string,
  file: ?Object,
  coverFile: ?Object,
  communityData: Object,
  photoSizeError: boolean,
  linkError: boolean,
  isLoading: boolean,
};

type Props = {
  community: GetCommunityType,
  dispatch: Dispatch<Object>,
  editCommunity: Function,
};

class EditCTAForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { community } = this.props;
    const ctaSettings = community.ctaSettings || {};
    this.state = {
      communityId: community.id,
      isLoading: false,
      title: ctaSettings.title || '',
      body: ctaSettings.body || '',
      text: ctaSettings.text || '',
      link: ctaSettings.link || '',
    };
  }

  changeValue = (key, value) => {
    if (key === 'link' && !/https?:\/\//.test(value)) {
      this.setState({
        [key]: value,
        urlError: true,
      });

      return;
    }
    this.setState({
      [key]: value,
    });
  };

  save = e => {
    e.preventDefault();
    const { communityId, title, body, text, link } = this.state;

    if (!/https?:\/\//.test(link)) {
      this.setState({
        linkError: true,
      });

      return;
    }

    const input = {
      ctaSettings: {
        title,
        body,
        text,
        link,
      },
      communityId,
    };

    this.setState({
      isLoading: true,
      linkError: false,
    });

    this.props
      .editCommunity(input)
      .then(({ data }: EditCommunityType) => {
        const { editCommunity: community } = data;

        this.setState({
          isLoading: false,
        });

        // community was returned
        if (community !== undefined) {
          this.props.dispatch(
            addToastWithTimeout('success', 'Community CTA settings saved!')
          );
        }
        return;
      })
      .catch(err => {
        this.setState({
          isLoading: false,
        });

        this.props.dispatch(addToastWithTimeout('error', err.message));
      });
  };

  render() {
    const {
      linkError,
      isLoading,
      title: ctaTitle,
      body: ctaBody,
      text: ctaText,
      link: ctaLink,
    } = this.state;
    const { community } = this.props;

    if (!community) {
      return (
        <SectionCard>
          <FormTitle>This learning group doesn’t exist yet.</FormTitle>
          <Description>Want to make it?</Description>
          <Actions>
            <PrimaryOutlineButton>Create</PrimaryOutlineButton>
          </Actions>
        </SectionCard>
      );
    }

    return (
      <SectionCard>
        <SectionTitle>CTA Settings</SectionTitle>
        <Form onSubmit={this.save}>
          <Input
            dataCy="community-settings-name-input"
            defaultValue={ctaTitle}
            onChange={e => this.changeValue('title', e.target.value)}
          >
            CTA Title
          </Input>

          <TextArea
            defaultValue={ctaBody}
            onChange={e => this.changeValue('body', e.target.value)}
            dataCy="community-settings-description-input"
          >
            CTA Body
          </TextArea>

          <Input
            defaultValue={ctaText}
            onChange={e => this.changeValue('text', e.target.value)}
            dataCy="community-settings-website-input"
          >
            CTA Button Text
          </Input>

          <Input
            defaultValue={ctaLink}
            onChange={e => this.changeValue('link', e.target.value)}
            dataCy="community-settings-website-input"
          >
            CTA Button Link
          </Input>
          {linkError && <Error>Button Link must be a valid url.</Error>}

          <Actions>
            <PrimaryOutlineButton
              loading={isLoading}
              onClick={this.save}
              type="submit"
              data-cy="community-settings-edit-save-button"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </PrimaryOutlineButton>
          </Actions>
        </Form>
      </SectionCard>
    );
  }
}

export default compose(
  connect(),
  editCommunityMutation,
  withRouter
)(EditCTAForm);
