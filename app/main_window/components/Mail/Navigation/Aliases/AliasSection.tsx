import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// REDUX ACTION
import { setActivePage } from '../../../../actions/global';

// COMPONENTS
// import AliasModal from './Modal/AliasModal';
import NamespaceBlock from './NamespaceBlock';

// INTERNATIONALIZATION
import i18n from '../../../../../i18n/i18n';

// TYPESCRIPT TYPES
import { StateType } from '../../../../reducers/types';

type Props = {
  handleSelectAction: (index: string, isAlias: boolean, e: any) => void;
};

export default function AliasSection(props: Props) {
  const dispatch = useDispatch();
  const { handleSelectAction } = props;

  const [showAliasModal, setShowAliasModal] = useState(false);
  const handleHideAliasModal = () => {
    setShowAliasModal(false);
  };

  const handleAlias = () => {
    // setShowAliasModal(true);
    dispatch(setActivePage('aliases'));
  };

  return (
    <>
      <NamespaceBlock
        handleAlias={handleAlias}
        handleSelectAction={handleSelectAction}
      />
      {/* <AliasModal show={showAliasModal} onHide={handleHideAliasModal} /> */}
    </>
  );
}
