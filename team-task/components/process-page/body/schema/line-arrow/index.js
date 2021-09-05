import React, {useState, useEffect, useMemo, useCallback} from 'react';
import Xarrow from 'react-xarrows';
import './line-arrow.sass'
import ArrowTooltip from "./arrow-tooltip";

export const ARROW_TYPE = {
    DEFAULT: "DEFAULT",
    IN: "IN",
    OUT: "OUT"
}

const COLORS = {
    DEFAULT: {
        COMMON: '#9696A0',
        HOVER: '#4B4B4B'
    },
    OUT: {
        COMMON: 'rgba(200,104,76,0.6)',
        HOVER: '#C8684C'
    },
    IN: {
        COMMON: 'rgba(209,148,26,0.6)',
        HOVER: '#D1941A'
    },
    WITH_CONDITION: {
        COMMON: 'rgba(0,44,157,0.6)',
        HOVER: '#002C9D'
    }
}

export default (props) => {
    const { type, item, setSelected, selected } = props

    const [color, setColor] = useState('transparent'),
        [strokeWidth, setStrokeWidth] = useState(2),
        [headSize, setHeadSize] = useState(6),
        [hover, setHover] = useState(false)

    useEffect(() => {
        const currentColor = type === ARROW_TYPE.OUT ?
            COLORS.OUT
            :
            (type === ARROW_TYPE.IN) ?
                COLORS.IN
                :
                item.hasCondition ?
                    COLORS.WITH_CONDITION
                    :
                    COLORS.DEFAULT;

        const isArrowSelected = selected === item.id,
            colorValue = hover || isArrowSelected ? currentColor.HOVER : currentColor.COMMON

        setColor(colorValue)
        setStrokeWidth(isArrowSelected ? 3 : 2)
        setHeadSize(isArrowSelected ? 5 : 6)
    }, [props, hover])

    const passProps = useMemo(() => {
            return {
                className: 'process-schema__x-arrow' + (item.disabled ? ' _disabled' : ''),
                onMouseEnter: () => {if (!item.disabled) setHover(true)},
                onMouseLeave: () => {if (!item.disabled) setHover(false)},
                onClick: () => {
                    if (!item.disabled && setSelected) setSelected(item.id);
                },
                cursor: item.disabled ? 'default' : 'pointer',
            }
        }, [])

    const deleteArrow = useCallback(() => {
        if (props.onDeleteArrow) {
            props.onDeleteArrow(item)
        }
    }, [])

    const changeCondition = useCallback((value) => {
        if (props.onUpdateArrow) {
            const newValue = {
                Id: item.Id,
                DepTaskId: item.from,
                TaskId: item.to,
                Expression: value,
                IsConditional: !!value,
                IsActive: !item.disabled,
            }

            props.onUpdateArrow(newValue);
            setSelected(null);
        }
    }, [])

    const labels = useMemo(() => {
        const isArrowSelected = selected === item.id

        return isArrowSelected ? {
            middle: <ArrowTooltip hasCondition={item.hasCondition}
                                  condition={item.expression}
                                  onApplyCondition={changeCondition}
                                  onDeleteArrow={deleteArrow}/>
        } : null
    }, [selected])

    return <Xarrow {...props}
                   zIndex={selected === item.id ? 2 : 0}
                   passProps={passProps}
                   color={color}
                   labels={labels}
                   strokeWidth={strokeWidth}
                   headSize={headSize}/>;
};
