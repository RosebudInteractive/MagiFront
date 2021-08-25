import React, {useEffect, useMemo, useRef, useState} from 'react';
import placeByYLevelLimit from "../../helpers/placeByLevel";
import AnimatedPeriod from "./native-item";
import {calcDisplayDate} from "../../helpers/tools";

export default function Periods(props) {
    const {startDate, yearPerPixel, periods, levelLimit, y, elementsOverAxis} = props;
    const [verticallyAlignedPeriods, setVerticallyAlignedPeriods] = useState([]);
    const [activeId, setActive] = useState(null);
    const didMountRef = useRef(0);

    useEffect(() => {
        if (didMountRef.current === 0) {
            didMountRef.current += 1;
        }
    }, [periods]);

    const onClickedElement = (id) => {
        if (activeId !== id) { setActive(id); }
    };

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
                const startDate = calcDisplayDate(item.startDay,item.startMonth, item.startYear),
                    endDate = calcDisplayDate(item.endDay, item.endMonth, item.endYear);

                item.displayDate = `${startDate} - ${endDate} гг.`;
                item.y = elementsOverAxis ? (y - 30) - (item.yLevel * 30) : (y + 30) + (item.yLevel * 30);
                item.title = item.name;
            });

            setVerticallyAlignedPeriods(alignedPeriods);
        }

    }, [periods, startDate, yearPerPixel, levelLimit, elementsOverAxis]);

    return useMemo(() => {
        return verticallyAlignedPeriods.length > 0 ?
            verticallyAlignedPeriods.map((period) => {
                const isActive = period.id === activeId

                return <AnimatedPeriod period={period}
                                       startX={period.xStart}
                                       endX={period.xEnd}
                                       y={period.y}
                                       visible={period.visible}
                                       key={period.id}
                                       isActive={isActive}
                                       onClick={onClickedElement}
                />
            })
            :
            null
    }, [verticallyAlignedPeriods, activeId])
}

const calcPeriodPoints = (period) => {
    const startYear = period.startYear < 0 ? period.startYear + 1 : period.startYear,
        endYear = period.endYear < 0 ? period.endYear + 1 : period.endYear;

    const start = startYear + (period.startMonth ? (period.startMonth - 1) / 12 : .5) + (period.startDay ? period.startDay / (12 * 30) : (.5 / 12)),
        end = endYear + (period.endMonth ? (period.endMonth - 1) / 12 : .5) + (period.endDay ? period.endDay / (12 * 30) : (.5 / 12))

    return {start, end}
}
