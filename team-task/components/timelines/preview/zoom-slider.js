import React from "react";

type Props = {
    value: number,
    onChange?: Function,
    onSliderStop?: Function
}

export default function ZoomSlider(props: Props) {

    const {value} = props

    const _onChange = (e) => {
        props.onChange(+e.target.value / 100)
    }

    return <input className="timeline-preview__zoom-slider"
                  onMouseUp={() => props.onSliderStop(true)}
                  onMouseDown={() => props.onSliderStop(false)}
                  type="range" min={100} max={1000}
                  value={value * 100}
                  onChange={_onChange}/>
}
