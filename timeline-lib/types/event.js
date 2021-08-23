export type Event = {
    id: number,
    name: string,
    color: string,
    day: number,
    month: number,
    year: number,
    visible: boolean,
    displayDate: string,
    calculatedDate: number,
    width: number,
    left: number,

    // startDateYearNumber = 1920
    // isLastPoint: boolean,
    yLevel: number,
    offset: number,
    xStart: number,
    xEnd: number,
    repositioned: boolean,
}
