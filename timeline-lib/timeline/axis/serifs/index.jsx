import React, { useMemo } from 'react';
import SerifItem from './item';
export default function Serifs(props) {
    const { points, yearPerPixel } = props;
    /* eslint-disable react/no-array-index-key */
    const serifs = useMemo(() => points.map((event, index) => (<SerifItem yearPerPixel={yearPerPixel} year={event} index={index} key={index}/>)), [points]);
    /* eslint-enable react/no-array-index-key */
    return <React.Fragment>{serifs}</React.Fragment>;
}
