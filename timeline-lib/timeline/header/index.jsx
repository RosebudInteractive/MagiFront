import React from 'react';
import { Text, TouchableOpacity, View, } from 'react-native';
import style from './style';
import Button from './button';
export default function Header(props) {
    const { title, width, onOpenPress } = props;
    const openPress = (event) => {
        if (onOpenPress) {
            onOpenPress(event);
        }
    };
    return (<View style={[style.header, { width }]}>
      <Text style={style.title}>{title}</Text>
      <TouchableOpacity onPress={openPress}>
        <View style={style.button}>
          <Button />
        </View>
      </TouchableOpacity>
    </View>);
}
