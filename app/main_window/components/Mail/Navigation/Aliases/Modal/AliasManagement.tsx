import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button,
  Modal,
  Form,
  FormGroup,
  FormControl,
  Schema,
  InputGroup
} from 'rsuite';

import RandomIcon from '@rsuite/icons/Random';
import { generateSlug } from 'random-word-slugs';

// REDUX ACTION
import { registerNamespace } from '../../../../../actions/mailbox/aliases';

// SELECTORS
import {
  selectActiveMailbox,
  selectFirstNamespace
} from '../../../../../selectors/mail';

import i18n from '../../../../../../i18n/i18n';

const { StringType } = Schema.Types;

const formModel = Schema.Model({
  namespace: StringType()
});

type Props = {
  show: boolean;
  onHide: () => void;
};

const initialFormState = {
  namespace: ''
};

export default function AliasModal(props: Props) {
  const dispatch = useDispatch();
  const mailbox = useSelector(selectActiveMailbox);
  const firstNamespace = useSelector(selectFirstNamespace);

  const { onHide, show } = props;
  const [formValue, setFormValue] = useState(initialFormState);
  const [errorBlock, setErrorBlock] = useState({
    namespace: {
      showError: false,
      msg: ''
    }
  });
  const formEl = useRef(null);

  const disableNsCreation = formValue.namespace.length === 0;

  useEffect(() => {
    if (firstNamespace !== null) {
      setFormValue({
        namespace: firstNamespace.name
      });
    } else {
      setFormValue(initialFormState);
    }
  }, [firstNamespace, show]);

  const handleSubmit = async () => {
    const { id } = mailbox;
    const { namespace } = formValue;

    // In case of retry clear out error block.
    setErrorBlock({
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
        namespace: {
          showError: true,
          msg: 'Namespace is unavailable.'
        }
      });
    }
  };

  const handleChange = val => {
    setErrorBlock({
      namespace: {
        showError: false,
        msg: ''
      }
    });
    setFormValue({ ...val });
  };

  const generateRandomString = () => {
    const slug = generateSlug(2, {
      format: 'kebab',
      partsOfSpeech: ['adjective', 'noun']
    });

    handleChange({ namespace: slug });
  };

  return (
    <>
      <Modal.Header>
        <Modal.Title className="font-bold">
          {i18n.t('aliasing.alias_management')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="">
          <p className="text-sm">
            <b>Option 1</b>
          </p>
          <p className="text-sm">
            <b>Option 2</b>
          </p>
          <p className="text-sm text-center bg-coolGray-100 shadow-sm border border-coolGray-200 py-2 my-3 rounded">
            <b>namespace</b>
            <b className="text-purple-500">#myalias</b>
            <b>@telios.io</b>

          </p>
          <p className="text-sm">
          </p>
        </div>
      </Modal.Body>
      <Modal.Footer className="flex justify-between">
        {/* <div className="flex flex-1 justify-items-start">
          <Button
            onClick={onHide}
            appearance="ghost"
            className="border-coolGray-300 text-coolGray-400 tracking-wide"
          >
            Cancel
          </Button>
        </div>
        <div className="flex-1">
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={disableNsCreation}
            className={`tracking-wide ${
              disableNsCreation
                ? 'bg-coolGray-100 text-gray-400'
                : 'bg-purple-600 text-white'
            } border-color-purple-800 shadow-sm`}
          >
            {i18n.t('global.create')}
          </Button>
        </div> */}
      </Modal.Footer>
    </>
  );
}
