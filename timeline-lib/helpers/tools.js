import {Event} from "../types/event"

export function calcEventPointPosition(event: Event) {
    const year = event.year < 0 ? event.year + 1 : event.year

    return year + (event.month ? (event.month - 1) / 12 : .5) + (event.day ? event.day / (12 * 30) : (.5 / 12))
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

export function calcDisplayDate(day, month, year) {
    const BC = year < 1,
        absYear = Math.abs(year),
        dayText = day ? day + "." : "",
        monthText = month ? month + "." : "";

    return `${dayText}${monthText}${absYear}${BC ? " до нэ" : ""}`
}

export const VERTICAL_STEP = 50;
