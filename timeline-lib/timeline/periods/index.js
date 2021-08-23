import React, {useEffect, useMemo, useRef, useState} from 'react';
import placeByYLevelLimit from "../../helpers/placeByLevel";
import AnimatedPeriod from "./native-item";

export default function Periods(props) {
    const {startDate, yearPerPixel, periods, levelLimit, y, elementsOverAxis} = props;
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
                const {start, end} = calcPeriodPoints(item)

                const xStart = Math.abs(start - startDate) * yearPerPixel;
                const xEnd = Math.abs(end - startDate) * yearPerPixel;

                return {...item, yLevel: 0, xLevel: 0, xStart, xEnd}
            });

            const alignedPeriods = placeByYLevelLimit(periodsWithCoords, levelLimit);

            alignedPeriods.forEach(item => {
                const startDate = `${item.startDay ? item.startDay + "." : ""}${item.startMonth ? item.startMonth + "." : ""}${item.startYear}`,
                    endDate = `${item.endDay ? item.endDay + "." : ""}${item.endMonth ? item.endMonth + "." : ""}${item.endYear}`

                item.displayDate = `${startDate} - ${endDate}гг.`;
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
                                       visible={period.visible}
                                       opacity={period.visible ? opacity : 0}
                                       opacityHalf={0.57}/>
            })
            :
            null
    }, [verticallyAlignedPeriods])
}

const calcPeriodPoints = (period) => {
    const start = period.startYear + (period.startMonth ? (period.startMonth - 1) / 12 : .5) + (period.startDay ? period.startDay / (12 * 30) : (.5 / 12)),
        end = period.endYear + (period.endMonth ? (period.endMonth - 1) / 12 : .5) + (period.endDay ? period.endDay / (12 * 30) : (.5 / 12))

    return {start, end}
}
