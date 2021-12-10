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
  ControlLabel
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

import { validateString } from '../../../../../../utils/helpers/regex';

const { StringType } = Schema.Types;

const formModel = Schema.Model({
  namespace: StringType()
});

type Props = {
  show: boolean;
  onHide: () => void;
  domain: string;
};

const initialFormState = {
  namespace: ''
};

export default function AliasModal(props: Props) {
  const dispatch = useDispatch();
  const mailbox = useSelector(selectActiveMailbox);
  const firstNamespace = useSelector(selectFirstNamespace);

  const { onHide, show, domain } = props;
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

    if (validateString(namespace)) {
      const { status, success } = await dispatch(
        registerNamespace(id, namespace.toLowerCase())
      );

      if (!success && status === 'already-registered') {
        setErrorBlock({
          namespace: {
            showError: true,
            msg: 'Namespace is unavailable.'
          }
        });
      }
    } else {
      setErrorBlock({
        namespace: {
          showError: true,
          msg:
            'Malformed Namespace, special characters not allowed.'
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
      partsOfSpeech: ['adjective', 'noun'],
      categories: {
        noun: [
          'animals',
          'place',
          'food',
          'sport',
          'science',
          'technology',
          'thing'
        ],
        adjective: ['color', 'shapes', 'sounds', 'time']
      }
    }).replace('-', '');

    handleChange({ namespace: slug });
  };
  return (
    <>
      <Modal.Header>
        <Modal.Title className="font-bold">
          {i18n.t('aliasing.ns_choose')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mx-36">
          <div className="">
            <p className="text-sm">
              To create aliases you first need to create an alias namespace.
              This namespace will be the basis for all your aliases as shown
              below.
            </p>
            <p className="text-sm text-center bg-coolGray-100 shadow-sm border border-coolGray-200 py-2 my-3 rounded">
              <b className="text-blue-500">
                {formValue.namespace.length === 0
                  ? 'namespace'
                  : formValue.namespace}
              </b>
              <b>{`#myalias@${domain}`}</b>
            </p>
            <p className="text-sm">
              You namespace is unique to you. You can choose it yourself or
              randomly generate it.
            </p>
          </div>
          <Form
            fluid
            ref={formEl}
            className="text-sm mt-5"
            model={formModel}
            formValue={formValue}
            onChange={handleChange}
          >
            <FormGroup controlId="namespace" className="relative mb-4">
              <ControlLabel className="text-coolGray-600 font-semibold text-sm">
                Namespace
              </ControlLabel>
              <InputGroup className="w-full">
                <FormControl name="namespace" placeholder="Make your choice" />

                <InputGroup.Button
                  className="group"
                  onClick={generateRandomString}
                >
                  <RandomIcon className="group-hover:text-blue-600" />
                </InputGroup.Button>
              </InputGroup>
              <div
                className={`absolute w-full text-center ${
                  errorBlock.namespace.showError ? 'text-red-500' : 'hidden'
                }`}
                style={{ bottom: '-25px', marginLeft: '10px' }}
              >
                {errorBlock.namespace.msg}
              </div>
            </FormGroup>
          </Form>
        </div>
      </Modal.Body>
      <Modal.Footer className="flex justify-between">
        <div className="flex flex-1 justify-items-start">
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
