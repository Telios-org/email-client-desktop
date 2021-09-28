import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal } from 'rsuite';

// COMPONENTS
import NamespaceRegistration from './NamespaceRegistration';
import AliasManagement from './AliasManagement';
import AliasRegistration from './AliasRegistration';

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

  const [modalRoute, setModalRoute] = useState('');

  const { show, onHide } = props;

  useEffect(() => {
    if (namespace === null) {
      setModalRoute('nsRegistration');
    } else {
      setModalRoute('aliasRegistration');
    }
  }, [namespace, show]);



  return (
    <div className="modal-container">
      <Modal show={show} onHide={onHide} size="md">
        {modalRoute === 'nsRegistration' && (
          <NamespaceRegistration show={show} onHide={onHide} />
        )}
        {modalRoute === 'aliasManagement' && (
          <AliasManagement
            show={show}
            onHide={onHide}
            onCreateAlias={() => setModalRoute('aliasRegistration')}
          />
        )}
        {modalRoute === 'aliasRegistration' && (
          <AliasRegistration
            show={show}
            onHide={onHide}
            onShowManagement={() => setModalRoute('aliasManagement')}
          />
        )}
      </Modal>
    </div>
  );
}
