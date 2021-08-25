import React from 'react';
import {
  Animated, Text, TouchableHighlight,
} from 'react-native';
import { SerifsContext } from '../serifs/context';
import styles from './styles';
import {calcScaleY, VERTICAL_STEP} from "../../helpers/tools";
// import {LinearGradient} from "react-native-svg";

type Props = {
  item: Object,
  onMount: Function,
  onClick: Function,
  x: number,
  y: number,
  isActive: boolean,
  zoom: number,
  isLastPoint: boolean,
  onLastPoint?: Function,
};

const MAX_WIDTH = 141;

export default class EventPoint extends React.PureComponent {
  constructor(props: Props) {
    super(props);

    this.opacityAnim = new Animated.Value(1);
    this.verticalAnim = new Animated.Value(1);

    this.state = {
      flagHeight: 0,
      opacity: this.opacityAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1],
      }),
      top: this.verticalAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, props.y],
      }),
      scale: this.verticalAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
      }),
      indent: this.verticalAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0],
      }),
    };

    this.container = React.createRef();
    this.flagpole = React.createRef();
  }

  componentDidUpdate(prevProps, prevState) {
    const {visible, y, level} = this.props,
        {flagHeight} = this.state;

    if (prevProps.visible !== visible) {
      this.opacityAnim = new Animated.Value(0);

      const _oldValue = prevProps.visible ? 1 : 0,
          _newValue = visible ? 1 : 0

      this.setState({
        opacity: this.opacityAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [_oldValue, _newValue],
        }),
      });
    }

    if (this.state.opacity !== prevState.opacity) {
      Animated.timing(this.opacityAnim, {
        toValue: 1,
        duration: 580,
        useNativeDriver: true,
      }).start();
    }

    if (prevProps.y !== y) {

      const prevScale = calcScaleY(prevProps.level, flagHeight),
        newScale = calcScaleY(level, flagHeight),
        oldIndent = prevProps.level * VERTICAL_STEP / 2,
        newIndent = level * VERTICAL_STEP / 2;

      this.verticalAnim = new Animated.Value(0);
      this.setState({
        top: this.verticalAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [prevProps.y, y],
        }),
        scale: this.verticalAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [prevScale, newScale],
        }),
        indent: this.verticalAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [oldIndent, newIndent],
        }),
      });
    }

    if (this.state.top !== prevState.top) {
      Animated.timing(this.verticalAnim, {
        toValue: 1,
        duration: 670,
        useNativeDriver: true,
      }).start();
    }
  }

  onTextLayout(event) {
    const data = event.nativeEvent.layout,
      { width, height } = data

    this.setState({ flagHeight : height })

    if (width >= 125) {
      this.setState({
        needMask: true,
      });
    }
  }

  onViewLayout(event) {
    const data = event.nativeEvent.layout,
        {width} = data,
        {onMount, x, item} = this.props;

    if (onMount && width) {
      item.left = x;
      item.width = width;
      onMount(item.id);
    }
  }

  onClick() {
    const { onClick, item } = this.props

    if (onClick) { onClick(item.id); }
  }

  render() {
    const { zoom } = this.context;

    const { isActive, x, item, zIndex } = this.props,
      { top, scale, indent, opacity, flagHeight } = this.state,
      left = x * zoom;

    const wrapperStyle = {
      left,
      zIndex,
      opacity,
      maxWidth: MAX_WIDTH,
      transform: [{ translateY: top },]
    };
    const eventStyle = {
      backgroundColor: item.color,
      opacity: isActive ? 1 : 0.57,
    };
    const flagpoleStyle = {
      backgroundColor: item.color,
      opacity: isActive ? 1 : 0.57,
      height: VERTICAL_STEP - flagHeight,
      top: flagHeight,
      transform: [{ translateY: indent }, { scaleY: scale }]
    };
    const dateStyle = {
      opacity: isActive ? 1 : 0.57,
    }

    return (
      <Animated.View
        style={[styles.wrapper, wrapperStyle]}
        ref={this.container}
        onLayout={this.onViewLayout.bind(this)}>
        <TouchableHighlight onPress={this.onClick.bind(this)} underlayColor="transparent">
          <Animated.View>
            <Animated.View style={[styles.event, eventStyle]}>
              <Text numberOfLines={1} style={styles.title} onLayout={this.onTextLayout.bind(this)}>{item.name}</Text>
              {/* {needMask && <LinearGradient style={sty les.mask} colors={['#f00', '#0f0']}/>} */}
            </Animated.View>
            <Text numberOfLines={1} style={[styles.title, styles.date, dateStyle]}>
              {item.displayDate}
            </Text>
            <Animated.View style={[styles.flagpole, flagpoleStyle]} ref={this.flagpole}/>
          </Animated.View>
        </TouchableHighlight>
      </Animated.View>
    );
  }
}

EventPoint.contextType = SerifsContext;
