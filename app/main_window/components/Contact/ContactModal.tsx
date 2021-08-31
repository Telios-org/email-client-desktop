import React, { useState } from 'react';
import { Modal } from 'rsuite';
import ContactView from './ContactView';
import ContactEdit from './ContactEdit';
import { ContactType } from '../../reducers/types';

type Props = {
  show: boolean;
  edit?: boolean;
  data: ContactType | undefined;
  onClose: () => void;
  onSave: (contact: ContactType) => void;
  onEditMode: (contactEdit: boolean) => void;
  onDelete: (contactId: number) => void;
};

const ContactModal = (props: Props) => {
  const { onClose, onSave, onEditMode, onDelete, show, edit, data } = props;

  const toggleEdit = () => {
    onEditMode(!edit);
  };

  const closingOut = () => {
    onClose();
    // Delaying to let time for the animation to take place.
    // setTimeout(() => onEditMode(false), 1000);
  };

  return (
    <Modal
      overflow
      backdrop
      show={show}
      onHide={closingOut}
      className="top-14 overflow-hidden"
    >
      {!edit && data && (
        <ContactView
          data={data}
          closeAction={closingOut}
          toggleEdit={toggleEdit}
          deleteAction={onDelete}
        />
      )}
      {edit && (
        <ContactEdit
          data={data}
          closeAction={closingOut}
          toggleEdit={toggleEdit}
          saveAction={onSave}
        />
      )}
    </Modal>
  );
};

ContactModal.defaultProps = {
  edit: false
};

export default ContactModal;
