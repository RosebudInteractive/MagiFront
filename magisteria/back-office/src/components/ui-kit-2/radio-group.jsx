import React, { forwardRef, useMemo } from 'react';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { FormLabel, styled } from '@material-ui/core';
const StyledLabel = styled(FormLabel)({
    paddingBottom: '16px',
});
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
});
const StyledRadio = styled(Radio)({
    '&.Mui-checked': {
        color: '#C8684C',
    },
});
export const RadioButtonsGroup = forwardRef(({ label = '', disabled = false, options, ...props }, ref) => {
    const renderOptions = useMemo(() => options.map((item) => (<RadioLabel value={item.value} disabled={disabled} control={<StyledRadio />} label={item.label} key={item.value}/>)), [options]);
    return (<div className="ui-kit__radio-group">
      <StyledLabel className="radio-group__label font-body-m _grey100" component="legend">{label}</StyledLabel>
      <RadioGroup 
    // row
    ref={ref} {...props}>
        {renderOptions}
      </RadioGroup>
    </div>);
});
