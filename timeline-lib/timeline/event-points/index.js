import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import EventPoint from './native-item'
import {Event} from "../../types/event";
import {isArrayEquals, VERTICAL_STEP} from "../../helpers/tools";

const DEFAULT_OPACITY = 0.6;

type Props = {
    events: Array,
    startDate: number,
    yearPerPixel: number,
    onCoordinatesReady: Function,
    y: number,
};

export default function EventPoints(props: Props) {
    const {events, startDate, yearPerPixel, y, onRecalculateTimelineEnding, elementsOverAxis, levelLimit} = props;
    const [activeId, setActive] = useState(null);
    const [visible, setVisible] = useState(true);

    const renderedEvents = useRef([])
    const coordinates = useRef([]);

    const onClickedElement = (id) => {
        if (activeId !== id) { setActive(id); }
    };

    useEffect(() => {
        if (!visible) setVisible(true)
    }, [visible]);

    useEffect(() => {
        if (!isArrayEquals(renderedEvents.current, events)) {
            renderedEvents.current = [...events]
            coordinates.current = []
            setVisible(false)
        }
    }, [events]);


    const onMountCallback = function (data) {
        coordinates.current.push(data)
        if (coordinates.current.length === events.length) {
            if (props.onCoordinatesReady) {
                props.onCoordinatesReady(coordinates.current)
            }
        }
    }

    const recalculateEndingOfTimeline = useCallback((data) => {
        if (data) {
            onRecalculateTimelineEnding(Math.ceil(((data.xEnd / data.zoom) / yearPerPixel) + startDate));
        }
    }, []);

    const renderElements = useMemo(() => {
        return events.map((item: Event, index) => {
            const x = (item.calculatedDate - startDate) * yearPerPixel,
                yValue = elementsOverAxis ? (y - (60 * levelLimit)) - (item.yLevel * VERTICAL_STEP) : y - (item.yLevel * VERTICAL_STEP),
                isActive = item.id === activeId,
                zIndex = isActive ? events.length : events.length - index - 1;

            return <EventPoint item={item}
                               visible={item.visible}
                               level={item.yLevel}
                               x={x}
                               y={yValue - 50}
                               axisY={y}
                               isActive={isActive}
                               onMount={onMountCallback}
                               onClick={onClickedElement}
                               onLastPoint={recalculateEndingOfTimeline}
                               zIndex={zIndex}
                               key={index}
            />;
        })
    }, [events, activeId])

    return visible && renderElements
}

