import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import './preview.sass'
import {Timeline} from "timeline/index";
import {useWindowSize} from "../../../tools/window-resize-hook";
import PropTypes from "prop-types"
import ZoomSlider from "./zoom-slider";

export default function TimelinePreview(props) {
    const {background, events, periods} = props;
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const [zoom, setZoom] = useState(1)
    const [zoomSliderStopped, setZoomSliderStopped] = useState(true);

    const _preview = useRef(null);

    useWindowSize(() => {
        if (_preview.current) {
            setWidth(_preview.current.clientWidth);
            setHeight(_preview.current.clientHeight)
        }
    });

    useEffect(() => {
        setTimeout(() => {
            if (_preview.current) {
                setWidth(_preview.current.clientWidth);
                setHeight(_preview.current.clientHeight)
            }
        }, 400)

    }, []);

    const _periods = useMemo(() => {
        return periods ? periods.map((item) => {
            return {
                id: item.Id ? item.Id : item.id,
                startDay: item.LbDay,
                startMonth: item.LbMonth,
                startYear: item.LbYear,
                endDay: item.RbDay,
                endMonth: item.RbMonth,
                endYear: item.RbYear,
                name: item.Name,
                color: hslToHex(item.color),
                visible: true,
            }
        }) : []
    }, [periods]);

    const _events = useMemo(() => {
        return events ? events.map((item) => {
            return {
                id: item.Id ? item.Id : item.id,
                day: item.Day,
                month: item.Month,
                year: item.Year,
                name: item.Name,
                color: item.color,
                visible: true,
            }
        }) : []
    }, [events])

    const _style = useMemo(() => {
        const fileName = background && background.file ? background.file : null

        return fileName ? {
            background: `linear-gradient(rgba(0, 0, 0, 0.44), rgba(0, 0, 0, 0.58)) center top / cover, url(/data/${fileName})`,
        } : {backgroundColor: "#B4B4BB"}
    }, [background])

    const _onZoomChange = useCallback((value) => {
        setZoom(value)
    }, []);

    const _zoomSliderStopped = (stopped) => {
        setZoomSliderStopped(stopped)
    };

    return <div className="timeline-preview" >
        <ZoomSlider onChange={_onZoomChange} value={zoom} onSliderStop={_zoomSliderStopped}/>

        <div className="timeline-preview__container _with-custom-scroll" ref={_preview} style={{..._style}}>
            <Timeline width={width} height={height} events={_events} zoom={zoom} periods={_periods} levelLimit={4} zoomSliderStopped={zoomSliderStopped}/>
        </div>
    </div>
}

TimelinePreview.propTypes = {
    background: PropTypes.string,
    events: PropTypes.array,
    periods: PropTypes.array
};


//todo move it to helpers/tools or smth
function hslToHex(color) {
    let result = color.match(/hsl\(([^)]+)\)/)[1];

    let [h, l, s] = result.split(',')

    l = parseFloat(l)
    s = parseFloat(s)

    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}
