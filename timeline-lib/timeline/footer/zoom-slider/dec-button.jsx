import * as React from 'react';
/* eslint-disable react/jsx-props-no-spreading */
function DecreaseButton(props) {
    return (<svg width={23} height={24} fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g clipPath="url(#prefix__clip0)">
        <path d="M9.211 13.25V11.9h4.906v1.352H9.21z" fill="#fff"/>
        <circle cx={11.5} cy={12.5} r={7.5} stroke="#fff" strokeWidth={2}/>
      </g>
      <defs>
        <clipPath id="prefix__clip0">
          <path fill="#fff" transform="translate(-1)" d="M0 0h24v24H0z"/>
        </clipPath>
      </defs>
    </svg>);
}
/* eslint-enable react/jsx-props-no-spreading */
export default DecreaseButton;
