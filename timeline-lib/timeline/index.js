import React, {useCallback, useEffect, useRef, useState} from 'react'
import {View} from "react-native"
import EventPoints from './event-points';
import Periods from "./periods";
import placeByYLevelLimit from '../helpers/placeByLevel'
import {SerifsContext} from './serifs/context';
import NativeAxis from "./axis"
import {calcEventPointPosition, isArrayEquals} from '../helpers/tools';

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
            item.displayDate = `${item.day ? item.day + "." : ""}${item.month ? item.month + "." : ""}${item.year}`
            item.calculatedDate = calcEventPointPosition(item)
            item.yLevel = item.yLevel ? item.yLevel : 0
        })

        if(visibilityChecking){
            calculateVertical();
        } else {
            setEventsWithCoords(events);
        }
    }, [events]);

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

        // if(lastYearFromLastPoint && lastYearFromLastPoint > maxYear){
        //     maxYear = lastYearFromLastPoint;
        // }

        const _startPoint = (minYear - minYear % 10) - HORIZONTAL_INDENT,
            _endPoint = (maxYear + (10 - (maxYear % 10))) + HORIZONTAL_INDENT;
        let _canvasWidth = width * zoom

        let _delta = _endPoint - _startPoint,
            _maxItemsCount = _canvasWidth / ITEM_MIN_WIDTH,
            _itemDelta = _delta / _maxItemsCount

        let _step = STEPS.find(item => item >= _itemDelta)

        if (!_step) {
            _step = STEPS[STEPS.length - 1]
        }

        let itemCount = ~~(_delta / (_step)),
            itemWidth = _canvasWidth / (itemCount)

        let _serifs = new Array(itemCount + 1).fill(0).map((item, index) => {
            return _startPoint + (_step * index)
        });

        let svgWidth = _canvasWidth
        if (svgWidth < width) svgWidth = width

        setItemWidth(itemWidth)
        if (!isArrayEquals(serifs, _serifs)) {
            setSerifs(_serifs)
        }
        setSvgWidth(svgWidth)
        _startDate.current = _startPoint
        _yearPerPixel.current = (width) / (_endPoint - _startPoint)
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
            <NativeAxis width={svgWidth} top={_midHeight} serifs={serifs}/>
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
