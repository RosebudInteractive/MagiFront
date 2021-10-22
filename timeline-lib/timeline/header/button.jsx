import * as React from 'react';
/* eslint-disable react/jsx-props-no-spreading */
function SvgComponent(props) {
    return (<svg width={24} height={24} fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path stroke="#fff" strokeWidth={2} d="M2 4h20v16H2z"/>
      <path fill="#fff" d="M13 4h10v5H13z"/>
    </svg>);
}
/* eslint-enable react/jsx-props-no-spreading */
export default SvgComponent;
