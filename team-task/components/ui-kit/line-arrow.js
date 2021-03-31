import React, {useEffect, useMemo, useRef, useState} from "react"

export const ARROW_TYPE = {
    DEFAULT: "DEFAULT",
    IN: "IN",
    OUT: "OUT"
}

export type ArrowType = $Values<typeof ARROW_TYPE>

type ArrowProps = {
    source: string,
    dest: string,
    scrollPosition: number,
    type: ArrowType,
    delay: ?number
}

export default function LineArrow(props: ArrowProps) {
    const {source, dest, type, scrollPosition, delay} = props
    const line = useRef(),
        svgContainer = useRef()

    useEffect(() => {
        setTimeout(() => {
            const startElement = document.getElementById(source),
                endElement = document.getElementById(dest),
                options = {
                    color: (type === ARROW_TYPE.OUT) ? "#C8684C" :
                        (type === ARROW_TYPE.IN) ? "#D1941A" : "#9696A0",
                    size: 2,
                    startSocket: 'right',
                    endSocket: 'left',
                    startSocketGravity: 62,
                    endSocketGravity: 62,
                }


            line.current = new LeaderLine(startElement, endElement, options)

            const _path = $(`#leader-line-${line.current._id}-line-path`)
            if (_path && _path.parent() && _path.parent()) {
                svgContainer.current = _path.parent().parent()
                toggleArrowActive()
            }


        }, delay ? delay : 0)

        return () => {
            if (line.current) {
                line.current.remove()
            }
        }
    }, [])

    useEffect(() => {
        if (line.current) {
            line.current.color = (type === ARROW_TYPE.OUT) ?
                "#C8684C"
                :
                (type === ARROW_TYPE.IN) ? "#D1941A" : "#9696A0"
        }

        toggleArrowActive()
    }, [type])

    useEffect(() => {
        if (line.current) {line.current.position()}
    }, [scrollPosition])

    const toggleArrowActive = () => {
        if (!svgContainer.current) return

        if ((type === ARROW_TYPE.OUT) || (type === ARROW_TYPE.IN)) {
            svgContainer.current.addClass("_active")
        } else {
            svgContainer.current.removeClass("_active")
        }
    }

    return null
}
