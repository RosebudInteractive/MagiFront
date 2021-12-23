import {
  StyleSheet,
  ViewStyle,
} from 'react-native';

type Styles = {
  mainContainer: ViewStyle,
  timelineContainer: ViewStyle,
  timeline: ViewStyle,
};

export default StyleSheet.create<Styles>({
  mainContainer: {
    width: '100%',
    height: 500,
  },
  timelineContainer: {
    flexDirection: 'column',
    flex: 1,
    width: '100%',
  },
  timeline: {
    width: '100%',
    height: '100%',
  },
});
