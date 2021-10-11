import React, { useMemo } from 'react';
import SerifItem from './item';
export default function Serifs(props) {
    const { points, yearPerPixel, width } = props;
    const serifs = useMemo(() => points.map((event, index) => (<SerifItem yearPerPixel={yearPerPixel} year={event} index={index} key={event} rightBound={width}/>)), [points]);
    return <React.Fragment>{serifs}</React.Fragment>;
}
