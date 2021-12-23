import { StyleSheet, TextStyle, ViewStyle } from 'react-native';

type Styles = {
  footer: ViewStyle,
  title: TextStyle,
  button: ViewStyle,
};

export default StyleSheet.create<Styles>({
  footer: {
    position: 'absolute',
    display: 'flex',
    bottom: 8,
    alignItems: 'center',
    height: 49,
    width: '100%',
    // backgroundColor: 'rgba(47,47,47,0.6)',
    flexDirection: 'row',
  },
  title: {
    fontFamily: 'Fira Sans',
    fontSize: 28,
    color: '#FFFFFF',
    lineHeight: 34,
    marginLeft: 19,
    flexGrow: 1,
  },
  button: {
    marginRight: 12,
  },
});
