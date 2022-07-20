import React, { forwardRef } from 'react';
import styled from 'styled-components';
const StyledButton = styled.button `
  padding: 16px;
  border-radius: 8px;
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 17px;

  text-align: center;
  letter-spacing: 0.75px;

  transition: opacity, background-color, border 300ms ease;
  color: ${({ appearance }) => (appearance === 'primary' ? '#FFFFFF' : '#19191D')};
  border: 1px solid transparent;
  
  background-color: ${({ appearance }) => (appearance === 'primary' ? '#C8684C' : '#E5E5E7')};
  &:disabled {
    opacity: .5;
  }
  
  &:hover {
    background-color: ${({ appearance }) => (appearance === 'primary' ? '#DC775A' : '#D2D2D6')};
    box-shadow: 0 2px 10px #9696A0
  }
  
  &:active {
    border-color: ${({ appearance }) => (appearance === 'primary' ? '#C8372D' : '#787885')};
    box-shadow: none;
  }
`;
export const Button = forwardRef(({ appearance = 'primary', dimension = 'l', 
// type = 'button',
children, ...props }, ref) => (<StyledButton type="button" appearance={appearance} dimension={dimension} ref={ref} {...props}>
    {children}
  </StyledButton>));
