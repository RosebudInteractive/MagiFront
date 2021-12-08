import React from 'react';
import { Animated, Text, TouchableHighlight, } from 'react-native';
import SerifsContext from '../serifs/context';
import styles from './styles';
import { hexToRgb } from '../../../helpers/tools';
import SETTINGS from '../../settings';
import getWidthOfText from '../../../helpers/get-width-of-text';
/* eslint-disable react/sort-comp */
export default class AnimatedPeriod extends React.Component {
    opacityAnim;
    verticalAnim;
    dateWidth;
    titleWidth;
    periodWidth;
    viewRef;
    setViewRef;
    constructor(props) {
        super(props);
        this.opacityAnim = new Animated.Value(1);
        this.verticalAnim = new Animated.Value(1);
        this.dateWidth = undefined;
        this.titleWidth = undefined;
        this.periodWidth = undefined;
        this.viewRef = null;
        this.state = {
            opacity: this.opacityAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1],
            }),
            top: this.verticalAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, props.y],
            }),
            showDate: false,
            showTitle: false,
        };
        this.setViewRef = (element) => {
            if (!element)
                return;
            this.viewRef = element;
            this.calculateDeprecated();
        };
    }
    calculateDeprecated() {
        const { isDeprecatedBrowser } = this.context;
        if (!isDeprecatedBrowser)
            return;
        if (this.viewRef) {
            const width = this.viewRef.clientWidth;
            if (this.periodWidth !== width) {
                this.periodWidth = width;
                this.calculateTextVisible();
            }
        }
    }
    calculateTextVisible() {
        const { period } = this.props;
        this.dateWidth = getWidthOfText(period.displayDate, 'Fira Sans', 11, '400');
        this.titleWidth = getWidthOfText(period.title, 'Fira Sans', 11, '400');
        if ((this.dateWidth !== undefined)
            && (this.titleWidth !== undefined)
            && (this.periodWidth !== undefined)) {
            if (this.periodWidth <= SETTINGS.period.emptyWidth) {
                this.setState({
                    showDate: false,
                    showTitle: false,
                });
                return;
            }
            const margins = 8 * 3;
            const titleWidth = this.titleWidth < SETTINGS.period.minTitleWidth
                ? this.titleWidth
                : SETTINGS.period.minTitleWidth;
            const showDate = (this.dateWidth + margins + titleWidth) < this.periodWidth;
            this.setState({
                showDate,
                showTitle: true,
            });
        }
    }
    UNSAFE_componentWillReceiveProps(nextProps, nextContext) {
        const { zoom } = this.context;
        if (nextContext.zoom !== zoom) {
            this.dateWidth = undefined;
            this.titleWidth = undefined;
            this.periodWidth = undefined;
        }
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
        this.calculateDeprecated();
    }
    onPress() {
        const { onClick, period } = this.props;
        if (onClick) {
            onClick(period);
        }
    }
    onPeriodLayout(event) {
        const data = event.nativeEvent.layout;
        const { width } = data;
        this.periodWidth = width;
        this.calculateTextVisible();
    }
    render() {
        const { zoom, theme } = this.context;
        const { startX, endX, period, isActive, index, } = this.props;
        const left = startX * zoom;
        const width = Math.ceil(endX * zoom - startX * zoom);
        const { top, opacity, showDate, showTitle, } = this.state;
        const color = theme ? theme.getColor(index) : period.color;
        const enableAlpha = theme ? theme.enableAlpha : true;
        let backgroundColor = color;
        period.color = color;
        period.left = left;
        period.width = width;
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
        if (theme && theme.font) {
            if (theme.font.family) {
                titleStyle.fontFamily = theme.font.family;
                dateStyle.fontFamily = theme.font.family;
            }
            if (theme.font.weight) {
                titleStyle.fontWeight = theme.font.weight;
            }
            if (theme.font.size) {
                titleStyle.fontSize = theme.font.size;
                dateStyle.fontSize = theme.font.size;
            }
            if (theme.font.color) {
                titleStyle.color = theme.font.color;
                dateStyle.color = theme.font.color;
            }
        }
        // this.onTextLayout.bind(this)
        /* eslint-disable react/jsx-no-bind */
        return (<TouchableHighlight onPress={this.onPress.bind(this)} underlayColor="transparent">
        <Animated.View style={[styles.period, style]} onLayout={this.onPeriodLayout.bind(this)}
        // @ts-ignore
        ref={this.setViewRef}>
          {showDate
                && (<Text numberOfLines={1} style={[styles.title, styles.dateTitle, dateStyle]}>
                {period.displayDate}
              </Text>)}
          {showTitle
                && (<Text numberOfLines={1} style={[styles.title, titleStyle]}>
                {period.title}
              </Text>)}
        </Animated.View>
      </TouchableHighlight>);
        /* eslint-enable react/jsx-no-bind */
    }
}
AnimatedPeriod.contextType = SerifsContext;
