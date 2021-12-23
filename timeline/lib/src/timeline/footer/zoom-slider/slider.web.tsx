import React, {
  useEffect, useMemo, useRef, useState,
} from 'react';
import './zoom-slider.sass';
import { TouchableOpacity, View } from 'react-native';
import DecreaseButton from './dec-button';
import IncreaseButton from './inc-button';
import SETTINGS from '../../settings';
import queue from './queue';
// import queue from './queue';

const SLIDER_STEP: number = SETTINGS.zoom.step;

type Props = {
  value: number,
  onChange: Function,
  onSliderStop: Function
};

let nextValue: number = 0;

function customBaseLog(val: number) {
  return Math.log(val) / Math.log(SETTINGS.zoom.multiplier);
}

function startAnimation(
  oldValue: number,
  newValue: number,
  onChange: Function,
  onFinish?: Function,
): void {
  const diff = newValue - oldValue;
  const step = diff <= 1 ? SETTINGS.zoom.animation.shortTime : SETTINGS.zoom.animation.longTime;
  const part = diff / step;
  const start = performance.now();

  nextValue = newValue;

  requestAnimationFrame(function callback() {
    const time = performance.now();
    const diffTime = time - start;

    if (diffTime > step) {
      onChange(newValue);

      if (onFinish) { onFinish(); }
      return;
    }

    const newVol = oldValue + part * diffTime;
    onChange(Math.round(newVol * 100) / 100);
    requestAnimationFrame(callback);
  });
}

// eslint-disable-next-line react/function-component-definition
export default function ZoomSlider(props: Props): JSX.Element {
  const {
    value, onChange, onSliderStop,
  } = props;
  const [mouseButtonPressed, setMouseButtonPressed] = useState<boolean>(false);

  const slider = useRef<HTMLInputElement | null>(null);

  const myValue: number = useMemo(() => Math.round(customBaseLog(value) * 100) / 100, [value]);

  useEffect(() => {
    nextValue = customBaseLog(value);
  }, []);

  const onChangeDecorator = (zoomValue: number) => {
    onChange(SETTINGS.zoom.multiplier ** zoomValue);
  };

  const onChangeValue = (e: React.FormEvent<HTMLInputElement>) => {
    const newValue = Math.round((+e.currentTarget.value / 100) * 100) / 100;
    const delta = Math.abs(newValue - myValue);

    if (!delta) return;

    if ((delta < 0.5) || mouseButtonPressed) {
      onChangeDecorator(newValue);
      nextValue = newValue;
    } else {
      startAnimation(myValue, newValue, onChangeDecorator);
    }
  };

  const decreaseButtonStyle = useMemo(() => ({
    opacity: myValue <= SETTINGS.zoom.min ? 0.4 : 1,
  }), [myValue]);

  const increaseButtonStyle = useMemo(() => ({
    opacity: myValue >= SETTINGS.zoom.max ? 0.4 : 1,
  }), [myValue]);

  const decreaseValue = () => {
    const newValue = (nextValue - SLIDER_STEP) < SETTINGS.zoom.min
      ? SETTINGS.zoom.min
      : nextValue - SLIDER_STEP;

    queue.add(startAnimation, nextValue, newValue, onChangeDecorator);
    // onChangeDecorator(newValue);

    nextValue = newValue;
  };

  const increaseValue = () => {
    const newValue = (nextValue + SLIDER_STEP) > SETTINGS.zoom.max
      ? SETTINGS.zoom.max
      : nextValue + SLIDER_STEP;

    queue.add(startAnimation, nextValue, newValue, onChangeDecorator);
    // onChangeDecorator(newValue);

    nextValue = newValue;
  };

  const onMouseDown = () => {
    onSliderStop(false);
  };

  const onMouseUp = () => {
    onSliderStop(true);
  };

  const onMouseMove = (event: any) => {
    if (event.buttons === 1) {
      setMouseButtonPressed(true);
    }
  };

  return (
    <div className="range-slider">
      <TouchableOpacity onPress={decreaseValue}>
        <View style={decreaseButtonStyle}>
          <DecreaseButton />
        </View>
      </TouchableOpacity>
      <div className="range-slider__control">
        <input
          ref={slider}
          onMouseUp={onMouseUp}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          type="range"
          min={SETTINGS.zoom.min * 100}
          max={SETTINGS.zoom.max * 100}
          value={myValue * 100}
          id="myRange"
          onChange={onChangeValue}
        />
      </div>
      <TouchableOpacity onPress={increaseValue}>
        <View style={increaseButtonStyle}>
          <IncreaseButton />
        </View>
      </TouchableOpacity>
    </div>
  );
}
