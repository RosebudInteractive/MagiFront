import * as React from 'react';
/* eslint-disable react/jsx-props-no-spreading */
function SvgComponent(props) {
    return (<svg width={24} height={24} fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M2 4h6v2H4v3H2V4zM2 20h12v-9H2v9zM22 20h-6v-2h4v-3h2v5zM22 4h-6v2h4v3h2V4z" fill="#fff"/>
    </svg>);
}
/* eslint-enable react/jsx-props-no-spreading */
export default SvgComponent;
