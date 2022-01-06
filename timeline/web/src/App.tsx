import React, {
  useCallback, useMemo, useState,
} from 'react';
import './App.sass';
import emitter from '@rosebud/timeline/src/timeline-controller/emitter';
import { Event } from '@rosebud/timeline/src/types/event';
import { Period } from '@rosebud/timeline/src/types/period';
import { convertData, Themes } from '@rosebud/timeline/src';
import TestWrapper from './components/test-wrapper';
import DataPicker from './components/data-picker';
import EVENTS from './data/events';
import PERIODS from './data/periods';
import LevelLimit from './components/level-limit';
import CheckVisibilitySwitcher from './components/check-visibility-switcher';
import RiseUpOverXAxis from './components/rise-up-over-x-axis';
import PlayerControls from './components/player-controls';
import generator from './helpers/time-generator';
import ThemePicker from './components/theme-picker';
import ClipboardData from './components/clipboard-data';
import { isDeprecatedBrowser, isUnsupportedBrowser } from './helpers/platform-tools';

type TimelineData = {
  Events: Event.DataItem[],
  Periods: Period.DataItem[]
};

function App() {
  const [dataIndex, setDataIndex] = useState(0);
  const [importedData, setImportedData] = useState<TimelineData | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [themeIndex, setThemeIndex] = useState(0);
  const [eventsLevelLimit, setEventsLevelLimit] = useState(4);
  const [periodsLevelLimit, setPeriodsLevelLimit] = useState(3);
  const [playing, setPlaying] = useState(false);
  const [stopped, setStopped] = useState(true);
  const [visibilityChecking, setVisibilityChecking] = useState<boolean>(true);
  const [elementsOverAxis, setElementsOverAxis] = useState(false);
  const [scriptTime, setScriptTime] = useState<number>(0);

  const onDataSetChange = useCallback((index) => {
    setImportedData(null);
    setDataIndex(index);
  }, []);

  const onThemeChange = useCallback((index) => {
    Themes.setCurrent(index);
    setThemeIndex(index);
  }, []);

  const onEventsLevelLimitChange = useCallback((value) => {
    setEventsLevelLimit(value);
  }, []);

  const onPeriodsLevelLimitChange = useCallback((value) => {
    setPeriodsLevelLimit(value);
  }, []);

  const events: Event.DataItem[] | [] = useMemo(() => {
    if (importedData) { return importedData.Events; }

    return (dataIndex !== -1) ? EVENTS[dataIndex].data : [];
  }, [dataIndex, importedData]);

  const periods: Period.DataItem[] = useMemo(() => {
    if (importedData) { return importedData.Periods; }

    if ((dataIndex !== -1) && PERIODS[dataIndex]) {
      return PERIODS[dataIndex].data;
    }
    return [];
  }, [dataIndex, importedData]);

  const risingChanged = (value: boolean) => {
    setElementsOverAxis(value);
  };

  const pause = () => {
    setPlaying(false);
    generator.pause();
  };

  const play = () => {
    setPlaying(true);
    generator.play();
  };

  const seek = (delta: number) => {
    if (delta > 0) {
      generator.forward(delta * 1000);
    } else {
      generator.backward(delta * -1000);
    }
  };

  const stop = () => {
    setPlaying(false);
    generator.stop();
  };

  emitter.addListener('stoppedTimeStamp', () => {
    setPlaying(false);
    setStopped(true);
  });

  emitter.addListener('timeStampReceived', (ev: { detail: { time: number } }) => {
    setStopped(false);
    setScriptTime(ev.detail.time);
  });

  const applyData = (data: any) => {
    const tlData: TimelineData = convertData(data);
    setImportedData(tlData);
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(tlData));
  };

  return (
    <div className="main-container">
      <div className="row-container">
        <DataPicker onChange={onDataSetChange} events={EVENTS} />
        <ThemePicker onChange={onThemeChange} />
        <RiseUpOverXAxis toggleRising={risingChanged} />
        <CheckVisibilitySwitcher switchVisibilityChecking={
          (value: boolean) => setVisibilityChecking(value)
        }
        />
      </div>
      <div className="row-container">
        <LevelLimit onChange={onEventsLevelLimitChange} value={eventsLevelLimit} title="События" />
        <LevelLimit onChange={onPeriodsLevelLimitChange} value={periodsLevelLimit} title="Периоды" />
      </div>

      <PlayerControls
        onPlay={play}
        onPause={pause}
        onSeek={seek}
        onStop={stop}
        isPlaying={playing}
        isStopped={stopped}
        scriptTime={+((scriptTime / 1000).toFixed(1))}
      />
      {events && !isUnsupportedBrowser() && (
      <TestWrapper
        elementsOverAxis={elementsOverAxis}
        events={events}
        periods={periods}
        levelLimit={{ events: eventsLevelLimit, periods: periodsLevelLimit }}
        visibilityChecking={visibilityChecking}
        isDeprecatedBrowser={isDeprecatedBrowser()}
      />
      )}
      <ClipboardData onApplyClick={applyData} />
    </div>
  );
}

export default App;
