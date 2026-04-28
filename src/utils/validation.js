// src/utils/validation.js
import React from 'react';

// Phone number validation for Kenyan numbers
export const validatePhone = (phone) => {
  if (!phone) {
    return { isValid: false, message: 'Phone number is required' };
  }

  // Remove spaces and dashes
  const cleanPhone = phone.replace(/[\s-]/g, '');
  
  // Kenyan phone number patterns
  const patterns = [
    /^07[0-9]{8}$/,           // 07XXXXXXXX
    /^2547[0-9]{8}$/,        // 2547XXXXXXXX
    /^\+2547[0-9]{8}$/       // +2547XXXXXXXX
  ];

  const isValid = patterns.some(pattern => pattern.test(cleanPhone));

  if (!isValid) {
    return {
      isValid: false,
      message: 'Please enter a valid Kenyan phone number (e.g., 07XXXXXXXX)'
    };
  }

  return { isValid: true, message: '' };
};

// PIN validation
export const validatePin = (pin) => {
  if (!pin) {
    return { isValid: false, message: 'PIN is required' };
  }

  if (pin.length < 4 || pin.length > 8) {
    return {
      isValid: false,
      message: 'PIN must be between 4 and 8 digits'
    };
  }

  if (!/^\d+$/.test(pin)) {
    return {
      isValid: false,
      message: 'PIN must contain only numbers'
    };
  }

  // Check for weak PINs
  const weakPins = ['0000', '1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999', '1234', '4321'];
  if (weakPins.includes(pin)) {
    return {
      isValid: false,
      message: 'Please choose a more secure PIN'
    };
  }

  return { isValid: true, message: '' };
};

// PIN strength indicator
export const getPinStrength = (pin) => {
  if (!pin || pin.length < 4) return { strength: 0, label: 'Weak', color: 'red' };
  
  let strength = 0;
  
  // Length bonus
  if (pin.length >= 6) strength += 2;
  else if (pin.length >= 4) strength += 1;
  
  // Pattern diversity
  if (!/^\d+$/.test(pin)) strength += 2; // Contains non-digits
  if (/[a-z]/.test(pin) && /[A-Z]/.test(pin)) strength += 1; // Mixed case
  if (/[0-9]/.test(pin)) strength += 1; // Contains numbers
  if (/[^a-zA-Z0-9]/.test(pin)) strength += 1; // Special characters
  
  // Avoid sequential patterns
  const isSequential = (str) => {
    for (let i = 0; i < str.length - 2; i++) {
      if (
        (parseInt(str[i+1]) === parseInt(str[i]) + 1 && parseInt(str[i+2]) === parseInt(str[i+1]) + 1) ||
        (parseInt(str[i+1]) === parseInt(str[i]) - 1 && parseInt(str[i+2]) === parseInt(str[i+1]) - 1)
      ) {
        return true;
      }
    }
    return false;
  };
  
  if (!isSequential(pin)) strength += 1;
  
  if (strength <= 2) return { strength, label: 'Weak', color: 'red' };
  if (strength <= 4) return { strength, label: 'Medium', color: 'yellow' };
  return { strength, label: 'Strong', color: 'green' };
};

// Amount validation
export const validateAmount = (amount, min = 10, max = 100000) => {
  if (!amount && amount !== 0) {
    return { isValid: false, message: 'Amount is required' };
  }

  const numAmount = parseFloat(amount);

  if (isNaN(numAmount)) {
    return { isValid: false, message: 'Please enter a valid amount' };
  }

  if (numAmount < min) {
    return { isValid: false, message: `Minimum amount is KES ${min.toLocaleString()}` };
  }

  if (numAmount > max) {
    return { isValid: false, message: `Maximum amount is KES ${max.toLocaleString()}` };
  }

  if (numAmount % 1 !== 0) {
    return { isValid: false, message: 'Amount must be a whole number' };
  }

  return { isValid: true, message: '' };
};

// Email validation
export const validateEmail = (email) => {
  if (!email) {
    return { isValid: false, message: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }

  return { isValid: true, message: '' };
};

// Name validation
export const validateName = (name, fieldName = 'Name') => {
  if (!name) {
    return { isValid: false, message: `${fieldName} is required` };
  }

  if (name.trim().length < 2) {
    return { isValid: false, message: `${fieldName} must be at least 2 characters` };
  }

  if (name.length > 50) {
    return { isValid: false, message: `${fieldName} must be less than 50 characters` };
  }

  if (!/^[a-zA-Z\s]+$/.test(name)) {
    return { isValid: false, message: `${fieldName} should only contain letters and spaces` };
  }

  return { isValid: true, message: '' };
};

// Real-time validation hook
export const useValidation = (initialValues, validationRules) => {
  const [values, setValues] = React.useState(initialValues);
  const [errors, setErrors] = React.useState({});
  const [touched, setTouched] = React.useState({});

  const validateField = (name, value) => {
    const rule = validationRules[name];
    if (!rule) return '';

    const result = rule(value);
    return result.isValid ? '' : result.message;
  };

  const setValue = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Validate in real-time if field has been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const setTouchedField = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(name => {
      const error = validateField(name, values[name]);
      if (error) {
        newErrors[name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(Object.keys(validationRules).reduce((acc, name) => ({ ...acc, [name]: true }), {}));
    
    return isValid;
  };

  return {
    values,
    errors,
    touched,
    setValue,
    setTouchedField,
    validateForm,
    setValues
  };
};

// Form field validation states
export const getFieldState = (error, touched, value) => {
  if (!touched) return 'default';
  if (error) return 'error';
  if (value) return 'success';
  return 'default';
};

export const getFieldClasses = (state) => {
  const baseClasses = 'w-full bg-gray-800 border rounded-lg px-4 py-3 text-white transition-colors';
  
  switch (state) {
    case 'error':
      return `${baseClasses} border-red-500 focus:border-red-400 focus:ring-red-500`;
    case 'success':
      return `${baseClasses} border-green-500 focus:border-green-400 focus:ring-green-500`;
    default:
      return `${baseClasses} border-gray-700 focus:border-red-500 focus:ring-red-500`;
  }
};
