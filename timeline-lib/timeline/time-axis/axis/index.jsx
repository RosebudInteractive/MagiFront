import React, { useMemo } from 'react';
import { View } from 'react-native';
import Serifs from './serifs';
import styles from './styles';
export default function Axis(props) {
    const { width, top, serifs, yearPerPixel, } = props;
    const style = useMemo(() => ({
        width: width + 40,
        top,
    }), [width, top]);
    return (<View style={[styles.wrapper, style]}>
      <Serifs points={serifs} yearPerPixel={yearPerPixel} width={width}/>
    </View>);
}
