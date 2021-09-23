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
import { registerNamespace } from '../../../../actions/mailbox/aliases';

// SELECTORS
import { selectActiveMailbox } from '../../../../selectors/mail';

import i18n from '../../../../../i18n/i18n';
import mail from '../../../../reducers/mail';

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

export default function AliasModal(props: Props) {
  const dispatch = useDispatch();
  const mailbox = useSelector(selectActiveMailbox);
  const { show, onHide } = props;
  const [formValue, setFormValue] = useState({
    namespace: '',
    alias: ''
  });
  const [errorBlock, setErrorBlock] = useState({
    namespace: {
      showError: false,
      msg: ''
    },
    alias: {
      showError: false,
      msg: ''
    }
  });
  const formEl = useRef(null);

  const handleSubmit = async () => {
    const { id } = mailbox;
    const { namespace } = formValue;

    // In case of retry clear out error block.
    setErrorBlock({
      ...errorBlock,
      namespace: {
        showError: false,
        msg: ''
      }
    });

    const { status, success } = await dispatch(
      registerNamespace(id, namespace)
    );

    if (!success && status === 'already-registered') {
      setErrorBlock({
        ...errorBlock,
        namespace: {
          showError: true,
          msg: 'Alias namespace is unavailable.'
        }
      });
    }
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
              <div
                className={`${
                  errorBlock.namespace.showError ? 'text-red-500' : 'hidden'
                }`}
              >
                {errorBlock.namespace.msg}
              </div>
            </FormGroup>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button type="submit" appearance="primary" onClick={handleSubmit}>
            {i18n.t('global.create')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
