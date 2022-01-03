import { useState, useEffect } from 'react';

const useForm = options => {
  const [initialData, setInitial] = useState(options?.initialValues || {});
  const [data, setData] = useState(options?.initialValues || {});
  const [isDirty, setIsDirty] = useState(false);
  const [errors, setErrors] = useState({});

  // Needs to extend unknown so we can add a generic to an arrow function
  const handleChange = (key: string, sanitizeFn?: (i: any) => string) => e => {
    const value = sanitizeFn ? sanitizeFn(e.target.value) : e.target.value;
    setData({
      ...data,
      [key]: value
    });
  };

  const manualChange = (
    key: string,
    val: any,
    sanitizeFn?: (i: any) => string
  ) => {
    const value = sanitizeFn ? sanitizeFn(val) : val;
    setData({
      ...data,
      [key]: value
    });
  };

  const resetForm = () => {
    setData(initialData);
  };

  useEffect(() => {
    if (JSON.stringify(data) !== JSON.stringify(initialData)) {
      setIsDirty(true);
    } else {
      setIsDirty(false);
    }
  }, [data]);

  const handleSubmit = async e => {
    e.preventDefault();
    const validations = options?.validations;

    if (validations) {
      let valid = true;
      const newErrors = {};

      Object.keys(validations).forEach(key => {
        const value = data[key];
        const validation = validations[key];
        if (validation?.required?.value && !value) {
          valid = false;
          newErrors[key] = validation?.required?.message;
        }

        const pattern = validation?.pattern;
        if (pattern?.value && !RegExp(pattern.value).test(value)) {
          valid = false;
          newErrors[key] = pattern.message;
        }

        const custom = validation?.custom;
        if (custom?.isValid && !custom.isValid(value)) {
          valid = false;
          newErrors[key] = custom.message;
        }
      });

      console.log('VALIDATION ERRORS', valid, newErrors);
      if (!valid) {
        setErrors(newErrors);
        return;
      }
    }

    setErrors({});

    if (options?.onSubmit) {
      setInitial(data);
      setIsDirty(false);
      options.onSubmit(data);
    }
  };

  return {
    data,
    handleChange,
    manualChange,
    handleSubmit,
    resetForm,
    isDirty,
    errors
  };
};

export default useForm;
