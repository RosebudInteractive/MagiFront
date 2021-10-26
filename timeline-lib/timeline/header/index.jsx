import React from 'react';
import { Text, View, } from 'react-native';
import style from './style';
export default function Header(props) {
    const { title, width, } = props;
    return (<View style={[style.header, { width }]}>
      <Text style={style.title}>{title}</Text>
    </View>);
}
