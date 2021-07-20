import React, {useMemo} from 'react';
import SerifItem from './native-item';


type Props = {
    points: Array,
    y: number,
};

export default function Serifs(props: Props) {
    const {points} = props

    return useMemo(() => {
        return points.map((event, index) => {
            return <SerifItem text={event} index={index} key={index}/>
        })
    }, [points])
}
