/* eslint-disable react/jsx-closing-tag-location */
import React from 'react';
import { Message, People } from 'react-iconly';

type Props = {
  active: string;
  eventKey: string;
  onClick: (eventKey: string) => void;
};

const NavStack = (props: Props) => {
  const { active, eventKey, onClick } = props;

  const iconMapping = {
    mail: Message,
    contacts: People
  };

  const handleSelect = () => {
    onClick(eventKey);
  };

  const onKeyPressHandler = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      onClick(eventKey);
    }
  };

  const IconTag = iconMapping[eventKey];

  return (
    <>
      <div
        className={`w-full h-12 flex justify-center items-center cursor-pointer outline-none mb-6 relative ${
          active === eventKey ? '' : ''
        } `}
        onClick={handleSelect}
        onKeyPress={onKeyPressHandler}
        role="button"
        tabIndex={0}
      >
        {/* {active === eventKey && (
          <div className="absolute left-0 h-full w-1 bg-violet-400 rounded-r-lg shadow-inner" />
        )} */}
        {/* <div
          className={`absolute w-10 h-10 bg-transparent ${
            active === eventKey ? 'bg-violet-300 shadow-lg' : ''
          }  rounded-lg flex justify-center items-center top-1/2 z-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2`}
        /> */}
        <IconTag
          set={`${active === eventKey ? 'bulk' : 'broken'}`}
          size="medium"
          className={`${
            active === eventKey
              ? 'text-purple-600'
              : 'text-gray-400 hover:text-gray-500'
          }`}
        />
      </div>
    </>
  );
};

export default NavStack;
