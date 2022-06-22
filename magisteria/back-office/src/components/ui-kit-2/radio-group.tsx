import React, { forwardRef, useMemo } from 'react';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import type { RadioGroupProps } from '@material-ui/core/RadioGroup/RadioGroup';
import { FormLabel, styled, withStyles } from '@material-ui/core';

export interface RadioButtonsGroupProps extends RadioGroupProps {
  label?: string;
  options: Array<{ value: string | number, label: string }>;
}

const StyledLabel = styled(FormLabel)({
  paddingBottom: '16px',
}) as typeof FormLabel;

const RadioLabel = styled(FormControlLabel)({
  paddingLeft: '16px',
  '& .MuiTypography-body1': {
    fontFamily: 'Inter',
    fontStyle: 'normal',
    fontWeight: 400,
    fontSize: '14px',
    lineHeight: '22px',
    letterSpacing: '0.25px',
  },
}) as typeof FormControlLabel;

const StyledRadio = styled(Radio)({

}) as typeof Radio;

export const RadioButtonsGroup = forwardRef(({
  label = '',
  options,
  ...props
}: RadioButtonsGroupProps,
ref) => {
  const renderOptions = useMemo(() => options.map((item) => (
    <RadioLabel value={item.value} control={<StyledRadio />} label={item.label} key={item.value} />
  )), [options]);

  return (
    <div className="ui-kit__radio-group">
      <StyledLabel className="radio-group__label font-body-m _grey100" component="legend">{label}</StyledLabel>
      <RadioGroup
        // row
        ref={ref}
        {...props}
      >
        {renderOptions}
      </RadioGroup>
    </div>
  );
});
