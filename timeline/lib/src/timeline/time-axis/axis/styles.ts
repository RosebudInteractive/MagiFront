import { StyleSheet, ViewStyle } from 'react-native'

type Styles = {
  wrapper: ViewStyle,
};

export default StyleSheet.create<Styles>({
  wrapper: {
    borderTopColor: 'rgb(255, 255, 255)',
    borderTopWidth: 2,
    position: 'absolute',
  },
});
