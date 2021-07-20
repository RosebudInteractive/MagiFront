import React, {useEffect, useRef, useState} from 'react';
import placeByYLevelLimit from "../../helpers/placeByLevel";
import AnimatedPeriod from "./native-item";
import moment from "moment"

export default function Periods(props) {
    const {zoom, startDate, yearPerPixel, periods, levelLimit, y, elementsOverAxis} = props;
    const [verticallyAlignedPeriods, setVerticallyAlignedPeriods] = useState([]);
    const [opacity, setOpacity] = useState(0);
    const didMountRef = useRef(0);

    useEffect(() => {
        if(didMountRef.current === 0){
            didMountRef.current += 1;
        }

    }, [periods]);

    useEffect(() => {
        if(didMountRef.current === 1){
            setTimeout(() => {
                setOpacity(1)
            }, 500)
        }
    }, [didMountRef]);

    const p = verticallyAlignedPeriods.length > 0 &&
        verticallyAlignedPeriods
            .map((period) => {
                return <AnimatedPeriod title={period.title}
                                       key={period.id}
                                       date={period.date}
                                       id={period.id}
                                       startX={period.xStart}
                                       endX={period.xEnd}
                                       y={period.y}
                                       color={period.color}
                                       zoom={zoom}
                                       visible={period.visible}
                                       opacity={period.visible ? opacity : 0}
                                       opacityHalf={0.57}/>
            });


    useEffect(() => {
        if (periods.length > 0) {

            const periodsWithCoords = periods.map((per) => {
                const _yearStart = +per.startDate.substr(per.startDate.length - 4, 4),
                    _yearEnd = +per.endDate.substr(per.endDate.length - 4, 4)


                const xStart = Math.abs(_yearStart - startDate) * yearPerPixel;
                const xEnd = Math.abs(_yearEnd - startDate) * yearPerPixel;

                return {...per, yLevel: 0, xLevel: 0, xStart, xEnd}
            });

            const alignedPeriods = placeByYLevelLimit(periodsWithCoords, levelLimit);

            alignedPeriods.forEach(x => {
                x.date = `${moment(x.startDate).get('year')} - ${moment(x.endDate).get('year')}г.`;
                x.y = elementsOverAxis ? (y - 30) - (x.yLevel * 30) : (y + 30) + (x.yLevel * 30);
                x.title = x.name;
            });

            setVerticallyAlignedPeriods(alignedPeriods);
        }

    }, [periods, startDate, yearPerPixel, levelLimit, elementsOverAxis]);

    return p;
}
