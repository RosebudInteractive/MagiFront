import { View } from 'react-native';
import React from 'react';
import DecreaseButton from './dec-button';
import IncreaseButton from './inc-button';

type Props = {
  value: number,
  onChange: Function,
  onSliderStop: Function
};

// @ts-ignore
export default function ZoomSlider(props: Props): JSX.Element {
  return (
    <View>
      <IncreaseButton />
      <DecreaseButton />
    </View>
  );
}
