import React, { useCallback, useEffect, useMemo, useRef, useState, } from 'react';
import { View } from 'react-native';
import EventPoints from './event-points';
import PeriodSections from './periods';
import placeByYLevelLimit from '../../helpers/placeByLevel';
import SerifsContext from './serifs/context';
import NativeAxis from './axis';
import { calcDisplayDate, calcEventPointPosition, isArrayEquals } from '../../helpers/tools';
import { ItemType } from '../../types/common';
const ITEM_MIN_WIDTH = 50;
const STEPS = [1, 2, 5, 10, 25, 50, 100];
export default function TimeAxis(props) {
    const { events, width, height, zoom, periods, levelLimit, zoomSliderStopped, visibilityChecking, elementsOverAxis, onItemClick, theme, } = props;
    const [svgWidth, setSvgWidth] = useState(0);
    const [itemWidth, setItemWidth] = useState(0);
    const [serifs, setSerifs] = useState([]);
    const [eventsWithCoords, setEventsWithCoords] = useState(events);
    const [lastYearFromLastPoint, setLastYear] = useState(null);
    const [activeItem, setActiveItem] = useState({ type: null, id: null, item: null });
    const [myLevelLimit, setMyLevelLimit] = useState(null);
    const viewPort = useRef(null);
    const zoomRef = useRef(zoom);

    function calculateVertical() {
        events.forEach((item) => {
            /* eslint-disable no-param-reassign */
            item.yLevel = 0;
            item.offset = 0;
            /* eslint-enable no-param-reassign */
        });
        // eslint-disable-next-line max-len
        const { items: handledEvents, levelsCount } = placeByYLevelLimit(events, levelLimit.events, visibilityChecking);
        setEventsWithCoords(handledEvents);
        if (!myLevelLimit || (myLevelLimit.events !== levelsCount)) {
            const newValue = myLevelLimit
                ? { ...myLevelLimit, events: levelsCount }
                : { periods: 0, events: levelsCount };
            setMyLevelLimit(newValue);
        }
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
        const { items: handledEvents, levelsCount } = placeByYLevelLimit(events, levelLimit.events, visibilityChecking);
        setEventsWithCoords(handledEvents);
        if (!myLevelLimit || (myLevelLimit.events !== levelsCount)) {
            const newValue = myLevelLimit
                ? { ...myLevelLimit, events: levelsCount }
                : { periods: 0, events: levelsCount };
            setMyLevelLimit(newValue);
        }
    };
    const setPeriodsLevelsCount = (levelsCount) => {
        if (!myLevelLimit || (myLevelLimit.periods !== levelsCount)) {
            const newValue = myLevelLimit
                ? {...myLevelLimit, periods: levelsCount}
                : {events: 0, periods: levelsCount};

            console.log(newValue);

            setMyLevelLimit(newValue);
        }
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
        setMyLevelLimit({ ...levelLimit });
        calculateVertical();
    }, [levelLimit]);
    const viewPortHeight = useMemo(() => {
        const need = myLevelLimit
            ? (myLevelLimit.events * 50 + myLevelLimit.periods * 30 + 111)
            : 0;

        console.log(need, height);

        return need > (height - 6) ? need : (height - 6);
    }, [height, myLevelLimit]);
    useEffect(() => {
        const OFFSET = 20;
        const allItems = [...events, ...periods];
        if (allItems.length === 0)
            return;
        let minYear = Math.min(...allItems.map((el) => el.year || el.startYear || 0));
        let maxYear = Math.max(...allItems.map((el) => el.year || el.endYear || 0));
        minYear = minYear < 0 ? minYear + 1 : minYear;
        maxYear = maxYear < 0 ? maxYear + 1 : maxYear;
        const canvasWidth = (width - 2 * OFFSET) * zoom;
        let delta = maxYear - minYear;
        const maxItemsCount = canvasWidth / ITEM_MIN_WIDTH;
        const itemDelta = delta / maxItemsCount;
        let step = STEPS.find((item) => item >= itemDelta) || 0;
        if (!step) {
            step = STEPS[STEPS.length - 1];
        }
        const roundedMinYear = Math.floor(minYear / step) * step;
        const roundedMaxYear = Math.ceil(maxYear / step) * step;
        delta = roundedMaxYear - roundedMinYear;
        const itemCount = Math.floor(delta / (step));
        const itemWidthNewValue = canvasWidth / (itemCount);
        const newSerifs = new Array(itemCount + 1)
            .fill(0)
            // .map((item, index) => startPoint + (step * index));
            .map((item, index) => roundedMinYear + (step * index));
        let svgWidthNewValue = canvasWidth;
        if (svgWidthNewValue < width)
            svgWidthNewValue = width;
        setItemWidth(itemWidthNewValue);
        if (!isArrayEquals(serifs, newSerifs)) {
            setSerifs(newSerifs);
        }
        setSvgWidth(svgWidthNewValue);
        // startDate.current = startPoint;
        startDate.current = roundedMinYear;
        // yearPerPixel.current = (width) / (endPoint - startPoint);
        yearPerPixel.current = (width - 2 * OFFSET) / (roundedMaxYear - roundedMinYear);
    }, [width, zoom, events, periods, lastYearFromLastPoint]);
    useEffect(() => {
        setLastYear(null);
    }, [events, periods]);
    const midHeight = useMemo(() => {
        const value = viewPortHeight - ((myLevelLimit && myLevelLimit.periods) || 0) * 30 - 75;

        console.log("midHeight", value, myLevelLimit);

        return value;
    }, [viewPortHeight, myLevelLimit])

    const recalculateTimelineEnding = useCallback((lastPointEndingYear) => {
        setLastYear(lastPointEndingYear);
    }, [viewPortHeight, myLevelLimit]);
    function onCoordinatesReady() {
        calculateVerticalWithZoom(zoom);
    }
    const itemClickHandler = useCallback(({ type, id, item }) => {
        if ((activeItem.type !== type) || (activeItem.id !== id)) {
            setActiveItem({ type, id, item });
        }
        if (onItemClick)
            onItemClick({ type, id, item });
    }, [onItemClick, activeItem]);
    return !!width && !!yearPerPixel.current && !!myLevelLimit
        ? (<View style={{ width: svgWidth + 40, height: viewPortHeight }} ref={viewPort}>
        <SerifsContext.Provider value={{
                x: itemWidth, y: midHeight, zoom, theme,
            }}>
          <NativeAxis width={svgWidth + 40} top={midHeight} serifs={serifs} yearPerPixel={yearPerPixel.current}/>
          <EventPoints elementsOverAxis={elementsOverAxis} events={eventsWithCoords} startDate={startDate.current} yearPerPixel={yearPerPixel.current} y={midHeight} onCoordinatesReady={onCoordinatesReady} onRecalculateTimelineEnding={recalculateTimelineEnding} levelLimit={myLevelLimit.events} activeItem={activeItem.type === ItemType.Event ? activeItem.id : null} onItemClick={itemClickHandler}/>
          <PeriodSections elementsOverAxis={elementsOverAxis} levelLimit={myLevelLimit.periods} startDate={startDate.current} yearPerPixel={yearPerPixel.current} y={midHeight} periods={periods} activeItem={activeItem.type === ItemType.Period ? activeItem.id : null} onItemClick={itemClickHandler} onSetLevelsCount={setPeriodsLevelsCount}/>
        </SerifsContext.Provider>
      </View>)
        : null;
}
