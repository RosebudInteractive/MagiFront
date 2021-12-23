import * as React from 'react';
import Svg, {
  G, Path, Circle, Defs, ClipPath,
} from 'react-native-svg';

type Props = any;
/* eslint-disable react/jsx-props-no-spreading */
const DecreaseButton = function (props: Props) {
  return (
    <Svg
      width={23}
      height={24}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <G clipPath="url(#prefix__clip0)">
        <Path d="M9.211 13.25V11.9h4.906v1.352H9.21z" fill="#fff" />
        <Circle cx={11.5} cy={12.5} r={7.5} stroke="#fff" strokeWidth={2} />
      </G>
      <Defs>
        <ClipPath id="prefix__clip0">
          <Path fill="#fff" transform="translate(-1)" d="M0 0h24v24H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};
/* eslint-enable react/jsx-props-no-spreading */

export default DecreaseButton;
