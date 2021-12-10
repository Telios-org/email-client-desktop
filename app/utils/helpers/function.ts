// This code came from https://github.com/ProtonMail/proton-shared/blob/master/lib/helpers/function.ts
// Which is under an open source license
export const noop = () => undefined;

export const debounce = <A extends any[]>(
  func: (...args: A) => void,
  wait: number,
  isImmediate?: boolean
) => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  function debouncedFunction(this: any, ...args: A) {
    const later = () => {
      timeoutId = undefined;
      if (!isImmediate) {
        func.apply(this, args);
      }
    };

    const shouldCallNow = isImmediate && timeoutId === undefined;

    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(later, wait);

    if (shouldCallNow) {
      func.apply(this, args);
    }
  }

  debouncedFunction.abort = () => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
      timeoutId = undefined;
    }
  };

  return debouncedFunction;
};

export const throttle = <A extends any[]>(
  func: (...args: A) => void,
  ms = 50,
  context = window
) => {
  let wait = false;

  return (...args: A) => {
    const later = () => {
      func.apply(context, args);
    };

    if (!wait) {
      later();
      wait = true;
      setTimeout(() => {
        wait = false;
      }, ms);
    }
  };
};
