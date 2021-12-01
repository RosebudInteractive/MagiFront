import React, { useMemo } from 'react';
import { View } from 'react-native';
// import Serifs from './serifs';
import styles from './styles';
import SerifItem from './serifs/item';
export default function Axis(props) {
    const { width, top, serifs, yearPerPixel, startDate, } = props;
    const style = useMemo(() => ({
        width,
        top,
    }), [width, top]);
    return (<View style={[styles.wrapper, style]}>
      {serifs.map((serif) => (<SerifItem yearPerPixel={yearPerPixel} startDate={startDate} year={serif} rightBound={width} key={serif}/>))}
    </View>);
}
