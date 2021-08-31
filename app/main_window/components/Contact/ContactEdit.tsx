import React, { useState, useRef } from 'react';
import {
  Modal,
  Button,
  Form,
  FormGroup,
  FormControl,
  ControlLabel,
  HelpBlock,
  Avatar,
  IconButton,
  Schema,
  InputPicker,
  DatePicker,
  Icon
} from 'rsuite';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import { ContactType } from '../../reducers/types';
import { flattenObject, rebuildArrObject } from '../../../utils/form.util';

const countries = require('./countries.json');

type Props = {
  closeAction: () => void;
  toggleEdit: () => void;
  saveAction: (contact: ContactType) => void;
  data: ContactType | undefined;
};

const { StringType, DateType } = Schema.Types;
const model = Schema.Model({
  givenName: StringType(),
  familyName: StringType(),
  nickname: StringType(),
  birthday: DateType(),
  email: StringType()
    .isEmail('Please enter a valid email address.')
    .isRequired('This field is required.'),
  organization_name_0: StringType(),
  organization_jobTitle_0: StringType(),
  phone_type_0: StringType(),
  address_street_0: StringType(),
  address_street2_0: StringType(),
  address_city_0: StringType(),
  address_state_0: StringType(),
  address_postalCode_0: StringType(),
  address_country_0: StringType(),
  website: StringType(),
  notes: StringType()
});

const ContactEdit = (props: Props) => {
  const { closeAction, toggleEdit, saveAction, data } = props;

  const phoneType = [
    {
      value: 'Mobile',
      label: 'Mobile'
    },
    {
      value: 'Home',
      label: 'Home'
    },
    {
      value: 'Work',
      label: 'Work'
    },
    {
      value: 'Other',
      label: 'Other'
    }
  ];

  // const countries = [
  //   {
  //     value: 'United States',
  //     label: 'United States'
  //   }
  // ];

  const [formData, setFormValue] = useState(flattenObject(data));
  let formRef = useRef(null);

  const saveHandler = () => {
    if (!formRef.check()) {
      console.error('Form Error');
      return;
    }
    const finalForm = formData;
    finalForm.name = `${finalForm.givenName} ${finalForm.familyName}`;
    const input: ContactType = rebuildArrObject(finalForm);
    saveAction(input);
  };

  return (
    <KeyboardEventHandler
      handleKeys={['enter']}
      onKeyEvent={(key, e) => saveHandler()}
    >
      <Modal.Header className="px-10 pb-2 flex flex-row items-center -mx-6 select-none">
        <Modal.Title>Edit Contact</Modal.Title>
      </Modal.Header>
      <Modal.Body className="flex flex-row ml-5 mr-3 mt-0 overflow-scroll max-h-96 pt-4">
        <div className="flex flex-row flex-1">
          <div className="flex flex-col mr-4 select-none">
            <Avatar size="lg">
              <Icon icon="camera" />
            </Avatar>
          </div>
          <Form
            fluid
            // eslint-disable-next-line no-return-assign
            ref={ref => (formRef = ref)}
            className="flex flex-col w-full"
            formValue={formData}
            onChange={formValue => {
              setFormValue({ ...formValue });
            }}
            model={model}
          >
            <div className="flex flex-row">
              <FormGroup className="w-1/2 pr-4 mb-2">
                <ControlLabel className="text-sm select-none">First Name</ControlLabel>
                <FormControl name="givenName" />
              </FormGroup>
              <FormGroup className="w-1/2 pr-4 mb-2">
                <ControlLabel className="text-sm select-none">Last Name</ControlLabel>
                <FormControl name="familyName" />
              </FormGroup>
            </div>
            <div className="flex flex-row">
              <FormGroup className="w-1/2 pr-4 mb-2">
                <ControlLabel className="text-sm select-none">Nickname</ControlLabel>
                <FormControl name="nickname" />
              </FormGroup>
              <FormGroup className="w-1/2 pr-4 mb-2">
                <ControlLabel className="text-sm select-none">Birthday</ControlLabel>
                <FormControl name="birthday" accepter={DatePicker} />
              </FormGroup>
            </div>
            <div className="flex flex-row">
              <FormGroup className="w-1/2 pr-4 mb-2">
                <ControlLabel className="text-sm select-none">Organization</ControlLabel>
                <FormControl name="organization_name_0" />
              </FormGroup>
              <FormGroup className="w-1/2 pr-4 mb-2">
                <ControlLabel className="text-sm select-none">Job Title</ControlLabel>
                <FormControl name="organization_jobTitle_0" />
              </FormGroup>
            </div>
            <div className="flex flex-row">
              <FormGroup className="w-full pr-4 mb-2">
                <ControlLabel className="text-sm select-none">
                  Email
                  <span className="pl-1 text-red-500">*</span>
                </ControlLabel>
                <FormControl name="email" type="email" />
              </FormGroup>
              {/* <FormGroup className="w-1/2 mb-2">
                <ControlLabel className="text-sm">Type</ControlLabel>
                <FormControl
                  name="emailType"
                  accepter={InputPicker}
                  data={emailType}
                />
              </FormGroup> */}
            </div>
            <div className="flex flex-row">
              <FormGroup className="w-1/2 pr-4 mb-2">
                <ControlLabel className="text-sm select-none">Phone</ControlLabel>
                <FormControl name="phone_value_0" />
              </FormGroup>
              <FormGroup className="w-1/2 mb-2">
                <ControlLabel className="text-sm select-none">Type</ControlLabel>
                <FormControl
                  name="phone_type_0"
                  accepter={InputPicker}
                  data={phoneType}
                />
              </FormGroup>
            </div>
            <FormGroup className="pr-4 mb-2">
              <ControlLabel className="text-sm select-none">Street Address</ControlLabel>
              <FormControl name="address_street_0" />
            </FormGroup>
            <FormGroup className="pr-4 mb-2">
              <ControlLabel className="text-sm select-none">
                Street Address (2nd Line)
              </ControlLabel>
              <FormControl name="address_street2_0" />
            </FormGroup>
            <div className="flex flex-row">
              <FormGroup className="w-1/2 pr-4 mb-2">
                <ControlLabel className="text-sm select-none">City</ControlLabel>
                <FormControl name="address_city_0" />
              </FormGroup>
              <FormGroup className="w-1/2 pr-4 mb-2">
                <ControlLabel className="text-sm select-none">State</ControlLabel>
                <FormControl name="address_state_0" />
              </FormGroup>
            </div>
            <div className="flex flex-row">
              <FormGroup className="w-1/2 pr-4 mb-2">
                <ControlLabel className="text-sm select-none">ZipCode</ControlLabel>
                <FormControl name="address_postalCode_0" />
              </FormGroup>
              <FormGroup className="w-1/2 mb-2">
                <ControlLabel className="text-sm select-none">Country</ControlLabel>
                <FormControl
                  name="address_country_0"
                  accepter={InputPicker}
                  data={countries}
                />
              </FormGroup>
            </div>
            <FormGroup className="pr-4 mb-2">
              <ControlLabel className="text-sm select-none">Website</ControlLabel>
              <FormControl name="website" />
            </FormGroup>
            <FormGroup className="pr-4">
              <ControlLabel className="text-sm select-none">Notes</ControlLabel>
              <FormControl name="notes" rows={3} componentClass="textarea" />
            </FormGroup>
          </Form>
        </div>
      </Modal.Body>
      <Modal.Footer className="mt-4 select-none">
        <Button onClick={saveHandler} appearance="primary">
          Save
        </Button>
        <Button onClick={closeAction} appearance="subtle">
          Cancel
        </Button>
      </Modal.Footer>
    </KeyboardEventHandler>
  );
};

export default ContactEdit;
