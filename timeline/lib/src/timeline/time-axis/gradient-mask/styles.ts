import { StyleSheet, ViewProps } from 'react-native';

type Styles = {
  mask: ViewProps,
};

export default StyleSheet.create<Styles>({
  mask: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    borderBottomRightRadius: 4,
  },
});
