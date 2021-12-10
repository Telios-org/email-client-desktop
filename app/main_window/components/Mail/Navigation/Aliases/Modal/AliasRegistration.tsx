import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button,
  Modal,
  Form,
  FormGroup,
  FormControl,
  ControlLabel,
  Schema,
  InputGroup,
  RadioGroup,
  Radio,
  TagPicker,
  InputPicker,
  IconButton,
  Icon
} from 'rsuite';

import { ArrowLeft } from 'react-iconly';
import RandomIcon from '@rsuite/icons/Random';
import { generateSlug } from 'random-word-slugs';

// REDUX ACTION
import { registerAlias } from '../../../../../actions/mailbox/aliases';

// SELECTORS
import {
  selectActiveMailbox,
  selectFirstNamespace
} from '../../../../../selectors/mail';

import i18n from '../../../../../../i18n/i18n';

import { validateString } from '../../../../../../utils/helpers/regex';

const { v4: uuidv4 } = require('uuid');

const { StringType } = Schema.Types;

const formModel = Schema.Model({
  namespace: StringType()
});

type Props = {
  show: boolean;
  onHide: () => void;
  onShowManagement: () => void;
  domain: string;
};

const initialFormState = {
  address: '',
  description: '',
  fwdAddresses: [],
  color: ''
};

const initialErrorState = {
  showError: false,
  msg: ''
};

export default function AliasModal(props: Props) {
  const dispatch = useDispatch();
  const firstNamespace = useSelector(selectFirstNamespace);
  const fwdAddresses = useSelector(
    state => state.mail.aliases.fwdAddresses
  ).map(fwd => {
    return { value: fwd, label: fwd };
  });
  const [fwdData, setfwdData] = useState([]);

  useEffect(() => {
    const d = [...fwdData, ...fwdAddresses];
    setfwdData(d);
  }, []);

  const { onHide, show, onShowManagement, domain } = props;
  const [loading, setLoading] = useState(false);
  const [formValue, setFormValue] = useState(initialFormState);
  const [errorBlock, setErrorBlock] = useState(initialErrorState);
  const [randomFormat, setRandomFormat] = useState('words');
  const formEl = useRef(null);

  const disableCreate = formValue.address.length === 0;

  const handleSubmit = async () => {
    const { name: namespaceName } = firstNamespace;

    const { address, description = '', fwdAddresses: fwd = [] } = formValue;

    const disabled = false;

    console.log(
      'REGISTERING',
      namespaceName,
      domain,
      address,
      description,
      fwd,
      validateString
    );

    setLoading(true);
    if (validateString(address)) {
      const res = await dispatch(
        registerAlias(
          namespaceName.toLowerCase(),
          domain,
          address.toLowerCase(),
          description,
          fwd,
          disabled
        )
      );
      if (res.success) {
        onShowManagement();
      } else {
        setErrorBlock({
          showError: true,
          msg: res.message
        });
      }
    } else {
      setErrorBlock({
        showError: true,
        msg: 'Malformed Alias, special characters not allowed.'
      });
    }
    setLoading(false);
  };

  const handleChange = val => {
    setErrorBlock(initialErrorState);
    console.log('CHANGES', val);

    fwdData.map(fwd => fwd.value);
    const newAdd = val.fwdAddresses.filter(add => !fwdData.includes(add));

    // If they are creating a new choice.
    if (newAdd.lenght > 0) {
      const n = newAdd.map(fwd => {
        return { value: fwd, label: fwd };
      });
      setfwdData([...fwdData, ...n]);
    }

    setFormValue({ ...val });
  };

  const generateRandomString = () => {
    let rand;

    if (randomFormat === 'words') {
      rand = generateSlug(2, {
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
    } else if (randomFormat === 'letters') {
      let s = '';
      const len = 8;
      do {
        s += Math.random()
          .toString(36)
          .substr(2);
      } while (s.length < len);
      s = s.substr(0, len);
      rand = s;
    }
    // else if (randomFormat === 'uid') {
    //   rand = uuidv4();
    // }

    handleChange({ ...formValue, address: rand });
  };

  return (
    <>
      <Modal.Header>
        <Modal.Title className="font-bold flex-row flex justify-between select-none">
          <div>{i18n.t('aliasing.alias_registration')}</div>
        </Modal.Title>
        {/* <div className="text-xs">
          <span>Namespace:</span>
          <span className="font-semibold text-blue-500 capitalize ml-1">
            {firstNamespace.name}
          </span>
        </div> */}
      </Modal.Header>
      <Modal.Body className="mt-5">
        <div className="mx-36">
          <div className="text-sm">
            Your new alias:
            <p className="text-sm text-center font-bold bg-coolGray-100 shadow-sm border border-coolGray-200 py-2 my-3 rounded">
              {`${firstNamespace.name}#`}
              <span className="text-purple-600">
                {formValue.address.length === 0
                  ? 'mynewalias'
                  : formValue.address}
              </span>
              {`@${domain}`}
            </p>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-normal">
              All emails sent to this alias will appear in your Telios inbox.
            </span>
            <span className="text-sm font-normal mt-2">
              Optionally, you can add forwarding addresses below to have email
              sent to this alias forwarded to additional email addresses
            </span>
          </div>
          <Form
            fluid
            ref={formEl}
            className="text-sm mt-5"
            model={formModel}
            formValue={formValue}
            onChange={handleChange}
          >
            <FormGroup controlId="address" className="relative mb-0">
              <ControlLabel className="text-coolGray-600 font-semibold text-sm">
                Alias
              </ControlLabel>
              <InputGroup style={{ width: '100%' }} className="m-auto">
                <FormControl name="address" placeholder="Enter alias choice" />
                <InputGroup.Button
                  className="group"
                  onClick={generateRandomString}
                >
                  <RandomIcon className="group-hover:text-blue-600" />
                </InputGroup.Button>
              </InputGroup>
            </FormGroup>
            <FormGroup
              controlId="randomFormat"
              className="text-xs flex justify-end mb-1"
            >
              <ControlLabel className="text-coolGray-600 font-semibold flex items-center">
                Random Format:
              </ControlLabel>
              <RadioGroup
                name="randomFormat"
                inline
                value={randomFormat}
                onChange={value => {
                  setRandomFormat(value);
                }}
              >
                <Radio value="words">Word Association</Radio>
                <Radio value="letters">Shuffled letters</Radio>
                {/* <Radio value="uid">UID</Radio> */}
              </RadioGroup>
            </FormGroup>
            <FormGroup controlId="description" className="relative mb-6">
              <ControlLabel className="text-coolGray-600 font-semibold text-sm">
                Description
              </ControlLabel>
              <FormControl
                name="description"
                placeholder="Enter description (optional)"
              />
            </FormGroup>
            <FormGroup controlId="fwdAddresses" className="mb-0 w-full">
              <ControlLabel className="text-coolGray-600 font-semibold text-sm">
                Forwarding Address(es)
              </ControlLabel>
              <FormControl
                name="fwdAddresses"
                className="text-xs"
                creatable
                accepter={TagPicker}
                data={fwdData}
                style={{ width: '100%' }}
                menuStyle={{ width: 300, fontSize: '14px' }}
              />
            </FormGroup>
          </Form>
        </div>
      </Modal.Body>
      <Modal.Footer className="flex justify-between">
        <div className="flex flex-1 justify-items-start">
          <Button
            onClick={onShowManagement}
            appearance="ghost"
            className="border-coolGray-300 text-coolGray-400 tracking-wide text-sm py-1 px-2"
          >
            <ArrowLeft set="broken" size="small" />
          </Button>
          <Button
            onClick={onHide}
            appearance="ghost"
            className="border-coolGray-300 text-coolGray-400 tracking-wide"
          >
            Cancel
          </Button>
        </div>
        <div
          className={`flex-grow text-sm text-center ${
            errorBlock.showError ? 'text-red-500' : 'hidden'
          }`}
        >
          {errorBlock.msg}
        </div>
        <div className="flex-1">
          <Button
            type="submit"
            loading={loading}
            onClick={handleSubmit}
            disabled={disableCreate}
            className={`tracking-wide ${
              disableCreate
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
