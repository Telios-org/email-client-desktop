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

import { Danger } from 'react-iconly';
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
          <div>{i18n.t('aliasing.alias_management')}</div>
          <div
            onClick={toggleHelp}
            className="text-coolGray-400 font-extralight text-xs mr-4 mt-1 cursor-pointer hover:text-coolGray-600"
          >
            {`${showHelp ? 'Show' : 'Hide'} Help`}
          </div>
        </Modal.Title>
        <div className="text-xs">
          <span>Namespace:</span>
          <span className="font-semibold text-blue-500 capitalize ml-1">
            {firstNamespace.name}
          </span>
        </div>
      </Modal.Header>
      <Modal.Body className="mt-5">
        <div className={`text-sm mb-6 select-none ${showHelp ? '' : 'hidden'}`}>
          <p className="mb-4 text-sm">
            Need help creating aliases, you have
            <b> 2 options :</b>
          </p>
          <div className="pl-4">
            <p>
              <span>
                <b>Option 1 - </b>
                On the fly creation
              </span>
            </p>
            <p className="leading-relaxed">
              To create an alias on the fly useing your namespace, simply make
              up an alias
              <span className="bg-coolGray-100 shadow-sm border border-coolGray-200 rounded px-1 mx-1 font-bold">
                <span className="text-blue-500">
                  {firstNamespace && firstNamespace.name}
                </span>
                #
<span className="text-purple-600">mymadeupalias</span>
                @telios.io
              </span>
              and provide that to the service, website, newsletter or perosn in
              lieu of your primary email.
            </p>
            <p className="leading-relaxed text-xs text-coolGray-400 flex flex-row">
              <Danger set="broken" className="text-purple-600" />
              <span className="mt-1 ml-2 text-purple-600">
                The alias will show up in the app automatically as soon as it
                receives its first email.
              </span>
            </p>
            <p className="mt-4">
              <b>Option 2 - </b>
              In app creation
            </p>
            <p>
              Click the{' '}
              <span className="leading-relaxed bg-coolGray-100 shadow-sm border border-coolGray-200 rounded px-1 mx-1 font-bold">
                + add alias
              </span>{' '}
              button below
            </p>
          </div>

          {/* <p className="text-sm text-center bg-coolGray-100 shadow-sm border border-coolGray-200 py-2 my-3 rounded">
            <b>namespace</b>
            <b className="text-purple-500">#myalias</b>
            <b>@telios.io</b>
          </p>
          <p className="text-sm" /> */}
        </div>

        <div className="mb-2 flex flex-row-reverse">
          <Button
            onClick={onHide}
            className="tracking-wide bg-purple-600 text-white border-color-purple-800 shadow-s "
          >
            <Icon icon="plus" className="mr-1 text-xs" /> Add alias
          </Button>
        </div>
        <div className="bg-coolGray-100 w-full rounded-lg flex items-center flex-col pb-6 pt-4">
          {/* <CgHashtag className="text-3xl text-coolGray-400"/> */}
          <span className="text-2xl text-coolGray-400">@</span>
          <p className="text-sm text-coolGray-400">No alias created yet</p>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          onClick={onHide}
          appearance="ghost"
          className="border-coolGray-300 text-coolGray-400 tracking-wide"
        >
          Close
        </Button>
      </Modal.Footer>
    </>
  );
}
