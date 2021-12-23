import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import EventPoint from './item';
import { VERTICAL_STEP } from '../../../helpers/tools';
import { Event } from '../../../types/event';
import { ItemType } from '../../../types/common';
import isEventsEqual from './is-events-equal';

type Props = {
  events: Event.VisualItem[],
  startDate: number,
  elementsOverAxis: boolean,
  yearPerPixel: number,
  y: number,
  zoom: number,
  onCoordinatesReady: Function,
  // todo : возможно это надо убрать
  onRecalculateTimelineEnding: Function,
  levelLimit: number,
  activeItem: number | null,
  onItemClick: Function,
};

// eslint-disable-next-line react/function-component-definition
export default function EventPoints(props: Props): JSX.Element | null {
  const {
    events, startDate, yearPerPixel, y, onRecalculateTimelineEnding, elementsOverAxis, levelLimit,
    onItemClick, activeItem, zoom,
  } = props;
  const [visible, setVisible] = useState(true);

  const renderedEvents = useRef<Event.VisualItem[]>([]);
  const coordinates = useRef<number[]>([]);

  const onClickedElement = (item: Event.VisualItem) => {
    if (onItemClick) { onItemClick({ type: ItemType.Event, id: item.id, item }); }
  };

  useEffect(() => {
    if (!visible) setVisible(true);
  }, [visible]);

  useEffect(() => {
    if (!isEventsEqual(renderedEvents.current, events)) {
      renderedEvents.current = [...events];
      coordinates.current = [];
      setVisible(false);
    }
  }, [events]);

  useEffect(() => {
    // todo: надо сделать удаление эвента при unmount, но пока и так работает. Костыль!
    coordinates.current = [];
  }, [yearPerPixel]);

  function onMountCallback(itemId: number) {
    const { onCoordinatesReady } = props;
    coordinates.current.push(itemId);
    if (coordinates.current.length === events.length) {
      if (onCoordinatesReady) {
        onCoordinatesReady(coordinates.current);
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

    return (
      <EventPoint
        item={item}
        visible={item.visible}
        level={item.yLevel}
        x={x}
        y={yValue - 50}
        axisY={y}
        isActive={isActive}
        /* eslint-disable-next-line react/jsx-no-bind */
        onMount={onMountCallback}
        onClick={onClickedElement}
        onLastPoint={recalculateEndingOfTimeline}
        zIndex={zIndex}
        index={index}
        key={item.id}
      />
    );
  }), [events, activeItem, yearPerPixel, y, zoom]);

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return visible ? <>{renderElements}</> : null;
}
