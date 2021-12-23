import { StyleSheet, TextStyle, ViewStyle } from 'react-native';

type Styles = {
  header: ViewStyle,
  title: TextStyle,
  button: ViewStyle,
};

export default StyleSheet.create<Styles>({
  header: {
    position: 'absolute',
    display: 'flex',
    // justifyContent: 'center',
    alignItems: 'center',
    height: 49,
    width: '100%',
    backgroundColor: 'rgba(47,47,47,0.6)',
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
    alignSelf: 'flex-end',
    marginRight: 12,
  },
});
