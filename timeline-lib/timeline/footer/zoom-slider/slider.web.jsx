import React, { useMemo } from 'react';
import './zoom-slider.sass';
import { TouchableOpacity, View } from 'react-native';
import DecreaseButton from './dec-button';
import IncreaseButton from './inc-button';
function startAnimation(oldValue, newValue, onChange) {
    const diff = newValue - oldValue;
    const step = diff <= 1 ? 300 : 600;
    const part = diff / step;
    const start = performance.now();
    requestAnimationFrame(function callback(time) {
        const diffTime = time - start;
        if (diffTime > step) {
            onChange(newValue);
            return;
        }
        const newVol = oldValue + part * diffTime;
        onChange(newVol);
        requestAnimationFrame(callback);
    });
}
export default function ZoomSlider(props) {
    const { value, onChange, onSliderStop } = props;
    const onChangeValue = (e) => {
        const newValue = +e.currentTarget.value / 100;
        if (Math.abs(newValue - value) < 0.5) {
            onChange(newValue);
        }
        else {
            startAnimation(value, newValue, onChange);
        }
    };
    const decreaseButtonStyle = useMemo(() => ({ opacity: value <= 1 ? 0.4 : 1 }), [value]);
    const increaseButtonStyle = useMemo(() => ({ opacity: value >= 10 ? 0.4 : 1 }), [value]);
    const decreaseValue = () => {
        const newValue = (value - 1) < 1 ? 1 : value - 1;
        startAnimation(value, newValue, onChange);
    };
    const increaseValue = () => {
        const newValue = (value + 1) > 10 ? 10 : value + 1;
        startAnimation(value, newValue, onChange);
    };
    return (<div className="range-slider">
      <TouchableOpacity onPress={decreaseValue}>
        <View style={decreaseButtonStyle}>
          <DecreaseButton />
        </View>
      </TouchableOpacity>
      <input className="range-slider__control" onMouseUp={() => onSliderStop(true)} onMouseDown={() => onSliderStop(false)} type="range" min={100} max={1000} value={value * 100} id="myRange" onChange={onChangeValue}/>
      <TouchableOpacity onPress={increaseValue}>
        <View style={increaseButtonStyle}>
          <IncreaseButton />
        </View>
      </TouchableOpacity>
    </div>);
}
