import React, { useState } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const PhoneNumberInput = ({handlePhoneNumberChange, phoneNumber}) => {
  const [error, setError] = useState("");
  const phoneNumberRegex = /^[0-9]{7,15}$/;

  const validatePhoneNumber = (number) => {
    if (!phoneNumberRegex.test(number)) {
      setError("Invalid phone number. It should contain 10 to 15 digits.");
      return false;
    } else {
      setError("");
      return true;
    }
  };

  const handleChange = (value, country) => {
    handlePhoneNumberChange(value, country);
    validatePhoneNumber(value);
  };


  return (
    <div>
      <PhoneInput
        country="us"
        value={phoneNumber}
        onChange={handleChange}
        placeholder="Enter phone number"
      />
    {error && <span className="error">{error}</span>}
    </div>
  );
};

export default PhoneNumberInput;