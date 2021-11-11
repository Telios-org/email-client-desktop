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
import { updateAlias } from '../../../../../../actions/mailbox/aliases';

// SELECTORS
import {
  selectActiveMailbox,
  selectFirstNamespace
} from '../../../../../../selectors/mail';

import i18n from '../../../../../../../i18n/i18n';


const { StringType } = Schema.Types;

const formModel = Schema.Model({
  namespace: StringType()
});

type Props = {
  show: boolean;
  onHide: () => void;
  onShowManagement: () => void;
  domain: string;
  aliasId: string;
};

const initialFormState = {
  description: '',
  fwdAddresses: []
};

const initialErrorState = {
  showError: false,
  msg: ''
};

export default function AliasEdit(props: Props) {
  const dispatch = useDispatch();
  const { onHide, show, onShowManagement, domain, aliasId } = props;
  const [loading, setLoading] = useState(false);
  const [formValue, setFormValue] = useState(initialFormState);
  const [errorBlock, setErrorBlock] = useState(initialErrorState);
  const firstNamespace = useSelector(selectFirstNamespace);
  const fwdAddresses = useSelector(
    state => state.mail.aliases.fwdAddresses
  ).map(fwd => {
    return { value: fwd, label: fwd };
  });
  const aliasData = useSelector(state => state.mail.aliases.byId);
  const [fwdData, setfwdData] = useState([]);

  useEffect(() => {
    const d = [...fwdData, ...fwdAddresses];
    setfwdData(d);

    const a = aliasData[aliasId];

    setFormValue({
      description: a.description,
      fwdAddresses: a.fwdAddresses
    });
  }, []);

  const formEl = useRef(null);

  const handleSubmit = async () => {
    const { name: namespaceName } = firstNamespace;

    const { description = '', fwdAddresses: fwd = [] } = formValue;

    setLoading(true);
    const res = await dispatch(
      updateAlias({
        namespaceName,
        domain,
        address: aliasData[aliasId].name,
        description,
        fwdAddresses: fwd,
        disabled: aliasData[aliasId].disabled
      })
    );
    setLoading(false);

    if (res.success) {
      onShowManagement();
    } else {
      setErrorBlock({
        showError: true,
        msg: res.message
      });
    }
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

  return (
    <>
      <Modal.Header>
        <Modal.Title className="font-bold flex-row flex justify-between select-none">
          <div>Edit Alias</div>
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
            <span className="font-bold">Alias</span>
            <p className="text-sm text-center font-bold bg-coolGray-100 shadow-sm border border-coolGray-200 py-2 my-3 rounded">
              {`${firstNamespace.name}#`}
              <span className="text-purple-600">{aliasData[aliasId].name}</span>
              {`@${domain}`}
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
                Forwarding Addresses
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
            className="tracking-wide 
                bg-purple-600 text-white
            border-color-purple-800 shadow-sm"
          >
            Update
          </Button>
        </div>
      </Modal.Footer>
    </>
  );
}
