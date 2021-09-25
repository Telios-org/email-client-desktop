import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal } from 'rsuite';

// COMPONENTS
import NamespaceRegistration from './NamespaceRegistration';
import AliasManagement from './AliasManagement';

// SELECTORS
import { selectFirstNamespace } from '../../../../../selectors/mail';

import i18n from '../../../../../../i18n/i18n';

type Props = {
  show: boolean;
  onHide: () => void;
};

export default function AliasModal(props: Props) {
  const dispatch = useDispatch();
  const namespace = useSelector(selectFirstNamespace);

  const { show, onHide } = props;

  return (
    <div className="modal-container">
      <Modal show={show} onHide={onHide}>
        {namespace === null && (
          <NamespaceRegistration show={show} onHide={onHide} />
        )}
        {namespace !== null && <AliasManagement show={show} onHide={onHide} />}
      </Modal>
    </div>
  );
}
