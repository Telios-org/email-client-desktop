import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal } from 'rsuite';

// COMPONENTS
import NamespaceRegistration from './NamespaceRegistration';
import AliasManagement from './AliasManagement/AliasManagement';
import AliasRegistration from './AliasRegistration';
import AliasEdit from './AliasManagement/AliasEdit';


// SELECTORS
import { selectFirstNamespace } from '../../../../../selectors/mail';

import i18n from '../../../../../../i18n/i18n';

const envAPI = require('../../../../../../env_api.json');

const params = window.location.search.replace('?', '');
const env = params.split('=')[1];
const mailDomain = env === 'production' ? envAPI.prodMail : envAPI.devMail;

type Props = {
  show: boolean;
  onHide: () => void;
};

export default function AliasModal(props: Props) {
  const dispatch = useDispatch();
  const namespace = useSelector(selectFirstNamespace);
  const [aliasEdit, setAliasEdit] = useState('');

  const [modalRoute, setModalRoute] = useState('');

  const { show, onHide } = props;

  const handleAliasEdit = (aliasId) => {
    setAliasEdit(aliasId);
    setModalRoute('aliasEdit');
  }

  useEffect(() => {
    if (namespace === null) {
      setModalRoute('nsRegistration');
    } else {
      setModalRoute('aliasManagement');
    }
  }, [namespace, show]);

  return (
    <div className="modal-container">
      <Modal show={show} onHide={onHide} size="md">
        {modalRoute === 'nsRegistration' && (
          <NamespaceRegistration
            show={show}
            onHide={onHide}
            domain={mailDomain}
          />
        )}
        {modalRoute === 'aliasManagement' && (
          <AliasManagement
            show={show}
            onHide={onHide}
            onCreateAlias={() => setModalRoute('aliasRegistration')}
            onShowEdit={handleAliasEdit}
            domain={mailDomain}
          />
        )}
        {modalRoute === 'aliasRegistration' && (
          <AliasRegistration
            show={show}
            onHide={onHide}
            onShowManagement={() => setModalRoute('aliasManagement')}
            domain={mailDomain}
          />
        )}
        {modalRoute === 'aliasEdit' && (
          <AliasEdit
            show={show}
            onHide={onHide}
            onShowManagement={() => setModalRoute('aliasManagement')}
            aliasId={aliasEdit}
            domain={mailDomain}
          />
        )}
      </Modal>
    </div>
  );
}
