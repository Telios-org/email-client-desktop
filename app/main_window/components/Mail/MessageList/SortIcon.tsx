import React, { useEffect, useState } from 'react';

type Props = {
  color: string;
  order?: string;
};

export default function SortIcon(props: Props) {
  const { color, order } = props;

  const Icon = () => {
    return (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        version="1.1"
        id="svg17"
        xmlns="http://www.w3.org/2000/svg">
        <defs
          id="defs21" />
        <path
          opacity={order === 'ASC' ? '0.1' : '0.4'}
          d="M 16.8396,18.47352 V 6.54639"
          stroke={!order ? '#737373' : color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          id="path9"
        />
        <path
          opacity={order === 'ASC' ? '0.2' : '1'}
          d="M20.9172 16.068L16.8394 20.1647L12.7617 16.068"
          stroke={!order ? '#737373' : color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          id="path11"
        />
        <path
          opacity={!order || order === 'ASC' ? '0.4' : '0.1'}
          d="M 6.91109,5.5828922 V 17.4507"
          stroke={!order ? '#737373' : color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          id="path13"
        />
        <path
          opacity={!order || order === 'ASC' ? '1' : '0.2'}
          d="M2.83344 7.92894L6.91121 3.83228L10.989 7.92894"
          stroke={!order ? '#737373' : color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          id="path15"
        />
      </svg>
    );
  }

  return (
    <div>
      <Icon />
    </div>
  );
}