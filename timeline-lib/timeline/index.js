import React, {useCallback, useEffect, useRef, useState} from 'react'
import {View} from "react-native"
import EventPoints from './event-points';
import Periods from "./periods";
import placeByYLevelLimit from '../helpers/placeByLevel'
import {SerifsContext} from './serifs/context';
import NativeAxis from "./axis"
import {calcDisplayDate, calcEventPointPosition, isArrayEquals} from '../helpers/tools';

export const HORIZONTAL_INDENT = 10;

type Props = {
    width: number,
    height: number,
    events: Array,
    zoom: number,
    periods: Array,
};

const ITEM_MIN_WIDTH = 50,
    STEPS = [1, 2, 5, 10, 25, 50, 100]

export default function TimeAxis(props: Props) {

    const {events, width, height, zoom, periods, levelLimit, zoomSliderStopped, visibilityChecking, elementsOverAxis, isSVGType} = props;

    const [svgWidth, setSvgWidth] = useState(0)
    const [itemWidth, setItemWidth] = useState(0)
    const [serifs, setSerifs] = useState([])
    const [eventsWithCoords, setEventsWithCoords] = useState(events);
    const [lastYearFromLastPoint, setLastYear] = useState(null);

    const zoomRef = useRef(zoom);

    useEffect(() => {
        events.forEach((item) => {
            item.displayDate = calcDisplayDate(item.day, item.month, item.year)
            item.calculatedDate = calcEventPointPosition(item)
            item.yLevel = item.yLevel ? item.yLevel : 0
        })

        if(visibilityChecking){
            calculateVertical();
        } else {
            setEventsWithCoords(events);
        }
    }, [events, periods,]);

    useEffect(() => {
        if (zoomSliderStopped && zoomRef.current !== zoom) {
            zoomRef.current = zoom;

            calculateVerticalWithZoom(zoom)
        }
    }, [zoom, zoomSliderStopped]);

    const calculateVerticalWithZoom = (zoom) => {
        events.forEach((item) => {
            item.xStart = item.left * zoom
            item.xEnd =  item.left * zoom + item.width
            item.yLevel = 0
            item.offset = 0
        })

        const handledEvents = placeByYLevelLimit(events, levelLimit, visibilityChecking);

        setEventsWithCoords(handledEvents);
    }

    function calculateVertical(){
        events.forEach((item) => {
            item.yLevel = 0;
            item.offset = 0;
        });

        const handledEvents = placeByYLevelLimit(events, levelLimit, visibilityChecking);

        setEventsWithCoords(handledEvents);
    }

    let _yearPerPixel = useRef(0),
        _startDate = useRef(null);


    useEffect(() => {
        calculateVertical()
    }, [levelLimit]);

    useEffect(() => {
        const allItems = [...events, ...periods];

        if (allItems.length === 0) return

        let minYear = Math.min(...allItems.map(el => el.year || el.startYear)),
            maxYear = Math.max(...allItems.map(el => el.year || el.endYear));

        minYear = minYear < 0 ? minYear + 1 : minYear;
        maxYear = maxYear < 0 ? maxYear + 1 : maxYear;

        // if(lastYearFromLastPoint && lastYearFromLastPoint > maxYear){
        //     maxYear = lastYearFromLastPoint;
        // }

        const roundedMinYear = Math.floor(minYear / 10) * 10,
            roundedMaxYear = Math.ceil(maxYear / 10) * 10

        const startPoint = (roundedMinYear - roundedMinYear % 10) - HORIZONTAL_INDENT,
            endPoint = (roundedMaxYear + (10 - (roundedMaxYear % 10))) + HORIZONTAL_INDENT;

        let canvasWidth = width * zoom

        let delta = endPoint - startPoint,
            maxItemsCount = canvasWidth / ITEM_MIN_WIDTH,
            itemDelta = delta / maxItemsCount

        let step = STEPS.find(item => item >= itemDelta)

        if (!step) {
            step = STEPS[STEPS.length - 1]
        }

        let itemCount = ~~(delta / (step)),
            itemWidth = canvasWidth / (itemCount)

        let newSerifs = new Array(itemCount + 1)
            .fill(0)
            .map((item, index) => {
                return startPoint + (step * index)
            });

        let svgWidth = canvasWidth
        if (svgWidth < width) svgWidth = width

        setItemWidth(itemWidth)
        if (!isArrayEquals(serifs, newSerifs)) {
            setSerifs(newSerifs)
        }
        setSvgWidth(svgWidth)
        _startDate.current = startPoint
        _yearPerPixel.current = (width) / (endPoint - startPoint)
    }, [width, zoom, events, periods, lastYearFromLastPoint]);

    useEffect(() => {
        setLastYear(null)
    }, [events, periods])

    const _midHeight = height / 2;


    const recalculateTimelineEnding = useCallback((lastPointEndingYear) => {
        setLastYear(lastPointEndingYear)
    }, []);


    function onCoordinatesReady() {
        const {zoom} = props
        calculateVerticalWithZoom(zoom)
    }

    return !!width && !!_yearPerPixel.current && <View style={{width: svgWidth, height:height}}>
        <SerifsContext.Provider value={{x: itemWidth, y: _midHeight, zoom: zoom, svgType: !!isSVGType}}>
            <NativeAxis width={svgWidth} top={_midHeight} serifs={serifs} yearPerPixel={_yearPerPixel.current}/>
            <EventPoints elementsOverAxis={elementsOverAxis}
                         events={eventsWithCoords}
                         startDate={_startDate.current}
                         yearPerPixel={_yearPerPixel.current}
                         y={_midHeight}
                         onCoordinatesReady={onCoordinatesReady}
                         onRecalculateTimelineEnding = {recalculateTimelineEnding}
                         levelLimit={levelLimit}
            />
            <Periods elementsOverAxis={elementsOverAxis} levelLimit={levelLimit}
                     zoom={zoom} startDate={_startDate.current}
                     yearPerPixel={_yearPerPixel.current}
                     y={_midHeight} periods={periods}/>
        </SerifsContext.Provider>
    </View>
}
