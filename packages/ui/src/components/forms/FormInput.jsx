import React from 'react';
import { cn } from '../../utils/cn';
import { baseInputClass, normalInputBorder, errorInputBorder } from './InputStyles';

export const FormInput = ({
  error = false,
  className = '',
  ...props
}) => {
  return (
    <input
      className={cn(
        baseInputClass,
        error ? errorInputBorder : normalInputBorder,
        className
      )}
      {...props}
    />
  );
};
