import React from 'react';
import {Animated, StyleSheet, Text} from 'react-native';
import {SerifsContext} from "timeline/timeline/serifs/context";

type Props = {
    y: number,
    startX: number,
    endX: number,
    color: string,
    opacity: number,
    opacityHalf: number,
    id: number,
    date: string,
    title: string,
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

    render() {
        const {zoom} = this.context;

        const {startX, endX, color, id} = this.props,
            _xStart = startX * zoom,
            _xEnd = endX * zoom,
            _blockWidth = Math.ceil(_xEnd - _xStart),

            {top, opacity, dateText, titleText} = this.state;

        const _color = hexToRgb(color),
            _rgba=`rgba(${_color.r}, ${_color.g}, ${_color.b}, 0.57)`

        const _style = {
            left: _xStart,
            backgroundColor: _rgba,
            opacity: opacity,
            width: _blockWidth,
            transform: [{ translateY: top },]
        };

        return <Animated.View style={[styles.period, _style]}>
            <Text numberOfLines={1} style={[styles.title, styles.dateTitle]}>{dateText}</Text>
            <Text numberOfLines={1} style={[styles.title]}>{titleText}</Text>
        </Animated.View>;
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

const styles = StyleSheet.create({
    period: {
        position: 'absolute',
        borderRadius: 4,
        flexDirection: "row",
        overflow: "hidden",
        height: 24,
        justifyContent: "flex-start",
        alignItems: "center",
    },
    title: {
        color: "white",
        fontFamily: "Fira Sans",
        fontWeight: "400",
        fontSize: 10,
    },
    dateTitle: {
        opacity: 0.57,
        marginHorizontal: 8,
    }
});

Period.contextType = SerifsContext;
