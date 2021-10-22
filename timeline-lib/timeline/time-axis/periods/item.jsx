import React from 'react';
import { Animated, Text, TouchableHighlight, } from 'react-native';
import SerifsContext from '../serifs/context';
import styles from './styles';
import { hexToRgb } from '../../../helpers/tools';
/* eslint-disable react/sort-comp */
export default class AnimatedPeriod extends React.Component {
    opacityAnim;
    verticalAnim;
    constructor(props) {
        super(props);
        this.opacityAnim = new Animated.Value(1);
        this.verticalAnim = new Animated.Value(1);
        this.state = {
            opacity: this.opacityAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1],
            }),
            top: this.verticalAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, props.y],
            }),
        };
    }
    componentDidUpdate(prevProps, prevState) {
        const { visible, y } = this.props;
        const { opacity, top, } = this.state;
        if (prevProps.visible !== visible) {
            this.opacityAnim = new Animated.Value(0);
            const oldValue = prevProps.visible ? 1 : 0;
            const newValue = visible ? 1 : 0;
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({
                opacity: this.opacityAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [oldValue, newValue],
                }),
            });
        }
        if (opacity !== prevState.opacity) {
            Animated.timing(this.opacityAnim, {
                toValue: 1,
                duration: 580,
                useNativeDriver: true,
            }).start();
        }
        if (prevProps.y !== y) {
            this.verticalAnim = new Animated.Value(0);
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({
                top: this.verticalAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [prevProps.y, y],
                }),
            });
        }
        if (top !== prevState.top) {
            Animated.timing(this.verticalAnim, {
                toValue: 1,
                duration: 670,
                useNativeDriver: true,
            }).start();
        }
    }
    onPress() {
        const { onClick, period } = this.props;
        if (onClick) {
            onClick(period);
        }
    }
    render() {
        const { zoom, theme } = this.context;
        const { startX, endX, period, isActive, index, } = this.props;
        const left = startX * zoom + 20;
        const width = Math.ceil(endX * zoom - startX * zoom);
        const { top, opacity } = this.state;
        const color = theme ? theme.getColor(index) : period.color;
        const enableAlpha = theme ? theme.enableAlpha : true;
        let backgroundColor = color;
        period.color = color;
        if (enableAlpha) {
            const { r, g, b } = hexToRgb(color);
            const alpha = isActive ? 1 : 0.5;
            backgroundColor = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
        const style = {
            left,
            width,
            opacity,
            backgroundColor,
            zIndex: isActive ? 2 : 1,
            transform: [{ translateY: top }],
        };
        const titleStyle = {};
        const dateStyle = {};
        if (theme) {
            if (theme.font && theme.font.family) {
                titleStyle.fontFamily = theme.font.family;
                dateStyle.fontFamily = theme.font.family;
            }
            if (theme.font && theme.font.weight) {
                titleStyle.fontWeight = theme.font.weight;
            }
            if (theme.font && theme.font.size) {
                titleStyle.fontSize = theme.font.size;
                dateStyle.fontSize = theme.font.size;
            }
            if (theme.font && theme.font.color) {
                titleStyle.color = theme.font.color;
                dateStyle.color = theme.font.color;
            }
        }
        /* eslint-disable react/jsx-no-bind */
        return (<TouchableHighlight onPress={this.onPress.bind(this)} underlayColor="transparent">
        <Animated.View style={[styles.period, style]}>
          <Text numberOfLines={1} style={[styles.title, styles.dateTitle, titleStyle]}>
            {period.displayDate}
          </Text>
          <Text numberOfLines={1} style={[styles.title, dateStyle]}>{period.title}</Text>
        </Animated.View>
      </TouchableHighlight>);
        /* eslint-enable react/jsx-no-bind */
    }
}
AnimatedPeriod.contextType = SerifsContext;
