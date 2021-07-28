import React, {useEffect, useRef, useState} from "react";
import './preview.sass'
import {Timeline} from "timeline/index";
import {useWindowSize} from "../../../tools/window-resize-hook";

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

    return (
        <div ref={_preview} className="timeline-preview">
            <div className="image-filter">
            <Timeline width={width} height={height} events={events ? events : []} zoom={1} periods={periods ? periods : []} levelLimit={4}/>
            </div>
            {
                background && <img alt={'timeline background'} className="normal" src={`/data/${background}`}/>
            }
        </div>
    )
}
