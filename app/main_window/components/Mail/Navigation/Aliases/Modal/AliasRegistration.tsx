import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button,
  Modal,
  Form,
  FormGroup,
  FormControl,
  Schema,
  InputGroup,
  IconButton,
  Icon
} from 'rsuite';

import { ArrowLeft } from 'react-iconly';
import { generateSlug } from 'random-word-slugs';

// REDUX ACTION
import { registerNamespace } from '../../../../../actions/mailbox/aliases';

// SELECTORS
import {
  selectActiveMailbox,
  selectFirstNamespace
} from '../../../../../selectors/mail';

import i18n from '../../../../../../i18n/i18n';
import { namespace } from '../../../../../../app.global.less';

const { StringType } = Schema.Types;

const formModel = Schema.Model({
  namespace: StringType()
});

type Props = {
  show: boolean;
  onHide: () => void;
  onShowManagement: () => void;
};

const initialFormState = {
  namespace: ''
};

export default function AliasModal(props: Props) {
  const dispatch = useDispatch();
  const mailbox = useSelector(selectActiveMailbox);
  const firstNamespace = useSelector(selectFirstNamespace);

  const { onHide, show, onShowManagement } = props;
  const [formValue, setFormValue] = useState(initialFormState);
  const [errorBlock, setErrorBlock] = useState({
    namespace: {
      showError: false,
      msg: ''
    }
  });
  const [showHelp, setShowHelp] = useState(false);
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
    setShowHelp(false);
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

  const toggleHelp = () => {
    setShowHelp(!showHelp);
  };

  return (
    <>
      <Modal.Header>
        <Modal.Title className="font-bold flex-row flex justify-between select-none">
          <div>{i18n.t('aliasing.alias_registration')}</div>
        </Modal.Title>
        <div className="text-xs">
          <span>Namespace:</span>
          <span className="font-semibold text-blue-500 capitalize ml-1">
            {firstNamespace.name}
          </span>
        </div>
      </Modal.Header>
      <Modal.Body className="mt-5" />
      <Modal.Footer className="flex justify-between">
        <div className="flex flex-1 justify-items-start">
          <Button
            onClick={onShowManagement}
            appearance="ghost"
            className="border-coolGray-300 text-coolGray-400 tracking-wide text-sm py-1 px-2"
          >
            <ArrowLeft set="broken" size="small"/>
          </Button>
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
        </div>
      </Modal.Footer>
    </>
  );
}
