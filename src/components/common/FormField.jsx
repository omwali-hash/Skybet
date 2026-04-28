// src/components/common/FormField.jsx
import React from 'react';
import { getFieldState, getFieldClasses } from '../../utils/validation';

export default function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  touched,
  placeholder,
  required = false,
  disabled = false,
  maxLength,
  min,
  max,
  step,
  showStrengthIndicator = false,
  strengthInfo,
  ...props
}) {
  const fieldState = getFieldState(error, touched, value);
  const inputClasses = getFieldClasses(fieldState);

  const renderInput = () => {
    const commonProps = {
      id: name,
      name,
      type,
      value,
      onChange,
      onBlur,
      placeholder,
      required,
      disabled,
      className: inputClasses,
      maxLength,
      min,
      max,
      step,
      ...props
    };

    if (type === 'textarea') {
      return <textarea {...commonProps} rows={4} />;
    }

    return <input {...commonProps} />;
  };

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {renderInput()}
        
        {/* Success indicator */}
        {fieldState === 'success' && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        
        {/* Error indicator */}
        {fieldState === 'error' && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && touched && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      {/* PIN Strength Indicator */}
      {showStrengthIndicator && strengthInfo && value && (
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">PIN Strength</span>
            <span className={`text-xs font-medium ${
              strengthInfo.color === 'green' ? 'text-green-500' :
              strengthInfo.color === 'yellow' ? 'text-yellow-500' :
              'text-red-500'
            }`}>
              {strengthInfo.label}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                strengthInfo.color === 'green' ? 'bg-green-500' :
                strengthInfo.color === 'yellow' ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
              style={{ width: `${(strengthInfo.strength / 6) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Helper text */}
      {props.helperText && !error && (
        <p className="text-xs text-gray-500">{props.helperText}</p>
      )}
    </div>
  );
}

// Phone number field with formatting
export function PhoneField({ value, onChange, ...props }) {
  const formatPhone = (phone) => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format based on length
    if (cleaned.length <= 4) return cleaned;
    if (cleaned.length <= 7) return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 10)}`;
  };

  const handleChange = (e) => {
    const formatted = formatPhone(e.target.value);
    onChange({ ...e, target: { ...e.target, value: formatted } });
  };

  return (
    <FormField
      {...props}
      type="tel"
      value={value}
      onChange={handleChange}
      placeholder="07XX XXX XXX"
      maxLength={12}
    />
  );
}

// Amount field with formatting
export function AmountField({ value, onChange, currency = 'KES', ...props }) {
  const formatAmount = (amount) => {
    if (!amount) return '';
    
    // Remove non-digit characters except decimal point
    const cleaned = amount.replace(/[^\d.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      parts.splice(2);
    }
    
    return parts.join('.');
  };

  const handleChange = (e) => {
    const formatted = formatAmount(e.target.value);
    onChange({ ...e, target: { ...e.target, value: formatted } });
  };

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">
        {currency}
      </span>
      <FormField
        {...props}
        type="number"
        value={value}
        onChange={handleChange}
        className="pl-12"
        placeholder="0.00"
        step="0.01"
        min="0"
      />
    </div>
  );
}

// PIN field with show/hide toggle
export function PinField({ value, onChange, showStrength = false, ...props }) {
  const [showPin, setShowPin] = React.useState(false);
  const strengthInfo = showStrength && value ? require('../../utils/validation').getPinStrength(value) : null;

  return (
    <div className="relative">
      <FormField
        {...props}
        type={showPin ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        showStrengthIndicator={showStrength}
        strengthInfo={strengthInfo}
        maxLength={8}
        pattern="\d*"
        inputMode="numeric"
      />
      <button
        type="button"
        onClick={() => setShowPin(!showPin)}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 focus:outline-none"
      >
        {showPin ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        )}
      </button>
    </div>
  );
}
