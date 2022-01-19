import React, { useEffect, useState } from 'react'
import ScriptSequence from "../../data/script-sequence";
import { Timeline, TimelineController, } from "@rosebud/timeline/src"
import { Event } from "@rosebud/timeline/src/types/event";
import { Period } from "@rosebud/timeline/src/types/period";
import { transformEventToVisual, transformPeriodToVisual } from "@rosebud/timeline/src/helpers/tools";
import './wrapper.sass'

interface IProps {
  events: Event.DataItem[],
  periods: Period.DataItem[],
  levelLimit: { events: number, periods: number },
  visibilityChecking: boolean,
  elementsOverAxis: boolean,
  isDeprecatedBrowser: boolean,
  minWidth: number;
}

type StateData = {
  events: any,
  periods: any,
}

export default function TestWrapper(props: IProps): JSX.Element {
  const {
    levelLimit, visibilityChecking, elementsOverAxis, events, periods, isDeprecatedBrowser, minWidth
  } = props;

  const [eventsWithVisibility, setVisibilityEvents] = useState<Event.VisualItem[]>([]);
  const [periodsWithVisibility, setVisibilityPeriods] = useState<Period.VisualItem[]>([]);

  function updateDataState(data: StateData) {
    setVisibilityEvents(data.events);
    setVisibilityPeriods(data.periods);
  }

  useEffect(() => {
    let myEvents: Event.VisualItem[] = events.map(item => transformEventToVisual(item)),
      myPeriods: Period.VisualItem[] = periods.map(item => transformPeriodToVisual(item))

    TimelineController.init({events: myEvents, periods: myPeriods, sequence: ScriptSequence}, updateDataState);


    setVisibilityEvents(TimelineController.getState().events);
    setVisibilityPeriods(TimelineController.getState().periods);
  }, [events]);

  // const containerHeight = useMemo(() => {
  //   const levelsCount: number = levelLimit.events + levelLimit.periods;
  //   return 500 + ((elementsOverAxis) ? levelsCount * 60 : (levelsCount > 6) ? 60 * (levelsCount - 6) : 0);
  // }, [levelLimit])

  return <div className='timeline-container _with-custom-scroll'>
    <Timeline backgroundImage='background.jpg'
              enableToSwitchFS={true}
              height={500}
              userDefinedWidth={4000}
              events={eventsWithVisibility}
              periods={periodsWithVisibility}
              levelLimit={levelLimit}
              elementsOverAxis={elementsOverAxis}
              visibilityChecking={visibilityChecking}
              isDeprecatedBrowser={isDeprecatedBrowser}
    />
  </div>
}

