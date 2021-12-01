import React, { useCallback, useEffect, useMemo, useRef, useState, } from 'react';
import EventPoint from './item';
import { VERTICAL_STEP } from '../../../helpers/tools';
import { ItemType } from '../../../types/common';
import isEventsEqual from './is-events-equal';
export default function EventPoints(props) {
    const { events, startDate, yearPerPixel, y, onRecalculateTimelineEnding, elementsOverAxis, levelLimit, onItemClick, activeItem, zoom, } = props;
    const [visible, setVisible] = useState(true);
    const renderedEvents = useRef([]);
    const coordinates = useRef([]);
    const onClickedElement = (item) => {
        if (onItemClick) {
            onItemClick({ type: ItemType.Event, id: item.id, item });
        }
    };
    useEffect(() => {
        if (!visible)
            setVisible(true);
    }, [visible]);
    useEffect(() => {
        if (!isEventsEqual(renderedEvents.current, events)) {
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
        const x = (item.calculatedDate - startDate) * yearPerPixel * zoom;
        const yValue = elementsOverAxis
            ? (y - (60 * levelLimit)) - (item.yLevel * VERTICAL_STEP)
            : y - (item.yLevel * VERTICAL_STEP);
        const isActive = item.id === activeItem;
        const zIndex = isActive ? events.length : events.length - index - 1;
        // eslint-disable-next-line no-param-reassign
        item.left = x;
        return (<EventPoint item={item} visible={item.visible} level={item.yLevel} x={x} y={yValue - 50} axisY={y} isActive={isActive} onMount={onMountCallback} onClick={onClickedElement} onLastPoint={recalculateEndingOfTimeline} zIndex={zIndex} index={index} key={item.id}/>);
    }), [events, activeItem, yearPerPixel, y, zoom]);
    return visible ? <React.Fragment>{renderElements}</React.Fragment> : null;
}
