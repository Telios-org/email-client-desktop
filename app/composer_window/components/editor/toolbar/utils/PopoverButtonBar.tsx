// /* eslint-disable react/jsx-filename-extension */
/* eslint-disable react/no-children-prop */
import React, { useState, useEffect, ReactNode } from 'react';
// TO DO REPLACE Rsuite entirely fro custom TAILWIND UI
import { Icon, IconButton, Input, InputGroup, Button } from 'rsuite';
import { Popover } from '@headlessui/react';
import { usePopper } from 'react-popper';
import ButtonTooltip from './ButtonTooltip';

interface Props {
  className?: string;
  children: ReactNode;
}

const PopoverButtonBar = (props: Props) => {
  const { className, children } = props;
  const [
    referenceElement,
    setReferenceElement
  ] = useState<HTMLButtonElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null
  );

  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: 'top',
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, 15]
        }
      }
    ]
  });

  return (
    <Popover className={`${className}`}>
      {({ open }) => (
        <>
          <Popover.Button ref={setReferenceElement}>
            <ButtonTooltip text="More Formatting" placement="top">
              <IconButton
                className="mx-0.5"
                appearance="subtle"
                icon={<Icon icon="more" />}
                active={false}
                size="sm"
              />
            </ButtonTooltip>
          </Popover.Button>
          <Popover.Overlay
            className={`${
              open ? 'opacity-0 fixed inset-0' : 'opacity-0'
            } bg-black`}
          />
          <Popover.Panel
            ref={setPopperElement}
            style={styles.popper}
            {...attributes.popper}
          >
            {({ close }) => (
              <div className="z-10 w-full bg-white overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-10 text-left p-1 flex flex-row">
                {children}
              </div>
            )}
          </Popover.Panel>
        </>
      )}
    </Popover>
  );
};

export default PopoverButtonBar;
