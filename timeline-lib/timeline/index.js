import React, {useCallback, useEffect, useRef, useState} from 'react'
import {throttle} from 'lodash'
import {View} from "react-native"
import EventPoints from './event-points';
import Periods from "./periods";
import placeByYLevelLimit from '../helpers/placeByLevel'
import {SerifsContext} from './serifs/context';
import {NativeAxis} from "./axis"

export const HORIZONTAL_INDENT = 10;

const SCALE = 1;

type Props = {
    width: number,
    height: number,
    events: Array,
    zoom: number,
    periods: Array,
};

const ITEM_MIN_WIDTH = 50,
    STEPS = [1, 2, 5, 10, 25, 50, 100]

let LIMIT = 0

export default function TimeAxis(props: Props) {

    const {events, width, height, zoom, periods, levelLimit,
        zoomSliderStopped, visibilityChecking, elementsOverAxis, isSVGType} = props;

    const [svgWidth, setSvgWidth] = useState(0)
    const [itemWidth, setItemWidth] = useState(0)
    const [serifs, setSerifs] = useState([])
    const [eventsWithCoords, setEventsWithCoords] = useState(events);
    const [sorted, setSorted] = useState(false);
    const [calculating, setCalculating] = useState(false);
    const [lastYearFromLastPoint, setLastYear] = useState(null);

    const didMountRef = useRef(0);
    const zoomRef = useRef(zoom);
    const zoomChangedCount = useRef(0);

    const throttledCallback = throttle(function(array){

        setCalculating(true);
        array.map(x => {
            x.yLevel = 0;
            x.offset = 0;
            return x;
        });
        const items = placeByYLevelLimit(array, LIMIT, visibilityChecking);

        if (items && items.length) {
            const alignedEventPoints = events.map(ev => {
                let itemEvent = items.find(itm => itm.id === ev.id);


                ev.xStart = itemEvent.xStart;
                ev.xEnd = itemEvent.xEnd;
                ev.yLevel = itemEvent.yLevel;
                ev.repositioned = itemEvent.repositioned;
                ev.offset = itemEvent.offset;
                return ev;
            });

            setEventsWithCoords(alignedEventPoints);
            setSorted(true);
            setCalculating(false);
        }


        }, 500);

    useEffect(() => {
        if (didMountRef.current > 0) {
            if (zoomSliderStopped && zoomRef.current !== zoom) {
                zoomRef.current = zoom;
                zoomChangedCount.current += 1;
                setSorted(false);
            }
        } else {
            didMountRef.current += 1;
        }

    }, [zoom, zoomSliderStopped]);

    useEffect(() => {
        LIMIT = levelLimit
    }, [levelLimit]);

    let _yearPerPixel = useRef(0),
        _startDate = useRef(null);

    useEffect(() => {
        const eventsWithYearNumber = events.map(ev => {
            ev.startDateYearNumber = new Date((ev.date).split('.')[2]).getFullYear();
            return ev;
        });

        const maxYear = Math.max(...eventsWithYearNumber.map(ev => ev.startDateYearNumber));
        let countLastPoints = 0;

        const resultEventsWithLastEvent = eventsWithYearNumber.map(x => {

            if(x.startDateYearNumber === maxYear && countLastPoints === 0){
                x.isLastPoint = true;
                countLastPoints += 1;
            }
            return x;
        });

        if(visibilityChecking){
            calculateVertical(resultEventsWithLastEvent, levelLimit,true, visibilityChecking);
        } else {
            setEventsWithCoords(resultEventsWithLastEvent);
        }

        didMountRef.current += 1;
    }, [events]);

    function calculateVertical(arr, lvlLim, nullify = false, checkVisibility = true){
        if(nullify){
            arr.map(x => {
                x.yLevel = 0;
                x.offset = 0;
                return x;
            });
        }

        const items = placeByYLevelLimit(arr, lvlLim, checkVisibility);

        if (items && items.length) {
            const alignedEventPoints = events.map(ev => {
                let itemEvent = items.find(itm => itm.id === ev.id);
                ev.xStart = itemEvent.xStart;
                ev.xEnd = itemEvent.xEnd;
                ev.yLevel = itemEvent.yLevel;
                ev.repositioned = itemEvent.repositioned;
                ev.offset = itemEvent.offset;
                return ev;
            });

            setEventsWithCoords(alignedEventPoints);
        }
    }


    useEffect(() => {
        if (eventsWithCoords.length > 0) {
            eventsWithCoords.map(x => {
                x.yLevel = 0;
                x.offset = 0;
                return x;
            });
            const eventItems = placeByYLevelLimit(eventsWithCoords, levelLimit, visibilityChecking);

            if (sorted && eventItems && eventItems.length) {
                const alignedEventPoints = eventsWithCoords.map(ev => {
                    let itemEvent = eventItems.find(itm => itm.id === ev.id);
                    ev.xStart = itemEvent.xStart;
                    ev.xEnd = itemEvent.xEnd;
                    ev.yLevel = itemEvent.yLevel;
                    ev.repositioned = itemEvent.repositioned;
                    ev.offset = itemEvent.offset;
                    return ev;

                });
                setEventsWithCoords(alignedEventPoints);
            }
        }
    }, [levelLimit]);


    useEffect(() => {
        const allItems = [...events, ...periods];
        let minYear = Math.min(allItems.map(el => el.year || el.startYear)),
            maxYear = Math.max(allItems.map(el => el.year || el.endYear));
        // let minYear = Math.min(...allItems.map(el => new Date((el.date || el.startDate).split('.')[2]).getFullYear())),
        //     maxYear = Math.max(...allItems.map(el => new Date((el.date || el.endDate).split('.')[2]).getFullYear()));

        if(lastYearFromLastPoint && lastYearFromLastPoint > maxYear){
            maxYear = lastYearFromLastPoint;
        }

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
        if (serifs.length !== _serifs.length) {
            setSerifs(_serifs)
        }
        setSvgWidth(svgWidth)
        _startDate.current = _startPoint
        _yearPerPixel.current = (width) / (_endPoint - _startPoint)
    }, [width, zoom, events, lastYearFromLastPoint]);

    const _midHeight = height / 2;


    const recalculateTimelineEnding = useCallback((lastPointEndingYear) => {
        setLastYear(lastPointEndingYear)
    });


    function onCoordinatesReady(array) {
        if (!calculating) {
            throttledCallback(array);
        }
    }

    return !!width && !!_yearPerPixel.current && <View style={{width: svgWidth, height:height}}>
        <SerifsContext.Provider value={{x: itemWidth, y: _midHeight, zoom: zoom, svgType: !!isSVGType}}>
            <NativeAxis width={svgWidth} top={_midHeight} serifs={serifs}/>
            <EventPoints elementsOverAxis={elementsOverAxis}
                         events={eventsWithCoords}
                         startDate={_startDate.current}
                         yearPerPixel={_yearPerPixel.current}
                         y={_midHeight}
                         sorted={sorted}
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

