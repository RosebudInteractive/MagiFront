import React, { useEffect, useMemo, useRef, useState, } from 'react';
import placeByYLevelLimit from '../../helpers/placeByLevel';
import AnimatedPeriod from './item';
import { calcDisplayDate, calcPeriodPoints } from '../../helpers/tools';
import { ItemType } from '../../types/common';
export default function PeriodSections(props) {
    const { startDate, yearPerPixel, periods, levelLimit, y, elementsOverAxis, onItemClick, activeItem, } = props;
    const [verticallyAlignedPeriods, setVerticallyAlignedPeriods] = useState([]);
    const didMountRef = useRef(0);
    useEffect(() => {
        if (didMountRef.current === 0) {
            didMountRef.current += 1;
        }
    }, [periods]);
    const onClickedElement = (id) => {
        if (onItemClick) {
            onItemClick({ type: ItemType.Period, id });
        }
    };
    useEffect(() => {
        if (periods.length > 0) {
            const periodsWithCoords = periods.map((item) => {
                const { start, end } = calcPeriodPoints(item);
                const xStart = Math.abs(start - startDate) * yearPerPixel;
                const xEnd = Math.abs(end - startDate) * yearPerPixel;
                return {
                    ...item, yLevel: 0, xLevel: 0, xStart, xEnd,
                };
            });
            const alignedPeriods = placeByYLevelLimit(periodsWithCoords, levelLimit || 0);
            alignedPeriods.forEach((item) => {
                const calculatedStartDate = calcDisplayDate(item.startDay, item.startMonth, item.startYear);
                const calculatedEndDate = calcDisplayDate(item.endDay, item.endMonth, item.endYear);
                // eslint-disable-next-line no-param-reassign
                item.displayDate = `${calculatedStartDate} - ${calculatedEndDate}`;
                // eslint-disable-next-line no-param-reassign
                item.y = elementsOverAxis ? (y - 30) - (item.yLevel * 30) : (y + 30) + (item.yLevel * 30);
                // eslint-disable-next-line no-param-reassign
                item.title = item.name;
            });
            setVerticallyAlignedPeriods(alignedPeriods);
        }
    }, [periods, startDate, yearPerPixel, levelLimit, elementsOverAxis, y]);
    const periodSections = useMemo(() => (verticallyAlignedPeriods.length > 0
        ? verticallyAlignedPeriods.map((period, index, array) => {
            const isActive = period.id === activeItem;
            return (<AnimatedPeriod period={period} startX={period.xStart} endX={period.xEnd} y={period.y} visible={period.visible} key={period.id} isActive={isActive} index={array.length - index - 1} onClick={onClickedElement}/>);
        })
        : null), [verticallyAlignedPeriods, activeItem]);
    return <React.Fragment>{periodSections}</React.Fragment>;
}
