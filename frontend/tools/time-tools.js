export const getTimeFmt = (time) => {
    let date = new Date(time * 1000),
        hh = date.getUTCHours(),
        mm = date.getUTCMinutes(),
        ss = date.getSeconds();

    return (hh ? (hh.toString() + ':') : '') +
        (hh ? mm.toString().padStart(2, '0') : mm.toString()) + ':' +
        ss.toString().padStart(2, '0')
};

export const getMonthBetween = (date1, date2) => {
    let _year1 = date1.getFullYear(),
        _year2 = date2.getFullYear(),
        _month1 = date1.getMonth(),
        _month2 = date2.getMonth();

    return Math.abs((_year2 - _year1) * 12 + (_month2 - _month1));
}

export  const getSeasonBetween = (date1, date2) => {
    let _month1 = date1.getMonth(),
        _month2 = date2.getMonth(),
        _year1 = (_month1 === 11) ? (date1.getFullYear() + 1) : date1.getFullYear(),
        _year2 = (_month2 === 11) ? (date2.getFullYear() + 1) : date2.getFullYear(),
        _season1 = _getSeasonIndex(date1),
        _season2 = _getSeasonIndex(date2);

    return Math.abs((_year2 - _year1) * 4 + (_season2 - _season1));
}

const _getSeasonIndex = (date) => {
    let _month = date.getMonth() + 1;
    switch (_month) {
        case 12:
        case 1:
        case 2:
            return 0;
        case 3:
        case 4:
        case 5:
            return 1;
        case 6:
        case 7:
        case 8:
            return 2;
        case 9:
        case 10:
        case 11:
            return 3;
    }
}

export const getSeason = (date) => {
    return Seasons[_getSeasonIndex(date)]
}

const Seasons = [
    'Зима',
    'Весна',
    'Лето',
    'Осень',
]