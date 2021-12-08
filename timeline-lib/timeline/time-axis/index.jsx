import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, } from 'react';
import EventPoints from './event-points';
import PeriodSections from './periods';
import placeByYLevelLimit from '../../helpers/placeByLevel';
import SerifsContext from './serifs/context';
import NativeAxis from './axis';
import { calcDisplayDate, calcEventPointPosition, calcPeriodPoints, isArrayEquals, } from '../../helpers/tools';
import { ItemType, } from '../../types/common';
import SETTINGS from '../settings';
const ITEM_MIN_WIDTH = SETTINGS.axis.itemMinWidth;
const STEPS = [1, 2, 5, 10, 25, 50, 100];
export default function TimeAxis(props) {
    const { events, width, height, zoom, periods, levelLimit, zoomSliderStopped, visibilityChecking, elementsOverAxis, onItemClick, theme, activeItem, isDeprecatedBrowser, } = props;
    const [svgWidth, setSvgWidth] = useState(0);
    const [serifs, setSerifs] = useState([]);
    const [eventsWithCoords, setEventsWithCoords] = useState(events);
    const [myLevelLimit, setMyLevelLimit] = useState(null);
    const [needCorrectionOnBC, setNeedCorrectionOnBC] = useState(false);
    const [rightPadding, setRightPadding] = useState(undefined);
    const [workAreaWidth, setWorkAreaWidth] = useState(undefined);
    const [minDate, setMinDate] = useState(undefined);
    const [maxDate, setMaxDate] = useState(undefined);
    const memoPaddingRight = useMemo(() => rightPadding || SETTINGS.horizontalPadding, [rightPadding]);
    // todo: При изменении ширины viewport-а канва НЕ МЕНЯЕТ свой размер
    const axisWidth = useMemo(() => ({
        workArea: (workAreaWidth || width) - SETTINGS.horizontalPadding - memoPaddingRight,
        withPadding: width,
    }), [width, rightPadding, workAreaWidth]);
    const zoomRef = useRef(zoom);
    const pixelsInYear = useMemo(() => {
        if (!minDate || !maxDate)
            return 0;
        const tempWidth = workAreaWidth || width - SETTINGS.horizontalPadding - memoPaddingRight;
        return tempWidth / (maxDate - minDate);
    }, [minDate, maxDate, workAreaWidth, memoPaddingRight]);
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
    const calculateVerticalWithZoom = () => {
        let lastYearCoordinate = 0;
        let right = 0;
        events.forEach((item) => {
            /* eslint-disable no-param-reassign */
            item.xStart = item.left;
            item.xEnd = item.left + item.width;
            item.yLevel = 0;
            item.offset = 0;
            /* eslint-enable no-param-reassign */
            lastYearCoordinate = item.xStart > lastYearCoordinate ? item.xStart : lastYearCoordinate;
            right = item.xEnd > right ? item.xEnd : right;
        });
        const { items: handledEvents, levelsCount } = placeByYLevelLimit(events, levelLimit.events, visibilityChecking);
        setEventsWithCoords(handledEvents);
        const padding = right - lastYearCoordinate;
        setRightPadding(padding > SETTINGS.horizontalPadding
            ? padding + 20
            : SETTINGS.horizontalPadding);
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
                ? { ...myLevelLimit, periods: levelsCount }
                : { events: 0, periods: levelsCount };
            setMyLevelLimit(newValue);
        }
    };
    useEffect(() => {
        events.forEach((item) => {
            /* eslint-disable no-param-reassign */
            item.displayDate = calcDisplayDate(item.day, item.month, item.year, true);
            item.calculatedDate = calcEventPointPosition(item, needCorrectionOnBC);
            item.yLevel = item.yLevel ? item.yLevel : 0;
            /* eslint-enable no-param-reassign */
        });
        if (visibilityChecking) {
            calculateVertical();
        }
        else {
            setEventsWithCoords(events);
        }
        periods.forEach((item) => {
            const { start, end } = calcPeriodPoints(item, needCorrectionOnBC);
            const calculatedStartDate = calcDisplayDate(item.startDay, item.startMonth, item.startYear);
            const calculatedEndDate = calcDisplayDate(item.endDay, item.endMonth, item.endYear);
            /* eslint-disable no-param-reassign */
            item.calculatedDateStart = start;
            item.calculatedDateEnd = end;
            item.displayDate = `${calculatedStartDate} - ${calculatedEndDate}`;
            item.title = item.shortName || item.name;
            /* eslint-enable no-param-reassign */
        });
    }, [events, periods, needCorrectionOnBC]);
    useEffect(() => {
        if (zoomSliderStopped && zoomRef.current !== zoom) {
            zoomRef.current = zoom;
            calculateVerticalWithZoom();
        }
    }, [zoom, zoomSliderStopped]);
    useEffect(() => {
        if (workAreaWidth !== undefined)
            calculateVerticalWithZoom();
    }, [workAreaWidth]);
    const startDate = useRef(0);
    useEffect(() => {
        setMyLevelLimit({ ...levelLimit });
        calculateVertical();
    }, [levelLimit]);
    const viewPortHeight = useMemo(() => {
        const need = myLevelLimit
            ? (myLevelLimit.events * 50 + myLevelLimit.periods * 30 + 111)
            : 0;
        return need > height ? need : height;
    }, [height, myLevelLimit]);
    useLayoutEffect(() => {
        const allItems = [...events, ...periods];
        if (allItems.length === 0)
            return;
        const minYear = Math.min(...allItems.map((el) => el.year || el.startYear || 0));
        const maxYear = Math.max(...allItems.map((el) => el.year || el.endYear || 0));
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const start = Math.min(...allItems.map((el) => el.calculatedDate || el.calculatedDateStart || 0));
        // minYear = minYear < 0 ? minYear + 1 : minYear;
        // maxYear = maxYear < 0 ? maxYear + 1 : maxYear;
        const workWidth = workAreaWidth
            ? workAreaWidth * zoom
            : axisWidth.workArea * zoom;
        let delta = maxYear - minYear;
        const maxItemsCount = workWidth / ITEM_MIN_WIDTH;
        const itemDelta = delta / maxItemsCount;
        let step = STEPS.find((item) => item >= itemDelta) || 0;
        if (!step) {
            step = STEPS[STEPS.length - 1];
        }
        const roundedMinYear = Math.floor(minYear / step) * step;
        const roundedMaxYear = Math.ceil((maxYear + step) / step) * step;
        delta = roundedMaxYear - roundedMinYear;
        const itemCount = Math.ceil(delta / (step));
        // const itemWidthNewValue = canvasWidth / (itemCount);
        const newSerifs = new Array(itemCount)
            .fill(0)
            .map((item, index) => roundedMinYear + (step * index));
        const svgWidthNewValue = workWidth + SETTINGS.horizontalPadding + memoPaddingRight;
        if (!isArrayEquals(serifs, newSerifs)) {
            setSerifs(newSerifs);
        }
        setSvgWidth(svgWidthNewValue);
        startDate.current = start;
        const needBCDelta = (roundedMinYear < 0) && (roundedMaxYear > 0);
        if (needCorrectionOnBC !== needBCDelta) {
            setNeedCorrectionOnBC(needBCDelta);
        }
        // }, [axisWidth, width, zoom, events, periods, lastYearFromLastPoint, myLevelLimit]);
    }, [axisWidth, zoom, events, periods, myLevelLimit, memoPaddingRight]);
    useEffect(() => {
        const allItems = [...events, ...periods];
        if (allItems.length === 0)
            return;
        const minYear = Math.min(...allItems.map((el) => el.year || el.startYear || 0));
        const maxYear = Math.max(...allItems.map((el) => el.year || el.endYear || 0));
        setMinDate(minYear);
        setMaxDate(maxYear);
    }, [events, periods]);
    const midHeight = viewPortHeight - (myLevelLimit && myLevelLimit.periods || 0) * 30 - 75;
    const recalculateTimelineEnding = useCallback(() => {
    }, [viewPortHeight, myLevelLimit]);
    function onCoordinatesReady() {
        calculateVerticalWithZoom();
    }
    useEffect(() => {
        if ((workAreaWidth === undefined) && (rightPadding !== undefined)) {
            const canvasWidth = width < SETTINGS.canvas.minWidth ? SETTINGS.canvas.minWidth : width;
            setWorkAreaWidth(canvasWidth - SETTINGS.horizontalPadding - rightPadding);
        }
    }, [rightPadding]);
    return !!width && !!pixelsInYear && !!myLevelLimit
        ? (<div className="timeline-canvas" style={{
                width: svgWidth,
                height: viewPortHeight,
            }}>
        <SerifsContext.Provider value={{
                needCorrectionOnBC, zoom, theme, isDeprecatedBrowser,
            }}>
          <NativeAxis width={svgWidth} startDate={startDate.current} top={midHeight} serifs={serifs} yearPerPixel={pixelsInYear}/>
          <div className="timeline-canvas__inner" style={{
                marginLeft: SETTINGS.horizontalPadding,
                width: `calc(100% - ${memoPaddingRight + SETTINGS.horizontalPadding}px)`,
            }}>
            <EventPoints elementsOverAxis={elementsOverAxis} events={eventsWithCoords} startDate={startDate.current} yearPerPixel={pixelsInYear} y={midHeight} zoom={zoom} onCoordinatesReady={onCoordinatesReady} onRecalculateTimelineEnding={recalculateTimelineEnding} levelLimit={myLevelLimit.events} activeItem={activeItem && (activeItem.type === ItemType.Event) ? activeItem.id : null} onItemClick={onItemClick}/>
            <PeriodSections elementsOverAxis={elementsOverAxis} levelLimit={myLevelLimit.periods} startDate={startDate.current} yearPerPixel={pixelsInYear} y={midHeight} periods={periods} activeItem={activeItem && (activeItem.type === ItemType.Period) ? activeItem.id : null} onItemClick={onItemClick} onSetLevelsCount={setPeriodsLevelsCount}/>
          </div>
        </SerifsContext.Provider>
      </div>)
        : null;
}
