import React, { useState, useEffect } from 'react';

// INTERNAL COMPONENT
import IntroHeader from '../window_compoments/IntroHeader';
import { Dropdown } from '../../global_components/menu';
import { Password } from '../../global_components/input-groups';

// INTERNAL SERVICES
const LoginService = require('../../services/login.service');

const Login = () => {
  const [accounts, setAccounts] = useState([]);
  const [activeAcct, setActiveAcct] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const data = LoginService.getAccounts();
    const acct = data.map((a: string) => ({ label: a, id: a }));
    setAccounts(acct);
  }, []);

  useEffect(() => {
    if (accounts.length > 0) {
      setActiveAcct(accounts[0]);
    }
  }, [accounts]);

  return (
    <div>
      <IntroHeader
        title="Login."
        subheader="Choose your account and enter your master password below"
      />
      <Dropdown
        label="Account"
        data={accounts}
        selected={activeAcct}
        onChange={setActiveAcct}
        className="max-w-sm mx-auto mt-6"
      />
      <Password 
        label="Password"
        id="password"
        name="password"
        onChange={()=>{}}
        error=""
        className="max-w-sm mx-auto mt-4"
      />      
    </div>
  );
};

export default Login;
