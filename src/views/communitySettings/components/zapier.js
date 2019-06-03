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
import { Input, Error } from 'src/components/formElements';
import {
  Form,
  FormTitle,
  Description,
  Actions,
} from 'src/components/editForm/style';
import {
  SectionCard,
  SectionTitle,
  SectionSubtitle,
} from 'src/components/settingsViews/style';
import { track, events, transformations } from 'src/helpers/analytics';
import type { Dispatch } from 'redux';

type State = {
  url: string,
  communityId: string,
  urlError: boolean,
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
    const zapierSettings = community.zapierSettings || {};
    this.state = {
      communityId: community.id,
      isLoading: false,
      url: zapierSettings.url || '',
    };
  }

  changeValue = (key, value) => {
    if (key === 'url' && !/https?:\/\//.test(value)) {
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
    const { communityId, url } = this.state;

    if (!/https?:\/\//.test(url)) {
      this.setState({
        urlError: true,
      });

      return;
    }

    const input = {
      zapierSettings: {
        url,
      },
      communityId,
    };

    this.setState({
      isLoading: true,
      urlError: false,
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
            addToastWithTimeout('success', 'Zapier settings saved!')
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
    const { urlError, isLoading, url } = this.state;
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
        <SectionTitle>Connect to Zapier</SectionTitle>
        <SectionSubtitle>
          Share activity from your learning group with your HubSpot portal.
        </SectionSubtitle>
        <Form onSubmit={this.save}>
          <Input
            dataCy="community-settings-name-input"
            defaultValue={url}
            onChange={e => this.changeValue('url', e.target.value)}
          >
            Zapier Webhook URL
          </Input>

          {urlError && <Error>Webhook URL must be a valid url.</Error>}

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
