import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import EventPoint from './native-item'
import moment from 'moment';

export const VERTICAL_STEP = 50;
const DEFAULT_OPACITY = 0.6;

type Props = {
    events: Array,
    startDate: number,
    yearPerPixel: number,
    onCoordinatesReady: Function,
    y: number,
};

export default function EventPoints(props: Props) {
    const {events, startDate, yearPerPixel, y, sorted, onRecalculateTimelineEnding, elementsOverAxis, levelLimit} = props;
    const [activeId, setActive] = useState(null);
    const [guard, setGuard] = useState(true);
    const [showActive, setShowActive] = useState(false);

    const [activeOpacity, setActiveOpacity] = useState(0);
    const [activeElementWillChange, setActiveElementWillChange] = useState(false);
    const [opacity, setOpacity] = useState(0);

    const didMountRef = useRef(0);
    const nextActiveId = useRef(null);


    const _coordinates = useRef([]);

    const rerenderWithClickedElement = (id) => {
        if (activeId !== null && activeId !== id) {
            nextActiveId.current = id;
            setActiveOpacity(0);
            setActiveElementWillChange(true);
        } else {
            if (activeId === id) {
                setActiveOpacity(0);
                setShowActive(false);
                setActive(null);
                nextActiveId.current = null
            } else {
                setActive(id);
                setShowActive(true);
            }
        }
    };

    useEffect(() => {
        if (!activeElementWillChange && didMountRef.current > 0) {
            setActive(nextActiveId.current);
            setShowActive(true);
        }
    }, [activeElementWillChange]);


    function activeElementAnimationFinished(first) {
        if (first) {
            setActiveOpacity(1);
        } else {
            setShowActive(false);
            setActive(null);

            setActiveElementWillChange(false);
        }
    }

    useEffect(() => {
        didMountRef.current += 1;
    }, [events]);

    useEffect(() => {
        if (events.some(event => event.yLevel > 0)) {
            setOpacity(DEFAULT_OPACITY)
        }

    }, [events]);

    useEffect(() => {
        setGuard(sorted)
    }, [sorted]);

    useEffect(() => {
        if (!sorted) {
            _coordinates.current = []
        }
    }, [sorted]);


    const _e = useMemo(() => {
        return [...events].sort((a, b) => {
            const pointA = calcEventPoint(a),
                pointB = calcEventPoint(b)
            return ((pointB - startDate) - (pointA - startDate));
        });

    }, [events]);

    useEffect(() => {
        setTimeout(() => {
            activeId && setShowActive(true)
        }, 700)

    }, [_e]);


    const callback = function (data) {
        if (sorted) return;

        _coordinates.current.push(data)
        if (_coordinates.current.length === events.length) {
            if (props.onCoordinatesReady) {
                props.onCoordinatesReady(_coordinates.current)
            }
        }
    }

    const recalculateEndingOfTimeline = useCallback((data) => {
        if (data) {
            onRecalculateTimelineEnding(Math.ceil(((data.xEnd / data.zoom) / yearPerPixel) + startDate));
        }
    }, []);

    const elements = (!sorted && guard ?
        null
        :
        _e
            .map((item, index) => {
                let _point = calcEventPoint(item)
                let x = (_point - startDate) * yearPerPixel;
                let yValue = elementsOverAxis ? (y - (60 * levelLimit)) - (item.yLevel * VERTICAL_STEP) : y - (item.yLevel * VERTICAL_STEP);

                return <EventPoint item={item}
                                   x={x}
                                   y={Number.isNaN(yValue) ? y : yValue}
                                   axisY={y}
                                   isActive={item.id === activeId}
                                   onMount={callback}
                                   clicked={rerenderWithClickedElement}
                                   isLastPoint={item.isLastPoint}
                                   onLastPoint={recalculateEndingOfTimeline}
                                   visible={item.visible}
                                   renderCount={didMountRef.current}
                                   key={index}
                />;
            }));


    return elements
}

const calcEventPoint = (event) => {
    return event.year + (event.month ? (event.month - 1) / 12 : .5) + (event.day ? event.day / (12 * 30) : (.5 / 12))
}
