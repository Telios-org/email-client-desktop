import { useState, useEffect } from 'react';
import { useHandler } from './useHandler';

const useForm = options => {
  const [initialData, setInitial] = useState(options?.initialValues || {});
  const [data, setData] = useState(options?.initialValues || {});
  const [isDirty, setIsDirty] = useState(false);
  const [errors, setErrors] = useState({});

  const validationFn = async (
    value: any,
    key: string,
    updateErrorState = false
  ) => {
    const validations = options?.validations;
    const validation = validations[key];
    let valid = true;
    let error = '';
    if (value.length > 0) {
      if (validation?.required?.value && !value) {
        valid = false;
        error = validation?.required?.message;
      }

      const pattern = validation?.pattern;
      if (pattern?.value && !RegExp(pattern.value).test(value) && valid) {
        valid = false;
        error = pattern.message;
      }

      const custom = validation?.custom;

      if (custom?.isValid && valid) {
        const fn = await custom.isValid(value, data);
        if (!fn) {
          valid = false;
          error = custom.message;
        }
      }
    }

    if (updateErrorState) {
      setErrors({
        ...errors,
        [key]: error
      });
    }

    return {
      valid,
      error
    };
  };

  const debouncedValidation = useHandler(
    (
      value: any,
      key: string,
      updateErrorState = false,
      validationCallback?: () => void
    ) => {
      validationFn(value, key, updateErrorState);
      if (validationCallback) {
        validationCallback();
      }
    },
    { debounce: options?.validationDebounce || 0 }
  );

  const runValidations = async (subset: string[] = []) => {
    const validations = options?.validations;
    if (validations) {
      const array = subset.length === 0 ? Object.keys(validations) : subset;

      let valid = true;
      const newErrors = {};

      await Promise.all(
        array.map(async key => {
          const value = data[key];
          const result = await validationFn(value, key);
          if (!result.valid) {
            valid = false;
          }
          newErrors[key] = result.error;
        })
      );

      const obj = { ...errors, ...newErrors };
      setErrors(obj);
      return valid;
    }
  };

  const debouncedBulkValidation = useHandler(
    (array: string[]) => {
      runValidations(array);
    },
    {
      debounce: options?.validationDebounce || 0
    }
  );

  // Needs to extend unknown so we can add a generic to an arrow function
  const handleChange = (
    key: string,
    runValidation?: boolean,
    sanitizeFn?: (i: any) => string,
    validationCallback?: () => void
  ) => e => {
    const rawValue =
      e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    const value = sanitizeFn ? sanitizeFn(rawValue) : rawValue;

    setData({
      ...data,
      [key]: value
    });

    if (runValidation) {
      debouncedValidation(value, key, true, validationCallback);
    }
  };

  const manualChange = (
    key: string,
    val: any,
    resetInit = false,
    sanitizeFn?: (i: any) => string
  ) => {
    const value = sanitizeFn ? sanitizeFn(val) : val;
    setData({
      ...data,
      [key]: value
    });

    if (resetInit) {
      setInitial({
        ...data,
        [key]: value
      });
    }
  };

  const bulkChange = async (obj: any, validationArray?: string[]) => {
    setData({
      ...data,
      ...obj
    });

    if (validationArray) {
      debouncedBulkValidation(validationArray);
    }
  };

  const resetForm = () => {
    setInitial(options?.initialValues || {});
    setData(options?.initialValues || {});
  };

  // useEffect(() => {
  //   if (
  //     JSON.stringify(options?.initialValues) !== JSON.stringify(initialData)
  //   ) {
  //     setIsDirty(false);
  //     setInitial(options?.initialValues);
  //     setData(options?.initialValues);
  //   }
  // }, [options?.initialValues]);
  useEffect(() => {
    if (JSON.stringify(data) !== JSON.stringify(initialData)) {
      setIsDirty(true);
    } else {
      setIsDirty(false);
    }
  }, [data]);

  const handleSubmit = async e => {
    e.preventDefault();
    await runValidations();

    if (options?.onSubmit) {
      setInitial(data);
      setIsDirty(false);
      await options.onSubmit(data);
    }
  };

  return {
    data,
    handleChange,
    manualChange,
    handleSubmit,
    runValidations,
    resetForm,
    isDirty,
    setErrors,
    bulkChange,
    errors
  };
};

export default useForm;
