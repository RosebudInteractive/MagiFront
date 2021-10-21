import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import './preview.sass'
import {Themes, Timeline} from "timeline/index";
import {useWindowSize} from "../../../tools/window-resize-hook";
import PropTypes from "prop-types"
import Header from "timeline/timeline/header";
import Footer from "timeline/timeline/footer";

export default function TimelinePreview(props) {
    const {background, events, periods, levels} = props;
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const [incKey, setIncKey] = useState(0);
    const [zoom, setZoom] = useState(1)
    const [zoomSliderStopped, setZoomSliderStopped] = useState(true);
    const [fsEnable, setFsEnable] = useState(false)

    const _preview = useRef(null);

    useWindowSize(() => {
        if (_preview.current) {
            setWidth(_preview.current.clientWidth);
            setHeight(_preview.current.clientHeight);
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

    useEffect(() => {
        if (_preview.current) {
            setWidth(_preview.current.clientWidth);
            setHeight(_preview.current.clientHeight)
        }

        setTimeout(() => {
            if (_preview.current) {
                setWidth(_preview.current.clientWidth);
                setHeight(_preview.current.clientHeight)
            }
        }, 0)
    }, [fsEnable, zoom]);

    const _periods = useMemo(() => {
        return periods ? periods.map((item) => {
            return {
                id: item.Id ? item.Id : item.id,
                startDay: !!item.LbDay && +item.LbDay,
                startMonth: !!item.LbMonth && +item.LbMonth,
                startYear: !!item.LbYear && +item.LbYear,
                endDay: !!item.RbDay && +item.RbDay,
                endMonth: !!item.RbMonth && +item.RbMonth,
                endYear: !!item.RbYear && +item.RbYear,
                name: item.ShortName || item.Name,
                color: hslToHex(item.color),
                visible: true,
            }
        }) : []
    }, [periods]);

    const _events = useMemo(() => {
        return events ? events.map((item) => {
            return {
                id: item.Id ? item.Id : item.id,
                day: !!item.Day && +item.Day,
                month: !!item.Month && +item.Month,
                year: !!item.Year && +item.Year,
                name: item.ShortName || item.Name,
                color: item.color,
                visible: true,
            }
        }) : []
    }, [events])

    const _style = useMemo(() => {
        const fileName = background ? (background.file ? background.file : background) : null;

        return fileName ? {
            background: `linear-gradient(rgba(0, 0, 0, 0.44), rgba(0, 0, 0, 0.58)), center top / cover no-repeat url(/data/${fileName})`,
        } : {backgroundColor: "#B4B4BB"}
    }, [background]);

    const onZoomChange = useCallback((value) => {
        setZoom(value)
    }, [zoom]);

    const onSliderStop = (stopped) => {
        setZoomSliderStopped(stopped)
    };

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

    return <div className={"timeline-preview"  + (fsEnable ? ' _full-screen' : '')} >
        <div className={'timeline-preview__wrapper'}>
            {fsEnable && <Header title={'Ключевые события'} />}
            <div className={"timeline-preview__container"} ref={_preview} style={{..._style}}>
                <div className={"timeline-preview__vertical-container"}>
                    <Timeline width={width}
                              height={height}
                              theme={Themes.current}
                              events={_events}
                              periods={_periods}
                              zoom={zoom}
                              levelLimit={levels}
                              zoomSliderStopped={zoomSliderStopped}
                              fsMode={fsEnable}
                              key={incKey}/>
                </div>
            </div>
            <Footer onOpenPress={openFullScreen}
                    onClosePress={closeFullScreen}
                    fullScreenMode={fsEnable}
                    zoom={zoom}
                    onSliderStop={onSliderStop}
                    onZoomChange={onZoomChange}/>
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
