import React, { useMemo, useRef, useState, } from 'react';
import './zoom-slider.sass';
import { TouchableOpacity, View } from 'react-native';
import DecreaseButton from './dec-button';
import IncreaseButton from './inc-button';
const SLIDER_STEP = 0.5;
function startAnimation(oldValue, newValue, onChange) {
    const diff = newValue - oldValue;
    const step = diff <= 1 ? 300 : 500;
    const part = diff / step;
    const start = performance.now();
    requestAnimationFrame(function callback(time) {
        const diffTime = time - start;
        if (diffTime > step) {
            setTimeout(() => onChange(newValue), 100);
            return;
        }
        const newVol = oldValue + part * diffTime;
        onChange(Math.round(newVol * 100) / 100);
        requestAnimationFrame(callback);
    });
}
export default function ZoomSlider(props) {
    const { value, onChange, onSliderStop } = props;
    // const [myValue, setMyValue] = useState<number>(0);
    const [mouseButtonPressed, setMouseButtonPressed] = useState(false);
    const slider = useRef(null);
    const myValue = useMemo(() => Math.round(value * 100) / 100, [value]);
    const onChangeValue = (e) => {
        const newValue = Math.round((+e.currentTarget.value / 100) * 100) / 100;
        const delta = Math.abs(newValue - myValue);
        if (!delta)
            return;
        if ((delta < 0.5) || mouseButtonPressed) {
            onChange(newValue);
        }
        else {
            startAnimation(myValue, newValue, onChange);
        }
    };
    const decreaseButtonStyle = useMemo(() => ({ opacity: value <= 1 ? 0.4 : 1 }), [value]);
    const increaseButtonStyle = useMemo(() => ({ opacity: value >= 10 ? 0.4 : 1 }), [value]);
    const decreaseValue = () => {
        const newValue = (myValue - SLIDER_STEP) < 1 ? 1 : myValue - SLIDER_STEP;
        startAnimation(myValue, newValue, onChange);
    };
    const increaseValue = () => {
        const newValue = (myValue + SLIDER_STEP) > 10 ? 10 : myValue + SLIDER_STEP;
        startAnimation(myValue, newValue, onChange);
    };
    const onMouseDown = () => {
        onSliderStop(false);
    };
    const onMouseUp = () => {
        onSliderStop(true);
    };
    const onMouseMove = (event) => {
        if (event.buttons === 1) {
            setMouseButtonPressed(true);
        }
    };
    return (<div className="range-slider">
      <TouchableOpacity onPress={decreaseValue}>
        <View style={decreaseButtonStyle}>
          <DecreaseButton />
        </View>
      </TouchableOpacity>
      <div className="range-slider__control">
        <input ref={slider} onMouseUp={onMouseUp} onMouseDown={onMouseDown} onMouseMove={onMouseMove} type="range" min={100} max={1000} value={myValue * 100} id="myRange" onChange={onChangeValue}/>
      </div>
      <TouchableOpacity onPress={increaseValue}>
        <View style={increaseButtonStyle}>
          <IncreaseButton />
        </View>
      </TouchableOpacity>
    </div>);
}
