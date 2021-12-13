// /* eslint-disable react/jsx-filename-extension */
/* eslint-disable react/no-children-prop */
import React, { useState, useEffect } from 'react';
// TO DO REPLACE Rsuite entirely fro custom TAILWIND UI
import { Icon, IconButton, Input, InputGroup, Button } from 'rsuite';
import { Popover } from '@headlessui/react';
import { usePopper } from 'react-popper';
import ButtonTooltip from './utils/ButtonTooltip';
import { stripLinkPrefix, addLinkPrefix } from '../../../../utils/helpers/url';
import { LinkData } from '../types';

interface Props {
  className?: string;
  linkData: LinkData;
  onClick: () => void;
  onInsert: (newVal: LinkData) => void;
}

const AddWebLinkButton = (props: Props) => {
  const { className = '', linkData, onInsert, onClick } = props;
  const [
    referenceElement,
    setReferenceElement
  ] = useState<HTMLButtonElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null
  );
  const [url, setUrl] = useState<string>(stripLinkPrefix(linkData.link));
  const [label, setLabel] = useState<string>(linkData.title);
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

  useEffect(() => {
    setUrl(stripLinkPrefix(linkData.link));
    setLabel(linkData.title);
  }, [linkData]);

  const handleUrlChange = (newVal: string) => {
    if (label === url) {
      setLabel(newVal);
    }
    setUrl(newVal);
  };

  const handleSubmit = () => {
    onInsert({ link: addLinkPrefix(url), title: label });
  };

  return (
    <Popover className={`${className}`}>
      {({ open }) => (
        <>
          <Popover.Button ref={setReferenceElement} className="outline-none">
            <ButtonTooltip text="Add Hyperlink/URL" placement="right">
              <IconButton
                className="ml-1"
                appearance="subtle"
                onClick={onClick}
                icon={<Icon icon="link" />}
                active={false}
                size="sm"
              />
            </ButtonTooltip>
          </Popover.Button>
          <Popover.Overlay
            className={`${
              open ? 'opacity-30 fixed inset-0' : 'opacity-0'
            } bg-black`}
          />
          <Popover.Panel
            ref={setPopperElement}
            style={styles.popper}
            {...attributes.popper}
          >
            {({ close }) => (
              <div className="z-10 w-80 bg-white overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-10 text-left px-4 pb-2 pt-3 flex flex-col">
                <h5 className="pb-2">Edit Link</h5>
                <div className="py-2">
                  <Input
                    placeholder="Display Text"
                    value={label}
                    onChange={setLabel}
                  />
                </div>
                <div className="py-2">
                  <InputGroup>
                    <InputGroup.Addon>https://</InputGroup.Addon>
                    <Input
                      placeholder="Web Address"
                      value={url}
                      onChange={handleUrlChange}
                    />
                  </InputGroup>
                </div>
                <div className="flex flex-col text-xs pt-2 pl-1">
                  <span className="pb-1">
                    In edit mode links are not clickable.
                  </span>
                  <span>
                    Test your link here:
                    {url && (
                      <a
                        className="pl-1"
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        title={label}
                      >
                        {label || url}
                      </a>
                    )}
                  </span>
                </div>
                <div className="flex flex-row justify-between pt-4 pb-2">
                  <Button size="sm" appearance="subtle" onClick={() => close()}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    appearance="primary"
                    onClick={() => {
                      handleSubmit();
                      close();
                    }}
                  >
                    OK
                  </Button>
                </div>
              </div>
            )}
          </Popover.Panel>
        </>
      )}
    </Popover>
  );
};

export default AddWebLinkButton;
