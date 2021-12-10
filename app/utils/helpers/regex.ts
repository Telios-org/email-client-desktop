export const validateString = (str: string) => {
  const re = /^\w+([\.]?\w+)*$/g;
  return re.test(str);
};

export const validateTeliosEmail = (email: string) => {
    const re = /^\w+([\.]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/g; // eslint-disable-line
  return re.test(email);
};

export const validateEmail = (email: string) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; // eslint-disable-line
  return re.test(email);
};
