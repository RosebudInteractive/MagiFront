import React, { useCallback, useEffect, useRef, useState, } from 'react';
import { View } from 'react-native';
import EventPoints from './event-points';
import PeriodSections from './periods';
import placeByYLevelLimit from '../helpers/placeByLevel';
import SerifsContext from './serifs/context';
import NativeAxis from './axis';
import { calcDisplayDate, calcEventPointPosition, isArrayEquals } from '../helpers/tools';
import { ItemType } from '../types/common';
export const HORIZONTAL_INDENT = 10;
const ITEM_MIN_WIDTH = 50;
const STEPS = [1, 2, 5, 10, 25, 50, 100];
export default function TimeAxis(props) {
    const { events, width, height, zoom, periods, levelLimit, zoomSliderStopped, visibilityChecking, elementsOverAxis, onItemClick, theme, } = props;
    const [svgWidth, setSvgWidth] = useState(0);
    const [itemWidth, setItemWidth] = useState(0);
    const [serifs, setSerifs] = useState([]);
    const [eventsWithCoords, setEventsWithCoords] = useState(events);
    const [lastYearFromLastPoint, setLastYear] = useState(null);
    const [activeItem, setActiveItem] = useState({ type: null, id: null });
    const zoomRef = useRef(zoom);
    function calculateVertical() {
        events.forEach((item) => {
            /* eslint-disable no-param-reassign */
            item.yLevel = 0;
            item.offset = 0;
            /* eslint-enable no-param-reassign */
        });
        // eslint-disable-next-line max-len
        const handledEvents = placeByYLevelLimit(events, levelLimit, visibilityChecking);
        setEventsWithCoords(handledEvents);
    }
    const calculateVerticalWithZoom = (zoomValue) => {
        events.forEach((item) => {
            /* eslint-disable no-param-reassign */
            item.xStart = item.left * zoomValue;
            item.xEnd = item.left * zoomValue + item.width;
            item.yLevel = 0;
            item.offset = 0;
            /* eslint-enable no-param-reassign */
        });
        const handledEvents = placeByYLevelLimit(events, levelLimit, visibilityChecking);
        setEventsWithCoords(handledEvents);
    };
    useEffect(() => {
        events.forEach((item) => {
            /* eslint-disable no-param-reassign */
            item.displayDate = calcDisplayDate(item.day, item.month, item.year, true);
            item.calculatedDate = calcEventPointPosition(item);
            item.yLevel = item.yLevel ? item.yLevel : 0;
            /* eslint-enable no-param-reassign */
        });
        if (visibilityChecking) {
            calculateVertical();
        }
        else {
            setEventsWithCoords(events);
        }
    }, [events, periods]);
    useEffect(() => {
        if (zoomSliderStopped && zoomRef.current !== zoom) {
            zoomRef.current = zoom;
            calculateVerticalWithZoom(zoom);
        }
    }, [zoom, zoomSliderStopped]);
    const yearPerPixel = useRef(0);
    const startDate = useRef(0);
    useEffect(() => {
        calculateVertical();
    }, [levelLimit]);
    useEffect(() => {
        const allItems = [...events, ...periods];
        if (allItems.length === 0)
            return;
        let minYear = Math.min(...allItems.map((el) => el.year || el.startYear || 0));
        let maxYear = Math.max(...allItems.map((el) => el.year || el.endYear || 0));
        minYear = minYear < 0 ? minYear + 1 : minYear;
        maxYear = maxYear < 0 ? maxYear + 1 : maxYear;
        const roundedMinYear = Math.floor(minYear / 10) * 10;
        const roundedMaxYear = Math.ceil(maxYear / 10) * 10;
        const startPoint = (roundedMinYear - (roundedMinYear % 10)) - HORIZONTAL_INDENT;
        const endPoint = (roundedMaxYear + (10 - (roundedMaxYear % 10))) + HORIZONTAL_INDENT;
        const canvasWidth = width * zoom;
        const delta = endPoint - startPoint;
        const maxItemsCount = canvasWidth / ITEM_MIN_WIDTH;
        const itemDelta = delta / maxItemsCount;
        let step = STEPS.find((item) => item >= itemDelta) || 0;
        if (!step) {
            step = STEPS[STEPS.length - 1];
        }
        const itemCount = Math.floor(delta / (step));
        const itemWidthNewValue = canvasWidth / (itemCount);
        const newSerifs = new Array(itemCount + 1)
            .fill(0)
            .map((item, index) => startPoint + (step * index));
        let svgWidthNewValue = canvasWidth;
        if (svgWidthNewValue < width)
            svgWidthNewValue = width;
        setItemWidth(itemWidthNewValue);
        if (!isArrayEquals(serifs, newSerifs)) {
            setSerifs(newSerifs);
        }
        setSvgWidth(svgWidthNewValue);
        startDate.current = startPoint;
        yearPerPixel.current = (width) / (endPoint - startPoint);
    }, [width, zoom, events, periods, lastYearFromLastPoint]);
    useEffect(() => {
        setLastYear(null);
    }, [events, periods]);
    const midHeight = height / 2;
    const recalculateTimelineEnding = useCallback((lastPointEndingYear) => {
        setLastYear(lastPointEndingYear);
    }, []);
    function onCoordinatesReady() {
        calculateVerticalWithZoom(zoom);
    }
    const itemClickHandler = useCallback(({ type, id }) => {
        if ((activeItem.type !== type) || (activeItem.id !== id)) {
            setActiveItem({ type, id });
        }
        if (onItemClick)
            onItemClick({ type, id });
    }, [onItemClick, activeItem]);
    return !!width && !!yearPerPixel.current
        ? (<View style={{ width: svgWidth, height }}>
        <SerifsContext.Provider value={{
                x: itemWidth, y: midHeight, zoom, theme,
            }}>
          <NativeAxis width={svgWidth} top={midHeight} serifs={serifs} yearPerPixel={yearPerPixel.current}/>
          <EventPoints elementsOverAxis={elementsOverAxis} events={eventsWithCoords} startDate={startDate.current} yearPerPixel={yearPerPixel.current} y={midHeight} onCoordinatesReady={onCoordinatesReady} onRecalculateTimelineEnding={recalculateTimelineEnding} levelLimit={levelLimit} activeItem={activeItem.type === ItemType.Event ? activeItem.id : null} onItemClick={itemClickHandler}/>
          <PeriodSections elementsOverAxis={elementsOverAxis} levelLimit={levelLimit} startDate={startDate.current} yearPerPixel={yearPerPixel.current} y={midHeight} periods={periods} activeItem={activeItem.type === ItemType.Period ? activeItem.id : null} onItemClick={itemClickHandler}/>
        </SerifsContext.Provider>
      </View>)
        : null;
}