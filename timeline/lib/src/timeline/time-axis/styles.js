import {
  StyleSheet,
} from 'react-native';

export default StyleSheet.create({
  timelineContainer: {
    flexDirection: 'column',
    flex: 1,
  },
  timeline: {
    width: 600,
    backgroundColor: 'rgba(0,0,0,.2)',
    overflow: 'scroll',
    // cursor: 'grab',
  },
  timelineList: {
    overflow: 'scroll',
  },
});
