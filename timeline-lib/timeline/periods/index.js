import React, {useEffect, useMemo, useRef, useState} from 'react';
import placeByYLevelLimit from "../../helpers/placeByLevel";
import AnimatedPeriod from "./native-item";

export default function Periods(props) {
    const {zoom, startDate, yearPerPixel, periods, levelLimit, y, elementsOverAxis} = props;
    const [verticallyAlignedPeriods, setVerticallyAlignedPeriods] = useState([]);
    const [opacity, setOpacity] = useState(0);
    const didMountRef = useRef(0);

    useEffect(() => {
        if (didMountRef.current === 0) {
            didMountRef.current += 1;
        }
    }, [periods]);

    useEffect(() => {
        if (didMountRef.current === 1) {
            setTimeout(() => {
                setOpacity(1)
            }, 500)
        }
    }, [didMountRef]);

    useEffect(() => {
        if (periods.length > 0) {
            const periodsWithCoords = periods.map((item) => {
                const _yearStart = item.startYear,
                    _yearEnd = item.endYear


                const xStart = Math.abs(_yearStart - startDate) * yearPerPixel;
                const xEnd = Math.abs(_yearEnd - startDate) * yearPerPixel;

                return {...item, yLevel: 0, xLevel: 0, xStart, xEnd}
            });

            const alignedPeriods = placeByYLevelLimit(periodsWithCoords, levelLimit);

            alignedPeriods.forEach(item => {
                item.displayDate = `${item.startYear} - ${item.endYear}гг.`;
                item.y = elementsOverAxis ? (y - 30) - (item.yLevel * 30) : (y + 30) + (item.yLevel * 30);
                item.title = item.name;
            });

            setVerticallyAlignedPeriods(alignedPeriods);
        }

    }, [periods, startDate, yearPerPixel, levelLimit, elementsOverAxis]);

    return useMemo(() => {
        return verticallyAlignedPeriods.length > 0 ?
            verticallyAlignedPeriods.map((period) => {
                return <AnimatedPeriod title={period.title}
                                       key={period.id}
                                       date={period.displayDate}
                                       id={period.id}
                                       startX={period.xStart}
                                       endX={period.xEnd}
                                       y={period.y}
                                       color={period.color}
                                       zoom={zoom}
                                       visible={period.visible}
                                       opacity={period.visible ? opacity : 0}
                                       opacityHalf={0.57}/>
            })
            :
            null
    }, [verticallyAlignedPeriods])
}
