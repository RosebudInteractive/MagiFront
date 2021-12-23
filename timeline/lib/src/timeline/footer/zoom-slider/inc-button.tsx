import * as React from 'react';
import Svg, {
  G, Path, Circle, Defs, ClipPath,
} from 'react-native-svg';

type Props = any;
/* eslint-disable react/jsx-props-no-spreading */
const IncreaseButton = function (props: Props) {
  return (
    <Svg
      width={24}
      height={24}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <G clipPath="url(#prefix__clip0)">
        <Path
          d="M13.386 9.004v2.6h2.53v1.317h-2.53v2.583H11.93v-2.583H9.416v-1.317h2.514v-2.6h1.456z"
          fill="#fff"
        />
        <Circle cx={12.5} cy={12.5} r={7.5} stroke="#fff" strokeWidth={2} />
      </G>
      <Defs>
        <ClipPath id="prefix__clip0">
          <Path fill="#fff" d="M0 0h24v24H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};
/* eslint-enable react/jsx-props-no-spreading */

export default IncreaseButton;
