import React, { useState } from 'react';
import { Modal, Button, Avatar, IconButton, Icon } from 'rsuite';
import { ContactType } from '../../reducers/types';
import { fullDatefromJS } from '../../utils/date.util';

type Props = {
  closeAction: () => void;
  toggleEdit: () => void;
  deleteAction: (contactId: number) => void;
  data: ContactType;
};

const ContactView = (props: Props) => {
  const {
    closeAction,
    toggleEdit,
    deleteAction,
    data: {
      id,
      givenName = '',
      familyName = '',
      name = '',
      organization = [],
      phone = [],
      email = '',
      address = [],
      birthday,
      website,
      notes,
      nickname
    }
  } = props;

  const [showDelete, setDeleteConfirmation] = useState(false);

  const toggleDeteteConfirmation = () => {
    setDeleteConfirmation(!showDelete);
  };

  const removeContact = () => {
    deleteAction(id);
    toggleDeteteConfirmation();
    closeAction();
  };

  const initials = () => {
    if (
      givenName &&
      givenName.length > 0 &&
      familyName &&
      familyName.length > 0
    ) {
      return `${givenName[0]}${familyName[0]}`.toUpperCase();
    }
    return `${email[0]}`.toUpperCase();
  };

  return (
    <>
      <Modal size="xs" show={showDelete} onHide={toggleDeteteConfirmation} className="select-none">
        <Modal.Header>
          <Modal.Title>Remove Contact</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to permanently remove
          <span className="font-bold">{` ${name} `}</span>
          as a contact?
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={removeContact}
            className="bg-red-500 hover:bg-red-600"
            appearance="primary"
          >
            Remove
          </Button>
          <Button onClick={toggleDeteteConfirmation} appearance="subtle">
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal.Header className="p-4 flex flex-row items-center select-none">
        <div className="w-16">
          <Avatar size="lg">{initials()}</Avatar>
        </div>
        <div className="flex flex-col ml-8">
          <div className="text-2xl">
            <span>{name.includes('undefined') ? email : name}</span>
            {nickname && (
              <span className="text-sm pl-2 italic">{`( ${nickname} )`}</span>
            )}
            <IconButton
              className="ml-8"
              size="xs"
              icon={<Icon icon="edit" />}
              onClick={toggleEdit}
            />
            <IconButton
              className="ml-2"
              size="xs"
              icon={<Icon icon="trash-o" />}
              onClick={toggleDeteteConfirmation}
            />
          </div>
          {organization.length > 0 && (
            <>
              <div>{organization[0].jobTitle}</div>
              <div>{organization[0].name}</div>
            </>
          )}
        </div>
      </Modal.Header>
      <Modal.Body className="flex flex-col ml-28 pr-5 mt-4 select-none">
        {birthday && (
          <div className="pb-4">
            <Icon className="mr-3 text-gray-300" icon="birthday-cake" />
            {fullDatefromJS(birthday)}
          </div>
        )}
        <div className="pb-4">
          <Icon className="mr-3 text-gray-300" icon="envelope" />
          {email}
        </div>
        {phone.map((p, i) => {
          return (
            // eslint-disable-next-line react/no-array-index-key
            <div className="pb-4" key={`${i}-phone`}>
              <Icon className="mr-3 text-gray-300" icon="phone" />
              <span>{p.value}</span>
              <span className="text-sm pl-2 text-gray-500">{`(${p.type})`}</span>
            </div>
          );
        })}
        {address.map((p, i) => {
          return (
            // eslint-disable-next-line react/no-array-index-key
            <div className="pb-4 flex flex-row" key={`${i}-map`}>
              <Icon className="mr-3 text-gray-300" icon="map-marker" />
              <div className="flex flex-col">
                <span>{p.street}</span>
                {p.street2 && <span>{p.street2}</span>}
                <span>{`${p.city}, ${p.state} ${p.postalCode}`}</span>
                {p.country && <span>{p.country}</span>}
              </div>
              {p.type && (
                <span className="text-sm pl-2 text-gray-500">{`(${p.type})`}</span>
              )}
            </div>
          );
        })}
        {website && (
          <div className="pb-4">
            <Icon className="mr-3 text-gray-300" icon="desktop" />
            <a href={website}>{website}</a>
          </div>
        )}
        {notes && (
          <div className="pb-4 flex flex-row">
            <Icon className="mr-3 text-gray-300" icon="sticky-note-o" />
            <p>{notes}</p>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={closeAction} appearance="primary">
          Close
        </Button>
      </Modal.Footer>
    </>
  );
};

export default ContactView;
