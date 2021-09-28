import React, { useEffect, useMemo, useRef, useState, } from 'react';
import './zoom-slider.sass';
import { TouchableOpacity, View } from 'react-native';
import DecreaseButton from './dec-button';
import IncreaseButton from './inc-button';
function startAnimation(oldValue, newValue, animatedChange, onChange) {
    const diff = newValue - oldValue;
    const step = diff <= 1 ? 300 : 600;
    const part = diff / step;
    const start = performance.now();
    requestAnimationFrame(function callback(time) {
        const diffTime = time - start;
        if (diffTime > step) {
            setTimeout(() => onChange(newValue), 100);
            return;
        }
        const newVol = oldValue + part * diffTime;
        animatedChange(Math.round(newVol * 100) / 100);
        requestAnimationFrame(callback);
    });
}
export default function ZoomSlider(props) {
    const { value, onChange, onSliderStop } = props;
    const [myValue, setMyValue] = useState(0);
    const [guard, setGuard] = useState(false);
    const slider = useRef(null);
    useEffect(() => {
        setMyValue(Math.round(value * 100) / 100);
    }, [value]);
    const onChangeValue = (e) => {
        const newValue = Math.round((+e.currentTarget.value / 100) * 100) / 100;
        const delta = Math.abs(newValue - myValue);
        if (!delta)
            return;
        if (guard) {
            setMyValue(newValue);
        }
        else if (delta < 0.5) {
            onChange(newValue);
        }
        else {
            startAnimation(myValue, newValue, setMyValue, onChange);
        }
    };
    const decreaseButtonStyle = useMemo(() => ({ opacity: value <= 1 ? 0.4 : 1 }), [value]);
    const increaseButtonStyle = useMemo(() => ({ opacity: value >= 10 ? 0.4 : 1 }), [value]);
    const decreaseValue = () => {
        const newValue = (myValue - 1) < 1 ? 1 : myValue - 1;
        startAnimation(myValue, newValue, setMyValue, onChange);
    };
    const increaseValue = () => {
        const newValue = (myValue + 1) > 10 ? 10 : myValue + 1;
        startAnimation(myValue, newValue, setMyValue, onChange);
    };
    const onMouseDown = () => {
        onSliderStop(false);
    };
    const onMouseUp = () => {
        if (guard) {
            setGuard(false);
            if (myValue !== value) {
                onChange(myValue);
            }
        }
        onSliderStop(true);
    };
    const onMouseMove = (event) => {
        if (event.buttons === 1) {
            setGuard(true);
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
