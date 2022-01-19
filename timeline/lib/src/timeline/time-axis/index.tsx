import React, {
  useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState,
} from 'react';
import EventPoints from './event-points';
import PeriodSections from './periods';
import placeByYLevelLimit from '../../helpers/placeByLevel';
import SerifsContext from './serifs/context';
import NativeAxis from './axis';
import {
  calcDisplayDate, calcEventPointPosition, calcPeriodPoints, isArrayEquals,
} from '../../helpers/tools';
import { Event } from '../../types/event';
import { Period } from '../../types/period';
import {
  ActiveItem, ItemType, LevelLimit,
} from '../../types/common';
import { Theme } from '../../types/theme';
import SETTINGS from '../settings';

declare interface IDateSortable{
  year?: number,
  startYear?: number,
  endYear?: number,
  calculatedDate?: number,
  calculatedDateStart?: number,
  calculatedDateEnd?: number,
}

type Props = {
  theme: Theme,
  width: number,
  // eslint-disable-next-line react/require-default-props
  height: number,
  events: Event.VisualItem[],
  zoom: number,
  periods: Period.VisualItem[],
  levelLimit: LevelLimit,
  zoomSliderStopped: boolean,
  visibilityChecking: boolean,
  elementsOverAxis: boolean,
  onItemClick: Function,
  // eslint-disable-next-line react/no-unused-prop-types,react/require-default-props
  onItemDoubleClick?: Function,
  activeItem: ActiveItem | null;
  isDeprecatedBrowser: boolean;
  minWidth?: number,
};

type AxisWidth = {
  workArea: number,
  withPadding: number,
};

const ITEM_MIN_WIDTH = SETTINGS.axis.itemMinWidth;
const STEPS: number[] = [1, 2, 5, 10, 25, 50, 100];

// eslint-disable-next-line react/function-component-definition
export default function TimeAxis(props: Props): JSX.Element | null {
  const {
    events, width, height, zoom, periods, levelLimit, zoomSliderStopped, visibilityChecking,
    elementsOverAxis, onItemClick, theme, activeItem, isDeprecatedBrowser, minWidth
  } = props;

  const [svgWidth, setSvgWidth] = useState(0);
  const [serifs, setSerifs] = useState<number[]>([]);
  const [eventsWithCoords, setEventsWithCoords] = useState<Event.VisualItem[]>(events);
  const [myLevelLimit, setMyLevelLimit] = useState<LevelLimit | null>(null);
  const [needCorrectionOnBC, setNeedCorrectionOnBC] = useState<boolean>(false);
  const [rightPadding, setRightPadding] = useState<number | undefined>(undefined);
  const [workAreaWidth, setWorkAreaWidth] = useState<number | undefined>(undefined);
  const [minDate, setMinDate] = useState<number | undefined>(undefined);
  const [maxDate, setMaxDate] = useState<number | undefined>(undefined);

  const startDate = useRef<number>(0);

  const memoPaddingRight: number = useMemo(
    () => rightPadding || SETTINGS.horizontalPadding,
    [rightPadding],
  );

  // todo: При изменении ширины viewport-а канва НЕ МЕНЯЕТ свой размер
  const axisWidth: AxisWidth = useMemo(() => ({
    workArea: (workAreaWidth || width) - SETTINGS.horizontalPadding - memoPaddingRight,
    withPadding: width,
  }), [width, rightPadding, workAreaWidth]);

  const zoomRef = useRef(zoom);

  const pixelsInYear = useMemo(() => {
    if (!minDate || !maxDate) return 0;

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

    if (!myLevelLimit || (myLevelLimit?.events !== levelsCount)) {
      const newValue: LevelLimit = myLevelLimit
        ? { ...myLevelLimit, events: levelsCount }
        : { periods: 0, events: levelsCount };

      setMyLevelLimit(newValue);
    }
  }

  const calculateVerticalWithZoom = () => {
    let lastYearCoordinate: number = 0;
    let right: number = 0;

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

    const { items: handledEvents, levelsCount } = placeByYLevelLimit(
      events,
      levelLimit.events,
      visibilityChecking,
    );

    setEventsWithCoords(handledEvents);

    const padding = right - lastYearCoordinate;

    setRightPadding(padding > SETTINGS.horizontalPadding
      ? padding + 20
      : SETTINGS.horizontalPadding);

    if (!myLevelLimit || (myLevelLimit?.events !== levelsCount)) {
      const newValue: LevelLimit = myLevelLimit
        ? { ...myLevelLimit, events: levelsCount }
        : { periods: 0, events: levelsCount };

      setMyLevelLimit(newValue);
    }
  };

  const setPeriodsLevelsCount = (levelsCount: number) => {
    if (!myLevelLimit || (myLevelLimit?.periods !== levelsCount)) {
      const newValue: LevelLimit = myLevelLimit
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
    } else {
      setEventsWithCoords(events);
    }

    periods.forEach((item: Period.VisualItem) => {
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

    const allItems: Array<IDateSortable> = [...events, ...periods];
    const start = Math.min(...allItems.map(
      (el: IDateSortable) => el.calculatedDate || el.calculatedDateStart || 0,
    ));
    startDate.current = start;
  }, [events, periods, needCorrectionOnBC]);

  useEffect(() => {
    if (zoomSliderStopped && zoomRef.current !== zoom) {
      zoomRef.current = zoom;

      calculateVerticalWithZoom();
    }
  }, [zoom, zoomSliderStopped]);

  useEffect(() => {
    if (workAreaWidth !== undefined) calculateVerticalWithZoom();
  }, [workAreaWidth]);



  useEffect(() => {
    setMyLevelLimit({ ...levelLimit });
    calculateVertical();
  }, [levelLimit]);

  const viewPortHeight : number = useMemo(() => {
    const need = myLevelLimit
      ? (myLevelLimit.events * 50 + myLevelLimit.periods * 30 + 111)
      : 0;

    return need > height ? need : height;
  }, [height, myLevelLimit]);

  useLayoutEffect(() => {
    const allItems: Array<IDateSortable> = [...events, ...periods];

    if (allItems.length === 0) return;

    const minYear = Math.min(...allItems.map((el: IDateSortable) => el.year || el.startYear || 0));
    const maxYear = Math.max(...allItems.map((el: IDateSortable) => el.year || el.endYear || 0));

    const workWidth = workAreaWidth
      ? workAreaWidth * zoom
      : axisWidth.workArea * zoom;

    let delta = maxYear - minYear;
    const maxItemsCount = workWidth / ITEM_MIN_WIDTH;
    const itemDelta = delta / maxItemsCount;

    let step: number = STEPS.find((item) => item >= itemDelta) || 0;

    if (!step) {
      step = STEPS[STEPS.length - 1];
    }

    const roundedMinYear = Math.floor(minYear / step) * step;
    const roundedMaxYear = Math.ceil((maxYear + step) / step) * step;

    delta = roundedMaxYear - roundedMinYear;

    const itemCount = Math.ceil(delta / (step));
    // const itemWidthNewValue = canvasWidth / (itemCount);

    const newSerifs: number[] = new Array(itemCount)
      .fill(0)
      // @ts-ignore
      .map((item, index) => roundedMinYear + (step * index));

    const svgWidthNewValue = workWidth + SETTINGS.horizontalPadding + memoPaddingRight;

    if (!isArrayEquals(serifs, newSerifs)) {
      setSerifs(newSerifs);
    }
    setSvgWidth(svgWidthNewValue);

    const needBCDelta = (roundedMinYear < 0) && (roundedMaxYear > 0);

    if (needCorrectionOnBC !== needBCDelta) {
      setNeedCorrectionOnBC(needBCDelta);
    }
  // }, [axisWidth, width, zoom, events, periods, lastYearFromLastPoint, myLevelLimit]);
  }, [axisWidth, zoom, events, periods, myLevelLimit, memoPaddingRight]);

  useEffect(() => {
    const allItems: Array<IDateSortable> = [...events, ...periods];

    if (allItems.length === 0) return;

    const minYear = Math.min(...allItems.map((el: IDateSortable) => el.year || el.startYear || 0));
    const maxYear = Math.max(...allItems.map((el: IDateSortable) => el.year || el.endYear || 0));

    setMinDate(minYear);
    setMaxDate(maxYear);
  }, [events, periods]);

  const midHeight = viewPortHeight - (myLevelLimit?.periods || 0) * 30 - 75;

  const recalculateTimelineEnding = useCallback(() => {
  }, [viewPortHeight, myLevelLimit]);

  function onCoordinatesReady() {
    calculateVerticalWithZoom();
  }

  useEffect(() => {
    if ((workAreaWidth === undefined) && (rightPadding !== undefined)) {
      const minWidthValue = minWidth || SETTINGS.canvas.minWidth;

      const canvasWidth = width < minWidthValue ? minWidthValue : width;
      setWorkAreaWidth(canvasWidth - SETTINGS.horizontalPadding - rightPadding);
    }
  }, [rightPadding, minWidth]);

  useEffect(() => {
    if (rightPadding !== undefined) {
      const minWidthValue = minWidth || SETTINGS.canvas.minWidth;

      const canvasWidth = width < minWidthValue ? minWidthValue : width;
      setWorkAreaWidth(canvasWidth - SETTINGS.horizontalPadding - rightPadding);
    } 
  }, [minWidth])

  return !!width && !!pixelsInYear && !!myLevelLimit
    ? (
      <div
        className="timeline-canvas"
        style={{
          width: svgWidth,
          height: viewPortHeight,
        }}
      >
        {/* eslint-disable-next-line react/jsx-no-constructed-context-values */}
        <SerifsContext.Provider value={{
          needCorrectionOnBC, zoom, theme, isDeprecatedBrowser,
        }}
        >
          <NativeAxis
            width={svgWidth}
            startDate={startDate.current}
            top={midHeight}
            serifs={serifs}
            yearPerPixel={pixelsInYear}
          />
          <div
            className="timeline-canvas__inner"
            style={{
              marginLeft: SETTINGS.horizontalPadding,
              width: `calc(100% - ${memoPaddingRight + SETTINGS.horizontalPadding}px)`,
            }}
          >
            <EventPoints
              elementsOverAxis={elementsOverAxis}
              events={eventsWithCoords}
              startDate={startDate.current}
              yearPerPixel={pixelsInYear}
              y={midHeight}
              zoom={zoom}
              /* eslint-disable-next-line react/jsx-no-bind */
              onCoordinatesReady={onCoordinatesReady}
              onRecalculateTimelineEnding={recalculateTimelineEnding}
              levelLimit={myLevelLimit.events}
              activeItem={
                activeItem && (activeItem.type === ItemType.Event) ? activeItem.id : null
              }
              onItemClick={onItemClick}
            />
            <PeriodSections
              elementsOverAxis={elementsOverAxis}
              levelLimit={myLevelLimit.periods}
              startDate={startDate.current}
              yearPerPixel={pixelsInYear}
              y={midHeight}
              periods={periods}
              activeItem={
                activeItem && (activeItem.type === ItemType.Period) ? activeItem.id : null
              }
              onItemClick={onItemClick}
              onSetLevelsCount={setPeriodsLevelsCount}
            />
          </div>
        </SerifsContext.Provider>
      </div>
    )
    : null;
}
