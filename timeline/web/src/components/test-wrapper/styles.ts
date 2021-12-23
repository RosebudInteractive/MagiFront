import {
  StyleSheet,
    ViewStyle,
} from 'react-native'

type Styles = {
  timelineContainer: ViewStyle,
  timeline: ViewStyle,
  background: ViewStyle,
  timelineList: ViewStyle,
}

export default StyleSheet.create<Styles>({
  timelineContainer: {
    flexDirection: 'column',
    flex: 1,
    // position: "absolute",
    // height: '90vh',
    // top: 50,
    // width: '90vw',
  },
  timeline: {
    width: "100%",
    height: "100%",
  },
  background: {
    // @ts-ignore
    backgroundImage: 'linear-gradient(180deg, #00000070, #00000094), url(background.jpg)',
    backgroundPosition: "center",
    backgroundSize: "cover"
  },
  timelineList: {
    overflow: 'scroll',
  },
})
