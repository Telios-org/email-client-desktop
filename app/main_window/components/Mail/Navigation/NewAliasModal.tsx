import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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

// REDUX ACTION
import { registerNamespace } from '../../../actions/mailbox/aliases';

// SELECTORS
import { selectActiveMailbox } from '../../../selectors/mail';

import i18n from '../../../../i18n/i18n';
import mail from '../../../reducers/mail';

const { StringType } = Schema.Types;

const formModel = Schema.Model({
  namespace: StringType(),
  alias: StringType()
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

type Props = {
  show: boolean;
  onHide: () => void;
};

export default function NewFolderModal(props: Props) {
  const dispatch = useDispatch();
  const mailbox = useSelector(selectActiveMailbox);
  const { show, onHide } = props;
  const [formValue, setFormValue] = useState({
    namespace: '',
    alias: ''
  });
  const formEl = useRef(null);

  const handleSubmit = async () => {
    const { id } = mailbox;
    const { namespace } = formValue;
    console.log('ALIAS_MODAL::PAYLOAD', namespace, id);
    await dispatch(registerNamespace(id, namespace));
  };

  return (
    <div className="modal-container">
      <Modal show={show} onHide={onHide}>
        <Modal.Header>
          <Modal.Title className="font-bold"> Add Alias</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form
            fluid
            ref={formEl}
            className="text-sm mt-5"
            model={formModel}
            formValue={formValue}
            onChange={val => {
              setFormValue({ ...val });
            }}
          >
            <FormGroup>
              <ControlLabel className="font-medium mb-2 text-gray-500">
                {i18n.t('mailbox.accountNamespace')}
              </ControlLabel>

              <FormControl name="namespace" />
            </FormGroup>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button type="submit" appearance="primary" onClick={handleSubmit}>
            {i18n.t('global.submit')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
