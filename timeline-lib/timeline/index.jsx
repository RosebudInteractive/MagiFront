import React, {useCallback, useMemo, useRef, useState,} from 'react';
import { ScrollView, View, } from 'react-native';
import styles from './styles';
import Themes from './theme';
import Header from './header';
import Footer from './footer';
import TimeAxis from './time-axis';
import Message from '../detail-message';
export default function Timeline(props) {
    const { backgroundImage, events, periods, levelLimit, visibilityChecking, elementsOverAxis, height, onFullScreen, onCloseFullScreen } = props;
    const [fsEnable, setFsEnable] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [zoomSliderStopped, setZoomSliderStopped] = useState(true);
    const [activeItem, setActiveItem] = useState(null);
    const [containerWidth, setContainerWidth] = useState(0);
    const horizontalContainerRef = useRef(null);

    const openFullScreen = () => {
        setFsEnable(true);
        if (onFullScreen) onFullScreen()
    };

    const closeFullScreen = () => {
        setFsEnable(false);
        if (onCloseFullScreen) onCloseFullScreen()
    };

    const onZoomChange = useCallback((value) => {
        setZoom(value);
    }, []);
    const onZoomSliderStop = useCallback((stopped) => {
        setZoomSliderStopped(stopped);
    }, []);
    const containerHeight = useMemo(() => height, [levelLimit, height]);
    // @ts-ignore
    const onItemClick = ({ item }) => {
        setActiveItem(item);
    };
    const messageClose = () => {
        setActiveItem(null);
    };
    const background = useMemo(() => ({
        // @ts-ignore
        backgroundImage: `linear-gradient(180deg, #00000070, #00000094), url(/data/${backgroundImage})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
    }), [backgroundImage]);
    const handleLayout = (e) => {
        setContainerWidth(e.nativeEvent.layout.width - 40);
    };
    const setContainerHeight = () => {
        // eslint-disable-next-line no-console
        // console.log('height', e.nativeEvent.layout.height);
        // setHeight(e.nativeEvent.layout.height);
        // if (e.nativeEvent.layout.width > containerWidth + 40) {
        //   setHeightDelta(7);
        // } else {
        //   setHeightDelta(0);
        // }
        // setHeight(0);
    };

    return (<View style={[styles.mainContainer, background]}>
        {fsEnable && <Header title="Ключевые события" width="100%"/>}
        <ScrollView style={styles.timelineContainer}>
            <ScrollView ref={horizontalContainerRef} directionalLockEnabled={false} onLayout={handleLayout} horizontal
                        style={styles.timeline}>
                <View style={{height: '100%', overflow: 'hidden'}} onLayout={setContainerHeight}>
                    {
                        containerWidth && containerHeight &&
                        <TimeAxis events={events} periods={periods} width={containerWidth} zoom={zoom}
                               levelLimit={levelLimit} theme={Themes.current} height={containerHeight}
                               elementsOverAxis={elementsOverAxis} zoomSliderStopped={zoomSliderStopped}
                               visibilityChecking={visibilityChecking} onItemClick={onItemClick}/>
                    }
                </View>
            </ScrollView>
        </ScrollView>
        <Footer onOpenPress={openFullScreen} onClosePress={closeFullScreen} fullScreenMode={fsEnable} zoom={zoom}
                onSliderStop={onZoomSliderStop} onZoomChange={onZoomChange}/>
        {activeItem
        && <Message item={activeItem} onClose={messageClose} indent={fsEnable ? 49 : 0}/>}
    </View>);
}
