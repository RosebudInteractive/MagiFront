import {StyleSheet, TextStyle, ViewStyle} from 'react-native';

type Styles = {
  period: ViewStyle,
  title: TextStyle,
  dateTitle: TextStyle,
};
export default StyleSheet.create<Styles>({
  period: {
    position: 'absolute',
    borderRadius: 4,
    flexDirection: 'row',
    overflow: 'hidden',
    height: 24,
    justifyContent: 'flex-start',
    alignItems: 'center',
    // @ts-ignore
    cursor: 'pointer',
  },
  title: {
    color: 'white',
    fontFamily: 'Fira Sans',
    fontWeight: '400',
    fontSize: 10,
    marginHorizontal: 8,
  },
  dateTitle: {
    opacity: 0.57,
    marginLeft: 8,
    marginRight: 0,
  },
});
