import React, { useState, useEffect, useRef, memo } from 'react';
import { useInterval } from '../../../../../utils/hooks.util';

type Props = {
  loaderCount: number;
  loaderCountUpdate: (value: number | null) => void;
};

const CircleLoader = (props: Props) => {
  const { loaderCount: parentCounter, loaderCountUpdate } = props;
  const [counter, setCounter] = useState(parentCounter);
  const [isRunning, setRun] = useState(true);
  const [intervalId, setIntervalId] = useState(0);

  const radius = 19;
  const circumference = radius * 2 * Math.PI;
  const offset =
    counter < 100 ? circumference - (counter / 100) * circumference : 0;

  //   useInterval(countDown, counter < 100 ? 50 : null);

  useEffect(() => {
    let isMounted = true;
    let internalCounter = parentCounter;
    if (internalCounter < 100 && isRunning && isMounted) {
      const id = setInterval(() => {
        if (internalCounter < 100) {
          setCounter(prevCount => prevCount + 1);
          internalCounter += 1;
        } else {
          clearInterval(id);
          setIntervalId(0);
          setRun(false);
        }
      }, 50);
      setIntervalId(id);
    } else if (intervalId && isRunning && isMounted) {
      clearInterval(intervalId);
      setIntervalId(0);
      setRun(false);
    }
    return () => {
      console.log('UNMOUNTINg', internalCounter);
      if (isRunning) {
        clearInterval(intervalId);
      }

      loaderCountUpdate(internalCounter);
      isMounted = false;
    };
  }, []);

  //   const savedCallback = useRef();

  //   // Remember the latest callback.
  //   useEffect(() => {
  //     savedCallback.current = callback;
  //   }, [callback]);

  //   // Set up the interval.
  //   useEffect(() => {
  //     const id = setInterval(() => {
  //       savedCallback.current();
  //     }, delay);
  //     return () => clearInterval(id);
  //   }, [delay]);

  //   useInterval(countDown, counter < 100 ? 50 : null);

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
