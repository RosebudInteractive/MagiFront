import React from 'react';
import {Animated, View, Text, StyleSheet} from 'react-native';
import {SerifsContext} from '../serifs/context';
// import {LinearGradient} from "react-native-svg";

type Props = {
    item: Object,
    onMount?: Function,
    x: number,
    y: number,
    visible: boolean,
    isActive: boolean,
    zoom: number,
    isLastPoint: boolean,
    onLastPoint?: Function,
    opacity: number
};

const FOOTER_HEIGHT = 40,
    MAX_WIDTH = 141;

export default class EventPoint extends React.Component {
    constructor(props: Props) {
        super(props);

        this.opacityAnim = new Animated.Value(0);
        this.verticalAnim = new Animated.Value(props.y);

        this.verticalAnim.addListener(({value}) => {
            this.setHeight(value)
        });

        this.state = {
            width: MAX_WIDTH,
            needMask: false,
            tooltipTitle: props.item ? props.item.name : '',

            opacity: this.opacityAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1],
            }),
        };

        this._wrapper = React.createRef();
        this._flagpole = React.createRef();
    }

    setHeight(value) {
        const _top = value - FOOTER_HEIGHT;

        if (this._wrapper && this._wrapper.current) {
            this._wrapper.current.setNativeProps({style: {top: _top}});
        }

        if (this._flagpole && this._flagpole.current) {
            this._flagpole.current.setNativeProps({style: {height: this.props.axisY - _top - 18}});
        }
    }

    componentDidUpdate(prevProps, prevState) {
        const {visible, y} = this.props;

        if (prevProps.visible !== visible) {
            this.opacityAnim = new Animated.Value(0);

            const _oldValue = prevProps.visible ? 1 : 0,
                _newValue = visible ? 1 : 0;

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
            Animated.timing(this.verticalAnim, {
                toValue: y,
                duration: 670,
                useNativeDriver: true,
            }).start();
        }
    }

    componentDidMount() {
        const {zoom} = this.context;
        const {item, onMount, x, visible, y} = this.props;

        if (onMount) {
            const _x = x * zoom;
            onMount({xStart: _x, xEnd: _x + MAX_WIDTH, id: item.id, yLevel: 0, visible: visible});
        }

        this.handleLastPoint();
    }

    handleLastPoint() {
        const {zoom} = this.context;
        const {isLastPoint, onLastPoint, item, x} = this.props,
            {width} = this.state,
            _x = x * zoom;

        if (isLastPoint && onLastPoint) {
            onLastPoint({
                width: width,
                _width: width,
                _x: _x,
                x: x,
                title: item.name,
                date: item.date,
                xStart: _x,
                xEnd: _x + width,
                zoom: zoom,
            });
        }
    }

    rerenderComponent() {
        if (this.props.clicked) {
            this.props.clicked(this.props.item.id);
        }
    }

    onLayout(data) {
        if (data.width >= 125) {
            this.setState({
                needMask: true
            })
        }
    }

    render() {
        const {zoom} = this.context;

        const {isActive, x, y, item, axisY} = this.props,
            {width} = this.state,
            _x = x * zoom,
            {opacity, needMask} = this.state;

        const _wrapperStyle = {
                left: _x,
                maxWidth: MAX_WIDTH,
                opacity: opacity,
                top: y - FOOTER_HEIGHT,
            },
            eventStyle = {
                backgroundColor: item.color,
            },
            flagpoleStyle = {
                backgroundColor: item.color,
                height: axisY - (y - FOOTER_HEIGHT) - 18
            };


        return <Animated.View style={[styles.wrapper, _wrapperStyle]} ref={this._wrapper}>
            <View style={[styles.event, eventStyle]}>
                <Text numberOfLines={1} style={styles.title} onLayout={(event) => { this.onLayout(event.nativeEvent.layout) }}>{item.name}</Text>
                {/*{needMask && <LinearGradient style={styles.mask} colors={['#f00', '#0f0']}/>}*/}
            </View>
            <Text numberOfLines={1} style={[styles.title, styles.date]}>
                {item.date}
            </Text>
            <View style={[styles.flagpole, flagpoleStyle]} ref={this._flagpole}/>
        </Animated.View>;
    }
}

EventPoint.contextType = SerifsContext;

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
    },
    event: {
        height: 18,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        borderTopLeftRadius: 4,
        borderBottomRightRadius: 4,
        paddingHorizontal: 8,
        opacity: 0.57,
        cursor: 'pointer',
    },
    mask: {
        top: 0,
        height: 18,
        left: 4,
    },
    title: {
        color: 'white',
        fontFamily: 'Fira Sans',
        fontWeight: '400',
        fontSize: 10,
        lineHeight: 18,
        width: 'auto',
    },
    date: {
        // marginTop: 2,
        marginLeft: 8,
        opacity: 0.57,
    },
    flagpole: {
        position: 'absolute',
        width: 1,
        left: 0,
        top: 18,
        bottom: 0,
        height: '100%',
        opacity: 0.57,
    },
});
