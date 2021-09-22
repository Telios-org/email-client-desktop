import React from 'react';
import {
  Button,
  Modal,
  Form,
  FormGroup,
  ControlLabel,
  FormControl,
  Schema,
  Icon
} from 'rsuite';

import Mail from '../../../../services/mail.service';

import i18n from '../../../../i18n/i18n';

const { StringType } = Schema.Types;

const formModel = Schema.Model({
  folderName: StringType()
});

const initialState = {
  formValue: {
    folderName: ''
  },
  formError: null,
  canSubmit: false,
  loading: false,
  folderIsSet: false
};

class NewFolderModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = initialState;
    this.close = this.close.bind(this);
    this.handleCheck = this.handleCheck.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleUpdate = this.handleUpdate.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
  }

  componentDidUpdate(prevProps) {
    if(this.props.folder && prevProps.folder && prevProps.folder.name !== this.props.folder.name && !this.state.folderIsSet || !prevProps.folder && this.props.folder) {
      this.setState({ formValue: { folderName: this.props.folder.name }, folderIsSet: true });
    }

    // if(!this.props.folder && prevProps.folder && folderIsSet) {
    //   this.setState({ formValue: { folderName: '' }, folderIsSet: false });
    // }
  }

  close() {
    const { hide } = this.props;
    this.setState(initialState);
    hide();
  }

  handleCheck(formValue) {
    const state = { ...this.state };

    state.formValue = formValue;

    if (!state.formValue.folderName) {
      state.canSubmit = false;
      this.setState(state);
      return;
    }

    state.canSubmit = true;
    this.setState(state);
  }

  async handleSubmit() {
    const state = { ...this.state };
    const { mailbox, onCreateFolder, folderCount } = this.props;

    let count = folderCount;

    state.loading = true;
    this.setState(state);

    try {
      const folder = await Mail.createFolder({
        mailboxId: mailbox.id,
        name: state.formValue.folderName,
        type: 'custom',
        icon: 'folder-o',
        seq: count += 1
      });

      onCreateFolder(folder);
    } catch (err) {
      console.log(err);
    }

    this.setState(initialState);
    this.close();
  }

  async handleUpdate() {
    const state = { ...this.state };
    let { folder, onRefresh } = this.props;

    state.loading = true;
    this.setState(state);

    try {
      const f = await Mail.updateFolder({
        folderId: folder.id,
        name: state.formValue.folderName
      });

      onRefresh();
    } catch (err) {
      console.log(err);
    }

    this.setState(initialState);
    this.close();
  }

  async handleDelete() {
    const state = { ...this.state };
    let { folder, mailbox, onRefresh } = this.props;

    state.loading = true;
    this.setState(state);

    try {
      await Mail.deleteFolder({
        mailboxId: mailbox.id,
        folderId: folder.id
      });

      onRefresh(true, folder.index);
    } catch (err) {
      console.log(err);
    }

    this.setState(initialState);
    this.close();
  }

  handleKeyUp(e) {
    if (e.key === 'Enter') {
      this.handleSubmit();
    }
  }

  render() {
    const { show, folder } = this.props;
    const { formValue, formError, canSubmit, loading } = this.state;

    return (
      <div className="modal-container">
        <Modal show={show} onHide={this.close}>
          <Modal.Header>
            <Modal.Title className="font-boldfgv bch bgvf">
            {folder && !folder.name || !folder ? i18n.t('global.createFolder') : i18n.t('global.updateFolder') }
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form
              fluid
              ref={ref => (this.form = ref)}
              className="text-sm mt-5"
              model={formModel}
              formValue={formValue}
              onChange={formValue => {
                this.handleCheck(formValue);
              }}
            >
              <FormGroup>
                <ControlLabel className="font-medium mb-2 text-gray-500">
                  {i18n.t('mailbox.folderName')}
                </ControlLabel>

                <FormControl
                  disabled={loading}
                  name="folderName"
                  onKeyUp={this.handleKeyUp}
                />
                {/* <div style={errorStyles(formError)}>{formError}</div> */}
              </FormGroup>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            {!this.props.folder &&(
              <Button
                type="submit"
                appearance="primary"
                onClick={this.handleSubmit}
                disabled={!canSubmit}
                loading={loading}
              >
                {i18n.t('global.submit')}
              </Button>
            )}

            {this.props.folder && (
              <Button
                type="submit"
                appearance="primary"
                onClick={this.handleUpdate}
                disabled={!canSubmit}
                loading={loading}
              >
                {i18n.t('global.update')}
              </Button>
            )}
            <Button onClick={this.close} appearance="subtle">
              {i18n.t('global.cancel')}
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal show={this.props.showDelete} onHide={this.close} size="xs">
          <Modal.Body>
            <Icon
              icon="remind"
              style={{
                color: '#ffb300',
                fontSize: 24
              }}
            />
            {'  '}
            Deleting this folder will delete all emails and attachments inside of it.
          </Modal.Body>
          <Modal.Footer>
            <Button
              onClick={this.handleDelete}
              appearance="primary"
              color="red"
              loading={loading}
            >
              Delete
            </Button>
            <Button onClick={this.close} appearance="subtle">
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default NewFolderModal;
