import React, { useEffect, useMemo, useRef, useState, } from 'react';
import placeByYLevelLimit from '../../../helpers/placeByLevel';
import AnimatedPeriod from './item';
import { ItemType } from '../../../types/common';
export default function PeriodSections(props) {
    const { startDate, yearPerPixel, periods, levelLimit, y, elementsOverAxis, onItemClick, onSetLevelsCount, activeItem, } = props;
    const [verticallyAlignedPeriods, setVerticallyAlignedPeriods] = useState([]);
    const didMountRef = useRef(0);
    useEffect(() => {
        if (didMountRef.current === 0) {
            didMountRef.current += 1;
        }
    }, [periods]);
    const onClickedElement = (item) => {
        if (onItemClick) {
            onItemClick({ type: ItemType.Period, id: item.id, item });
        }
    };
    useEffect(() => {
        if (periods.length > 0) {
            // const periodsWithCoords =
            periods.forEach((item) => {
                const xStart = Math.abs(item.calculatedDateStart - startDate) * yearPerPixel;
                const xEnd = Math.abs(item.calculatedDateEnd - startDate) * yearPerPixel;
                /* eslint-disable no-param-reassign */
                item.yLevel = 0;
                item.xStart = xStart;
                item.xEnd = xEnd;
                /* eslint-enable no-param-reassign */
                // return item;
                // return {
                //   ...item, yLevel: 0, xLevel: 0, xStart, xEnd,
                // };
            });
            const { items: alignedPeriods, levelsCount } = placeByYLevelLimit(periods, levelLimit || 0);
            alignedPeriods.forEach((item) => {
                // eslint-disable-next-line no-param-reassign
                item.y = elementsOverAxis ? (y - 30) - (item.yLevel * 30) : (y + 30) + (item.yLevel * 30);
            });
            onSetLevelsCount(levelsCount);
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
