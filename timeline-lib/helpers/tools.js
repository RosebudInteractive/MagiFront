import {Event} from "../types/event"

export function calcEventPointPosition(event: Event) {
    return event.year + (event.month ? (event.month - 1) / 12 : .5) + (event.day ? event.day / (12 * 30) : (.5 / 12))
}

export function isArrayEquals(array1, array2) {
    return array1.length === array2.length && array1.every((value, index) => value === array2[index])
}

export function calcScaleY(level, top) {

    if (level === 0) return 1

    const height = (level + 1) * VERTICAL_STEP - top,
        noScaleHeight = VERTICAL_STEP - top;

    return height / noScaleHeight;
}

export const VERTICAL_STEP = 50;
