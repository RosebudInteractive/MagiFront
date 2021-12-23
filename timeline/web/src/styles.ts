import {
  StyleSheet, TextStyle, ViewStyle,
} from 'react-native';

type Styles = {
  mainContainer: ViewStyle,
  controlContainer: ViewStyle,
  rowContainer: ViewStyle,
  timeline: ViewStyle,
  timelineList: ViewStyle,
  buttonsTitle: TextStyle,
  buttonsTitleWithMargin: TextStyle,
  buttonText: TextStyle,
  button: ViewStyle,
  buttonDisabled: ViewStyle,
};

export default StyleSheet.create<Styles>({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    alignSelf: 'center',
    paddingVertical: 30,
    paddingHorizontal: 30,
  },
  timeline: {
    width: '100%',
  },
  timelineList: {
    overflow: 'scroll',
  },
  // buttons: {
  //   flexGrow: 0,
  //   marginTop: 30,
  //   flexDirection: 'column',
  //   width: '100%',
  // },
  buttonsTitle: {
    textAlign: 'center',
  },
  buttonsTitleWithMargin: {
    marginTop: 10,
    marginBottom: 20,
  },
  // buttonsRow: {
  //   marginTop: 10,
  // },
  button: {
    borderRadius: 10,
    backgroundColor: 'rgb(93, 171, 86)',
    paddingVertical: 5,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    flexGrow: 0,
  },
  buttonDisabled: {
    backgroundColor: 'rgb(157, 157, 157)',
  },
  buttonText: {
    color: '#fff',
  },
  controlContainer: {
    flex: 1,
    flexShrink: 1,
    flexGrow: 0,
    flexBasis: 'auto',
    marginRight: 15,
    width: 'auto',
    flexDirection: 'row',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 10,
  },
  rowContainer: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    // alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
  },
});
