import React, {useEffect, useMemo, useRef, useState} from "react";
import './preview.sass'
import {Timeline} from "timeline/index";
import {useWindowSize} from "../../../tools/window-resize-hook";
import PropTypes from "prop-types"

export default function TimelinePreview(props) {
    const {background, events, periods} = props;
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);

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
                id: item.Id,
                startYear: item.StartYear,
                endYear: item.EndYear,
                name: item.Name,
                color: hslToHex(item.color),
                startDate: item.startDate,
                endDate: item.endDate,
            }
        }) : []
    }, [periods])

    return <div ref={_preview} className="timeline-preview">
            <div className="image-filter">
            <Timeline width={width} height={height} events={events ? events : []} zoom={1} periods={_periods} levelLimit={4}/>
            </div>
            {
                background && <img alt={'timeline background'} className="normal" src={`/data/${background}`}/>
            }
        </div>
}

TimelinePreview.propTypes = {
    background: PropTypes.string,
    events: PropTypes.array,
    periods: PropTypes.array
}


function hslToHex(color) {
    let result = color.match(/hsl\(([^)]+)\)/)[1]

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
