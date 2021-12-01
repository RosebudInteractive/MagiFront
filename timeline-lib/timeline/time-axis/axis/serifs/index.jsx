import React, { useMemo } from 'react';
import SerifItem from './item';
export default function Serifs(props) {
    const { points, yearPerPixel, width, startDate, } = props;
    const serifs = useMemo(() => points.map((event) => (<SerifItem yearPerPixel={yearPerPixel} startDate={startDate} year={event} key={event} rightBound={width}/>)), [points, startDate, yearPerPixel]);
    return <>{serifs}</>;
}
