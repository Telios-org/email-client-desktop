import { useState } from 'react';

const useForm = options => {
  const [data, setData] = useState(options?.initialValues || {});
  const [errors, setErrors] = useState({});

  // Needs to extend unknown so we can add a generic to an arrow function
  const handleChange = (key, sanitizeFn) => e => {
    const value = sanitizeFn ? sanitizeFn(e.target.value) : e.target.value;
    setData({
      ...data,
      [key]: value
    });
  };

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

      console.log('VALIDATION ERRORS', valid, newErrors)
      if (!valid) {
        setErrors(newErrors);
        return;
      }
    }

    setErrors({});

    if (options?.onSubmit) {
      options.onSubmit(data);
    }
  };

  return {
    data,
    handleChange,
    handleSubmit,
    errors
  };
};

export default useForm;
