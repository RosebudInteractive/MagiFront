import React, { useCallback, useEffect, useMemo, useRef, useState, } from 'react';
import EventPoint from './item';
import { isArrayEquals, VERTICAL_STEP } from '../../helpers/tools';
import { ItemType } from '../../types/common';
export default function EventPoints(props) {
    const { events, startDate, yearPerPixel, y, onRecalculateTimelineEnding, elementsOverAxis, levelLimit, onItemClick, activeItem, } = props;
    const [visible, setVisible] = useState(true);
    const renderedEvents = useRef([]);
    const coordinates = useRef([]);
    const onClickedElement = (id) => {
        if (onItemClick) {
            onItemClick({ type: ItemType.Event, id });
        }
    };
    useEffect(() => {
        if (!visible)
            setVisible(true);
    }, [visible]);
    useEffect(() => {
        if (!isArrayEquals(renderedEvents.current, events)) {
            renderedEvents.current = [...events];
            coordinates.current = [];
            setVisible(false);
        }
    }, [events]);
    function onMountCallback(itemId) {
        coordinates.current.push(itemId);
        if (coordinates.current.length === events.length) {
            if (props.onCoordinatesReady) {
                props.onCoordinatesReady(coordinates.current);
            }
        }
    }
    const recalculateEndingOfTimeline = useCallback((data) => {
        if (data) {
            onRecalculateTimelineEnding(Math.ceil(((data.xEnd / data.zoom) / yearPerPixel) + startDate));
        }
    }, []);
    const renderElements = useMemo(() => events.map((item, index) => {
        const x = (item.calculatedDate - startDate) * yearPerPixel;
        const yValue = elementsOverAxis
            ? (y - (60 * levelLimit)) - (item.yLevel * VERTICAL_STEP)
            : y - (item.yLevel * VERTICAL_STEP);
        const isActive = item.id === activeItem;
        const zIndex = isActive ? events.length : events.length - index - 1;
        return (<EventPoint item={item} visible={item.visible} level={item.yLevel} x={x} y={yValue - 50} axisY={y} isActive={isActive} onMount={onMountCallback} onClick={onClickedElement} onLastPoint={recalculateEndingOfTimeline} zIndex={zIndex} index={index} key={item.id}/>);
    }), [events, activeItem, yearPerPixel]);
    return visible ? <React.Fragment>{renderElements}</React.Fragment> : null;
}
