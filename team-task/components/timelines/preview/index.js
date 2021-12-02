import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import './preview.sass'
import {Themes, Timeline, convertData} from "timeline/index";
import {useWindowSize} from "../../../tools/window-resize-hook";
import PropTypes from "prop-types"
import getInnerSize from "../../../tools/get-inner-size";
import Platform from "platform";
import {getIOSVersion} from "tools/page-tools";

const iosVer = getIOSVersion();
const isDeprecatedBrowser = (Platform.name === 'IE') || (iosVer && iosVer < 14);
let enableSwitch = true;

export default function TimelinePreview(props: Props) {
    const {timeline, background, levels} = props;
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(500);
    const [incKey, setIncKey] = useState(0);
    const [fsEnable, setFsEnable] = useState(false)
    const [isVertical, setIsVertical] = useState(false)
    const [enableFSSwitch, setEnableFSSwitch] = useState(true)

    const preview = useRef(null);

    const resizeHandler = () => {
        const width = window.innerWidth;
    };

    useEffect(() => {
        window.addEventListener('resize', resizeHandler);

        resizeHandler();
        return () => {
            window.removeEventListener('resize', resizeHandler);
        }
    }, [])

    useWindowSize((data) => {
        if (preview.current) {
            const size = getInnerSize(preview.current);
            setWidth(size.width);
            setHeight(size.height);
        }

        if (enableSwitch && (data.width < 900)) {
            enableSwitch = false;
            setEnableFSSwitch(enableSwitch);
        }

        if (!enableSwitch && (data.width >= 900)) {
            enableSwitch = true;
            setEnableFSSwitch(enableSwitch);
        }
    }, [enableFSSwitch]);

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

    const changeOrientation = useCallback((vertical: boolean) => {
        setIsVertical(vertical);
    }, [isVertical])

    return !isDeprecatedBrowser &&
        <div className={
            "timeline-preview _with-custom-scroll"
            + (fsEnable ? ' _full-screen' : '')
            + (isVertical ? ' _vertical' : '')
        }
             ref={preview}>
            {
                !!timeline
                && width
                && height
                && <Timeline width={width}
                             elementsOverAxis={false}
                             visibilityChecking={false}
                             enableToSwitchFS={enableFSSwitch}
                             backgroundImage={backgroundFile}
                             height={height}
                             theme={Themes.current}
                             events={converted.Events}
                             periods={converted.Periods}
                             levelLimit={levels}
                             onFullScreen={openFullScreen}
                             onCloseFullScreen={closeFullScreen}
                             onChangeOrientation={changeOrientation}
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
