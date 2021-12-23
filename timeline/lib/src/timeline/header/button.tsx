import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

type Props = any;
/* eslint-disable react/jsx-props-no-spreading */
function SvgComponent(props: Props) {
  return (
    <Svg
      width={24}
      height={24}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path stroke="#fff" strokeWidth={2} d="M2 4h20v16H2z" />
      <Path fill="#fff" d="M13 4h10v5H13z" />
    </Svg>
  );
}
/* eslint-enable react/jsx-props-no-spreading */

export default SvgComponent;
