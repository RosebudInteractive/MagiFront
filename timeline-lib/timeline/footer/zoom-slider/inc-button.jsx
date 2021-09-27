import * as React from 'react';
// import Svg, { G, Path, Circle, Defs, ClipPath, } from 'react-native-svg';
/* eslint-disable react/jsx-props-no-spreading */
function IncreaseButton(props) {
    return (<svg width={24} height={24} fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g clipPath="url(#prefix__clip0)">
        <path d="M13.386 9.004v2.6h2.53v1.317h-2.53v2.583H11.93v-2.583H9.416v-1.317h2.514v-2.6h1.456z" fill="#fff"/>
        <circle cx={12.5} cy={12.5} r={7.5} stroke="#fff" strokeWidth={2}/>
      </g>
      <defs>
        <clipPath id="prefix__clip0">
          <path fill="#fff" d="M0 0h24v24H0z"/>
        </clipPath>
      </defs>
    </svg>);
}
/* eslint-enable react/jsx-props-no-spreading */
export default IncreaseButton;
