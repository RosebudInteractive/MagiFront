import * as React from 'react';
/* eslint-disable react/jsx-props-no-spreading */
function CloseButton(props) {
    return (<svg width={16} height={16} fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path fillRule="evenodd" clipRule="evenodd" d="M6.925 8L1 2.075 2.075 1 8 6.925 13.925 1 15 2.075 9.075 8 15 13.925 13.925 15 8 9.075 2.075 15 1 13.925 6.925 8z" fill="#fff" fillOpacity={0.6}/>
    </svg>);
}
export default CloseButton;
