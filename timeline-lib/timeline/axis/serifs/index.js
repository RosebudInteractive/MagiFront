import React, {useMemo} from 'react';
import SerifItem from './native-item';


type Props = {
    points: Array,
    y: number,
};

export default function Serifs(props: Props) {
    const {points, yearPerPixel} = props

    return useMemo(() => {
        return points.map((event, index) => {
            return <SerifItem yearPerPixel={yearPerPixel} text={event} index={index} key={index}/>
        })
    }, [points])
}
