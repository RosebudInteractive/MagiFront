import React from 'react';
import { Text, View, } from 'react-native';
import style from './style';
export default function Header(props) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { title, width, onOpenPress } = props;
    // const openPress = (event: GestureResponderEvent) => {
    //   if (onOpenPress) {
    //     onOpenPress(event);
    //   }
    // };
    return (<View style={[style.header, { width }]}>
      <Text style={style.title}>{title}</Text>
      {/* <TouchableOpacity onPress={openPress}> */}
      {/*  <View */}
      {/*    style={style.button} */}
      {/*  > */}
      {/*    <Button /> */}
      {/*  </View> */}
      {/* </TouchableOpacity> */}
    </View>);
}
