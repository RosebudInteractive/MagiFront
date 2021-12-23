import React from 'react';
import {
  GestureResponderEvent, Text, View,
} from 'react-native';
import style from './style';

type Props = {
  title: string,
  width: number | string,
  // eslint-disable-next-line react/require-default-props
  onOpenPress?: ((event: GestureResponderEvent) => void) | undefined,
};

// eslint-disable-next-line react/function-component-definition
export default function Header(props: Props): JSX.Element {
  // @ts-ignore
  const { title, width, onOpenPress } = props;

  // const openPress = (event: GestureResponderEvent) => {
  //   if (onOpenPress) {
  //     onOpenPress(event);
  //   }
  // };

  return (
    <View style={[style.header, { width }]}>
      <Text style={style.title}>{title}</Text>
      {/* <TouchableOpacity onPress={openPress}> */}
      {/*  <View */}
      {/*    style={style.button} */}
      {/*  > */}
      {/*    <Button /> */}
      {/*  </View> */}
      {/* </TouchableOpacity> */}
    </View>
  );
}
