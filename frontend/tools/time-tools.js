export const getTimeFmt = (time) => {
    let date = new Date(time * 1000),
        hh = date.getUTCHours(),
        mm = date.getUTCMinutes(),
        ss = date.getSeconds();

    return (hh ? (hh.toString() + ':') : '') +
        (hh ? mm.toString().padStart(2, '0') : mm.toString()) + ':' +
        ss.toString().padStart(2, '0')
};

export const getDaysBetween = (date1, date2) => {
    let _date1 = isDate(date1) ? date1 : new Date(date1),
        _date2 = isDate(date2) ? date2 : new Date(date2);

    //Get 1 day in milliseconds
    let one_day=1000*60*60*24;

    // Convert both dates to milliseconds
    let date1_ms = _date1.getTime();
    let date2_ms = _date2.getTime();

    // Calculate the difference in milliseconds
    let difference_ms = date2_ms - date1_ms;

    // Convert back to days and return
    return Math.round(difference_ms/one_day);
}

export const getMonthBetween = (date1, date2) => {
    let _year1 = date1.getFullYear(),
        _year2 = date2.getFullYear(),
        _month1 = date1.getMonth(),
        _month2 = date2.getMonth();

    return Math.abs((_year2 - _year1) * 12 + (_month2 - _month1));
}

export const getSeasonBetween = (date1, date2) => {
    let _month1 = date1.getMonth(),
        _month2 = date2.getMonth(),
        _year1 = (_month1 === 11) ? (date1.getFullYear() + 1) : date1.getFullYear(),
        _year2 = (_month2 === 11) ? (date2.getFullYear() + 1) : date2.getFullYear(),
        _season1 = _getSeasonIndex(date1),
        _season2 = _getSeasonIndex(date2);

    return Math.abs((_year2 - _year1) * 4 + (_season2 - _season1));
}

export const getHistoryFormatDate = (date) => {
    let _date = isDate(date) ? date : new Date(date),

        _year = _date.getFullYear(),
        _month = _date.getMonth(),
        _day = _date.getDate(),
        _hours = _date.getHours(),
        _minutes = _date.getMinutes();

    let _today = new Date(),
        _todayYear = _today.getFullYear(),
        _todayMonth = _today.getMonth(),
        _todayDay = _today.getDate();

    let _isLastVisitToday = (_year === _todayYear) && (_month === _todayMonth) && (_day === _todayDay);

    return {
        date: _date,
        day: _isLastVisitToday ? "Сегодня" : _day + ' ' + Months[_month] + ' ' + _year,
        time: _hours + ':' + _minutes
    }
}

const isDate = (value) => {
    return value instanceof Date && !isNaN(value.valueOf())
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


export const parseReadyDate = (date) => {
    let result = {
        readyYear : '',
        readyMonth : ''
    }

    if (date) {
        let _now = new Date(),
            _monthDelta = getMonthBetween(_now, date);

        result.readyYear = date.getFullYear();

        if (_monthDelta > 9) {
            result.readyMonth = '';
        } else {
            if (getSeasonBetween(_now, date) > 1) {
                result.readyMonth = getSeason(date);
                if (date.getMonth() === 11) {
                    result.readyYear++
                }
            } else {
                result.readyMonth = Months[_readyDate.getMonth()];
            }
        }
    }

    return result
}

const Months = [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь',
];

const Seasons = [
    'Зима',
    'Весна',
    'Лето',
    'Осень',
]