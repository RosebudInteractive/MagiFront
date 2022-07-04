import React from 'react';
import {
  FormControlLabel, Checkbox, withStyles,
} from '@material-ui/core';
import type { CheckboxProps } from '@material-ui/core/Checkbox/Checkbox';

export interface UiCheckBoxProps extends CheckboxProps {
  label?: string;
}

const CssFormControlLabel = withStyles({
  root: {
    '& .MuiCheckbox-colorSecondary.Mui-checked': {
      color: '#5A5B6A',
    },
    '& .MuiIconButton-root:hover': {
      background: 'none',
    },
    '& .MuiCheckbox-colorSecondary.Mui-checked:hover': {
      background: 'none',
    },
    minHeight: '48px',
    '& .MuiTypography-body1': {
      'font-family': 'Inter',
      'font-size': '13px',
      'font-style': 'normal',
      'font-weight': '400',
      'line-height': '18px',
      'letter-spacing': '0.15px',
      'text-align': 'left',
      '&.MuiFormLabel-root.Mui-focused': {
        color: '#C8684C',
      },
    },
    '& label[data-shrink="true"]': {
      // display: "none"
    },
    '& .MuiInputLabel-outlined': {
      transform: 'translate(16px, 14px) scale(1)',
      '&.MuiInputLabel-shrink': {
        transform: 'translate(16px, 0px) scale(0.75)',
      },
    },
    '& .MuiOutlinedInput-multiline': {
      borderRadius: '8px',
      padding: '15px 16px',
      border: '1px solid #D2D2D6',
      '-webkit-transition': 'border, background 300ms ease-out',
      '-moz-transition': 'border, background 300ms ease-out',
      '-o-transition': 'border, background 300ms ease-out',
      transition: 'border, background 300ms ease-out',
      'font-family': 'Inter',
      'font-style': 'normal',
      'font-weight': 'normal',
      'font-size': '13px',
      'line-height': '18px',
      'letter-spacing': '0.15px',
      color: '#19191D',
      '&:hover:not(.Mui-disabled)': {
        backgroundColor: '#E5E5E7',
        borderColor: '#C8684C',
      },
      '&.Mui-focused': {
        border: '1px solid #C8684C',
      },
      '&.Mui-disabled': {
        backgroundColor: '#F8F8F8',
        color: '#9696A0',
      },
    },

    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        border: 'none',
      },
      '& fieldset legend': {
        display: 'none',
      },
      '& input': {
        borderRadius: '8px',
        padding: '15px 16px',
        border: '1px solid #D2D2D6',
        '-webkit-transition': 'border, background 300ms ease-out',
        '-moz-transition': 'border, background 300ms ease-out',
        '-o-transition': 'border, background 300ms ease-out',
        transition: 'border, background 300ms ease-out',
        'font-family': 'Inter',
        'font-style': 'normal',
        'font-weight': 'normal',
        'font-size': '13px',
        'line-height': '18px',
        'letter-spacing': '0.15px',
        color: '#19191D',

      },
      '&:hover input:not(.Mui-disabled)': {
        backgroundColor: '#E5E5E7',
        borderColor: '#C8684C',
      },
      '&.Mui-focused input': {
        border: '1px solid #C8684C',
      },
      '&.Mui-disabled input': {
        backgroundColor: '#F8F8F8',
        color: '#9696A0',
      },
    },
  },
})(FormControlLabel);

export const UiCheckbox = ({ value, label = '', ...props }: UiCheckBoxProps) => {
  const inputValue = !!value;

  return (
    <CssFormControlLabel
      control={<Checkbox checked={inputValue} {...props} />}
      label={label}
    />
  );
}
