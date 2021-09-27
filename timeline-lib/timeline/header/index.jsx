import React from 'react';
import { Text, TouchableOpacity, View, } from 'react-native';
import style from './style';
import Button from './button';
export default function Header(props) {
    const { title, onOpenPress } = props;
    return (<View style={[style.header]}>
      <Text style={style.title}>{title}</Text>
      <TouchableOpacity onPress={onOpenPress}>
        <View style={style.button}>
          {/*<Button />*/}
        </View>
      </TouchableOpacity>
    </View>);
}