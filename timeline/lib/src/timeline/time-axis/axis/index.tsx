import React, { useMemo } from 'react';
import { View } from 'react-native';
// import Serifs from './serifs';
import styles from './styles';
import SerifItem from './serifs/item';

type Props = {
  width: number,
  top: number,
  serifs: any,
  yearPerPixel: number,
  startDate: number;
};

// eslint-disable-next-line react/function-component-definition
export default function Axis(props: Props): JSX.Element {
  const {
    width, top, serifs, yearPerPixel, startDate,
  } = props;

  const style = useMemo(() => ({
    width,
    top,
  }), [width, top]);

  return (
    <View style={[styles.wrapper, style]}>
      {
        serifs.map((serif: number) => (
          <SerifItem
            yearPerPixel={yearPerPixel}
            startDate={startDate}
            year={serif}
            rightBound={width}
            key={serif}
          />
        ))
      }
    </View>
  );
}
