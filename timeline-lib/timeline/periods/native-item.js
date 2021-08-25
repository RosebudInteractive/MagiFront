import React from 'react';
import {Animated, Text, TouchableHighlight} from 'react-native';
import {SerifsContext} from "../serifs/context";
import styles from "./styles";

type Props = {
    period: any,
    onClick: Function,
    y: number,
}

export default class Period extends React.Component {
    constructor(props: Props) {
        super(props);
        this.opacityAnim = new Animated.Value(1);
        this.verticalAnim = new Animated.Value(1);

        this.state = {
            titleText: props.title,
            dateText: props.date,

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

    componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot: SS) {
        const {visible, y} = this.props

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
            this.verticalAnim = new Animated.Value(0);
            this.setState({
                    top: this.verticalAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [prevProps.y, y],
                    }),
                },
            );
        }

        if (this.state.top !== prevState.top) {
            Animated.timing(this.verticalAnim, {
                toValue: 1,
                duration: 670,
                useNativeDriver: true,
            }).start();
        }
    }

    onPress() {
        const { onClick, period } = this.props

        if (onClick) { onClick(period.id); }
    }

    render() {
        const {zoom} = this.context;

        const { startX, endX, period, isActive } = this.props,
            left = startX * zoom,
            width = Math.ceil(endX * zoom - left),
            { top, opacity } = this.state;

        const { r, g, b } = hexToRgb(period.color),
            alpha = isActive ? 1 : 0.57,
            backgroundColor = `rgba(${r}, ${g}, ${b}, ${alpha})`

        const style = {
            left,
            width,
            opacity,
            backgroundColor,
            zIndex: isActive ? 2 : 1,
            transform: [{ translateY: top },]
        };

        return <TouchableHighlight onPress={this.onPress.bind(this)} underlayColor="transparent">
            <Animated.View style={[styles.period, style]}>
                <Text numberOfLines={1} style={[styles.title, styles.dateTitle]}>{period.displayDate}</Text>
                <Text numberOfLines={1} style={[styles.title]}>{period.title}</Text>
            </Animated.View>
        </TouchableHighlight>
    }
}

function hexToRgb(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

Period.contextType = SerifsContext;
