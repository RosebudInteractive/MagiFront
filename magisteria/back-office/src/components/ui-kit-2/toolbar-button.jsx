import React, { forwardRef } from 'react';
import styled from 'styled-components';
const Tooltip = styled.div `
  position: absolute;
  box-shadow: 0 1px 3px 0 dimgrey;
  background: white;
  opacity: 0;
  visibility: hidden;
  width: initial;
  padding: 9px 17px;
  text-align: center;
  left: 50%;
  font-size: 1em;
  line-height: 20px;
  border-radius: 6px;
  transition: visibility, opacity 300ms ease;
  transform: translateX(-50%);
  z-index: 1;
  top: 54px;
  &::after {
    content: "";
    position: absolute;
    bottom: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: transparent transparent white transparent;
  }
`;
const Button = styled.button `
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  opacity: .4;
  transition: opacity 300ms ease-in-out;
  border-radius: 8px;
  position: relative;
  &:hover {
    opacity: 1;
    background-color: #F8F8F8;
    ${Tooltip} {
      visibility: visible;
      opacity: 1;
    }
  }
  
  &:hover + ${Tooltip} {
    visibility: visible;
    opacity: 1;
  }

  & > svg {
    width: 24px;
    height: 24px;
    
    *[fill ^= '#'] {
    fill: ${({ appearance }) => appearance === 'grey' && '#5A5B6A !important'}
  }}
`;
export const ToolbarButton = forwardRef(({ icon, tooltipText, appearance = 'default', type = 'button', ...props }, ref) => (<Button ref={ref} appearance={appearance} type={type} {...props}>
    {icon}
    {tooltipText && <Tooltip>{tooltipText}</Tooltip>}
  </Button>));
