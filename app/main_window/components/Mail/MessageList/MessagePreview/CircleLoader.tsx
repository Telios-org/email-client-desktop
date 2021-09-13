import React, { useState, useEffect, useRef, memo } from 'react';
import { useInterval } from '../../../../../utils/hooks.util';

type Props = {
  loaderCount: number;
  loaderCountUpdate: () => void;
};

const CircleLoader = (props: Props) => {
  const { loaderCount: counter, loaderCountUpdate } = props;

  const radius = 19;
  const circumference = radius * 2 * Math.PI;
  const offset =
    counter < 100 ? circumference - (counter / 100) * circumference : 0;

  useEffect(() => {
    let timer;
    if (counter < 100) {
      timer = setTimeout(() => {
        loaderCountUpdate();
      }, 50);
    }
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, []);

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-y-2/4 -translate-x-2/4 -rotate-90">
      <svg className="" width="40" height="40">
        <linearGradient
          x1="34.4517994%"
          y1="65.579787%"
          x2="93.02325%"
          y2="-11.552763%"
          id="linearColors"
        >
          <stop stopColor="#A996FF" offset="0%" />
          <stop stopColor="#25C3FF" offset="100%" />
        </linearGradient>
        <circle
          className=""
          stroke="url(#linearColors)"
          strokeWidth="2"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={`${offset}`}
          fill="transparent"
          r={radius}
          cx="20"
          cy="20"
        />
      </svg>
    </div>
  );
};

export default memo(CircleLoader);
