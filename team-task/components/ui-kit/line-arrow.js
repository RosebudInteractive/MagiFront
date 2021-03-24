import React, {useEffect, useMemo, useRef, useState} from "react"
import {COMMENT_ACTION} from "../../constants/common";

export const ARROW_TYPE = {
    DEFAULT: "DEFAULT",
    IN: "IN",
    OUT: "OUT"
}

export type ArrowType = $Values<typeof ARROW_TYPE>

type ArrowProps = {
    source: string,
    dest: string,
    type: ArrowType,
}

export default function LineArrow(props: ArrowProps) {
    const {source, dest, type} = props
    const line = useRef()

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
        }, 300)

        return () => {
            if (line.current) {line.current.remove()}
        }
    }, [])

    useEffect(() => {}, [type])
}
