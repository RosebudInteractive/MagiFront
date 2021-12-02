import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import Themes from './theme';
import Header from './header';
import Footer from './footer';
import TimeAxis from './time-axis';
import Message from '../detail-message';
import './timeline.sass';
import ZoomHandler, { OffsetEnum } from '../helpers/zoom-handler';
import wrap from '../helpers/zoom-container';
import SETTINGS from './settings';
let scrollHandlerGuard = false;
export default function Timeline(props) {
    const { backgroundImage, events, periods, height, levelLimit, visibilityChecking, elementsOverAxis, onFullScreen, onCloseFullScreen, onChangeOrientation, } = props;
    const [fsEnable, setFsEnable] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [zoomSliderStopped, setZoomSliderStopped] = useState(true);
    const [activeItem, setActiveItem] = useState(null);
    const [containerWidth, setContainerWidth] = useState(0);
    const [isVertical, setIsVertical] = useState(false);
    const [activeInViewport, setActiveInViewport] = useState(false);
    const [offsetDefined, setOffsetDefined] = useState(false);
    const horizontalContainerRef = useRef(null);
    const { width } = useResizeDetector({ targetRef: horizontalContainerRef });
    const openFullScreen = () => {
        setFsEnable(true);
        if (onFullScreen)
            onFullScreen();
    };
    const closeFullScreen = () => {
        setFsEnable(false);
        if (onCloseFullScreen)
            onCloseFullScreen();
    };
    const calcOffsetForEvent = (event) => {
        if (horizontalContainerRef.current) {
            const { left } = event;
            const { scrollLeft } = horizontalContainerRef.current;
            return left + SETTINGS.horizontalPadding - scrollLeft;
        }
        return 0;
    };
    const calcOffsetForPeriod = (period) => {
        if (horizontalContainerRef.current) {
            const { left, width: periodWidth } = period;
            const { scrollLeft } = horizontalContainerRef.current;
            let startValue = left + SETTINGS.horizontalPadding - scrollLeft;
            let endValue = startValue + periodWidth;
            if (startValue < 0)
                startValue = 0;
            if (endValue > (width || 0))
                endValue = width || 0;
            return startValue + (endValue - startValue) / 2;
        }
        return 0;
    };
    const calculateOffset = (active) => {
        if (active) {
            switch (active.type) {
                case 'event': return calcOffsetForEvent(active.item);
                case 'period': return calcOffsetForPeriod(active.item);
                default: return 0;
            }
        }
        return 0;
    };
    const defineOffset = (active) => {
        const xValue = calculateOffset(active);
        if (xValue) {
            ZoomHandler.setOffset(xValue);
            setOffsetDefined(true);
            setActiveInViewport(true);
        }
    };
    const adjustActiveItem = () => {
        if (activeItem) {
            scrollHandlerGuard = true;
            if (!offsetDefined)
                defineOffset(activeItem);
            if (activeItem.type === 'event') {
                const newOffset = calculateOffset(activeItem);
                ZoomHandler.adjustForNewOffset(newOffset, zoom);
            }
            else {
                ZoomHandler.adjustForZoom(zoom);
                defineOffset(activeItem);
            }
            setTimeout(() => {
                scrollHandlerGuard = false;
            }, 0);
        }
    };
    // const getEventInViewPort = (item: VisualItem, scrollPosition: number): boolean => {
    //   const { left, width: itemWidth } = item;
    //   const xValue = left + SETTINGS.horizontalPadding - scrollPosition;
    //   return ((xValue + itemWidth) > 0) && (xValue < (width || 0));
    // };
    //
    // const getPeriodInViewPort = (item: VisualItem, scrollPosition: number): boolean => {
    //   const { left, width: itemWidth } = item;
    //   const xValue = left + SETTINGS.horizontalPadding - scrollPosition;
    //   return ((xValue + itemWidth) > 0) && (xValue < (width || 0));
    // };
    //
    // const getActiveItemInViewPort = (scrollPosition: number): boolean => {
    //   if (activeItem) {
    //     switch (activeItem.type) {
    //       case 'event': return getEventInViewPort(activeItem.item, scrollPosition);
    //
    //       case 'period': return calcOffsetForPeriod(activeItem.item);
    //
    //       default: return false;
    //     }
    //   }
    //
    //   return false;
    // }
    const fixActiveItemOffset = (newScrollPosition) => {
        if (activeItem) {
            const { left, width: itemWidth } = activeItem.item;
            const xValue = left + SETTINGS.horizontalPadding - newScrollPosition;
            const visible = ((xValue + itemWidth) > 0) && (xValue < (width || 0));
            if (visible !== activeInViewport) {
                if (!visible) {
                    setOffsetDefined(false);
                    ZoomHandler.setOffset(OffsetEnum.CENTER);
                }
                setActiveInViewport(visible);
            }
            if (visible && !scrollHandlerGuard) {
                if (offsetDefined) {
                    const newOffset = calculateOffset(activeItem);
                    ZoomHandler.setOffset(newOffset);
                }
                else {
                    defineOffset(activeItem);
                }
            }
        }
    };
    const onZoomChange = useCallback((value) => {
        setZoom(value);
    }, []);
    const onZoomSliderStop = useCallback((stopped) => {
        setZoomSliderStopped(stopped);
    }, []);
    const containerHeight = useMemo(() => (height ? height - 6 : 0), [levelLimit, height]);
    const itemClickHandler = useCallback(({ type, id, item }) => {
        if (!activeItem || (activeItem.type !== type) || (activeItem.id !== id)) {
            setActiveItem({ type, id, item });
        }
        defineOffset({ type, id, item });
    }, [activeItem]);
    const messageClose = () => {
        setActiveItem(null);
        setActiveInViewport(false);
        ZoomHandler.setOffset(OffsetEnum.CENTER);
        setOffsetDefined(false);
    };
    useEffect(() => {
        ZoomHandler.setWidth(width || 0);
        setIsVertical(SETTINGS.isVerticalViewport(width || 0));
        if (horizontalContainerRef.current) {
            const { scrollLeft } = horizontalContainerRef.current;
            fixActiveItemOffset(scrollLeft);
        }
    }, [width]);
    // useEffect(() => {
    //   if (!offsetDefined) {
    //     ZoomHandler.setOffset(OffsetEnum.CENTER);
    //   }
    // }, [offsetDefined]);
    useEffect(() => {
        if (horizontalContainerRef.current) {
            ZoomHandler.setContainer(wrap(horizontalContainerRef.current));
            ZoomHandler.setWidth(horizontalContainerRef.current.clientWidth);
            setContainerWidth(horizontalContainerRef.current.clientWidth);
        }
    }, [horizontalContainerRef]);
    // useEffect(() => {
    //   setIsVertical(SETTINGS.isVerticalViewport(containerWidth));
    // }, [containerWidth]);
    useLayoutEffect(() => {
        if (activeItem && activeInViewport) {
            adjustActiveItem();
        }
        else {
            ZoomHandler.adjustForZoom(zoom);
        }
    }, [zoom]);
    const scrollHandler = (e) => {
        // @ts-ignore
        const pos = (e.nativeEvent.target && e.nativeEvent.target.scrollLeft) || 0;
        ZoomHandler.setScrollPosition(pos);
        fixActiveItemOffset(pos);
    };
    const background = useMemo(() => ({
        backgroundImage: `linear-gradient(180deg, #00000070, #00000094), url(${backgroundImage})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
    }), [backgroundImage]);
    const containerStyle = useMemo(() => ({
        height: height,
    }), [height]);
    useEffect(() => {
        if (onChangeOrientation)
            onChangeOrientation(isVertical);
    }, [isVertical]);
    return (<div className={`timeline-wrapper${isVertical ? ' _vertical' : ''}`} style={background}>
      {fsEnable && <Header title="Ключевые события" width="100%"/>}
      <div className="timeline-container" onScroll={scrollHandler} style={containerStyle} ref={horizontalContainerRef}>
        {containerWidth
            && containerHeight
            && (<TimeAxis events={events} periods={periods} width={containerWidth} zoom={zoom} levelLimit={levelLimit} theme={Themes.current} height={containerHeight} elementsOverAxis={elementsOverAxis} zoomSliderStopped={zoomSliderStopped} visibilityChecking={visibilityChecking} onItemClick={itemClickHandler} activeItem={activeItem}/>)}
      </div>
      <Footer onOpenPress={openFullScreen} onClosePress={closeFullScreen} fullScreenMode={fsEnable} zoom={zoom} onSliderStop={onZoomSliderStop} onZoomChange={onZoomChange}/>
      {activeItem
            && (<Message item={activeItem.item} onClose={messageClose} indent={fsEnable ? 49 : 0} pinned={isVertical}/>)}
    </div>);
}
