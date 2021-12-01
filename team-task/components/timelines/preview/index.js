import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import './preview.sass'
import {Themes, Timeline, convertData} from "timeline/index";
import {useWindowSize} from "../../../tools/window-resize-hook";
import PropTypes from "prop-types"
import getInnerSize from "../../../tools/get-inner-size";

export default function TimelinePreview(props: Props) {
    const {timeline, background, levels} = props;
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const [incKey, setIncKey] = useState(0);
    const [fsEnable, setFsEnable] = useState(false)

    const preview = useRef(null);

    useWindowSize(() => {
        if (preview.current) {
            const size = getInnerSize(preview.current);
            setWidth(size.width);
            setHeight(size.height);
        }
    });

    useEffect(() => {
        setTimeout(() => {
            if (preview.current) {
                const size = getInnerSize(preview.current);
                setWidth(size.width);
                setHeight(size.height);
            }
        }, 400)
    }, []);

    useEffect(() => {
        if (preview.current) {
            const size = getInnerSize(preview.current);
            setWidth(size.width);
            setHeight(size.height);
        }

        setTimeout(() => {
            if (preview.current) {
                const size = getInnerSize(preview.current);
                setWidth(size.width);
                setHeight(size.height);
            }
        }, 0)
    }, [fsEnable]);

    const converted = useMemo(() => {
        return timeline ? convertData(timeline) : {Events: [], Periods: []};
    }, [timeline])

    const backgroundFile = useMemo(() => {
        const fileName = background
            ? (background.file
                ? background.file
                : background)
            : null

        return fileName ? '/data/' + fileName : null
    }, [background]);

    const openFullScreen = () => {
        setFsEnable(true)
        document.addEventListener('keyup', keyPressHandler)
        setIncKey(incKey + 1)
    };

    const closeFullScreen = () => {
        setFsEnable(false)
        document.removeEventListener('keyup', keyPressHandler)
        setIncKey(incKey + 1)
    };

    const keyPressHandler = (e) => {
        if (e.key === "Escape") {
            closeFullScreen();
            e.preventDefault();
        }
    }

    return <div className={"timeline-preview _with-custom-scroll" + (fsEnable ? ' _full-screen' : '')} ref={preview}>
        {timeline && width && height && <Timeline width={width}
                               backgroundImage={backgroundFile}
                               height={height}
                               theme={Themes.current}
                               events={converted.Events}
                               periods={converted.Periods}
                               levelLimit={levels}
                               onFullScreen={openFullScreen}
                               onCloseFullScreen={closeFullScreen}
        />
        }
    </div>
}

TimelinePreview.propTypes = {
    background: PropTypes.string,
    timeline: PropTypes.any,
    levels: PropTypes.any,
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
