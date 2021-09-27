import {FILTER_FIELD_TYPE} from "../../../components/filter/types";
import $ from "jquery";
import {GRID_SORT_DIRECTION} from "../../../constants/common";
import moment from "moment";
import {DASHBOARD_PROCESS_STATE} from "../../../constants/states";

export const getFilterConfig = (filter, disableFields = [], courseOptions = []) => {
    const initialFields = [
        {
            name: "Course",
            placeholder: "Название курса",
            type: FILTER_FIELD_TYPE.AUTOCOMPLETE,
            value: filter ? filter.Course : null,
            options: courseOptions
        },
        {
            name: "DateRange",
            placeholder: "Период",
            type: FILTER_FIELD_TYPE.DATE_RANGE,
            value: (function () {
                if (filter && filter.DateRange && filter.DateRange.length === 2 && filter.DateRange.every(date => date !== null && date !== undefined)) {
                    console.log('dateranges');
                    console.log(filter.DateRange[0]);
                    console.log(filter.DateRange[1]);
                    return [new Date(filter.DateRange[0]), new Date(filter.DateRange[1])]
                }

                return null;
            })()
        },
    ];

    const resultFields = initialFields.filter(f => !disableFields.includes(f.name));

    return [...resultFields];
};

export const parseParams = () => {
    const paramsData = {};
    const _params = new URLSearchParams(location.search),
        Course = _params.get("course"),
        DateRangeStart = _params.get("st_date"),
        DateRangeEnd = _params.get("fin_date");

    const DateRange = [DateRangeStart, DateRangeEnd];

    let _order = _params.get('order');
    if (_order) {
        _order = _order.split(',');
        paramsData.order = {field: _order[0], direction: _order[1] ? _order[1] : GRID_SORT_DIRECTION.ACS}
    }

    const _filter = convertParam2Filter(
        {
            Course,
            DateRange
        });

    if (_filter) {
        paramsData.filter = _filter
    }

    return paramsData
};

const convertParam2Filter = ({Course, DateRange}) => {
    if (!(Course ||
        DateRange)) return null;

    const filter = {};

    filter.Course = Course ? +Course : '';
    filter.DateRange = DateRange && DateRange.length === 2 && DateRange.every(d => d !== null && d !== undefined) ? DateRange : null;

    return filter
};

export const resizeHandler = (rowCount, afterResize) => {
    const _form = $('.form'),
        _height = _form.height(),
        _width = _form.width();


    if (window.$$('dashboard-records-grid')) {
        const _headerHeight = window.$$('dashboard-records-grid').config.headerRowHeight;

        setTimeout(() => {
            let _gridHeight = _height - _headerHeight - 48;

            const _calcHeight = (rowCount * 80) + _headerHeight + 60 + Math.ceil((rowCount/7)* 15); //todo check it
            _gridHeight = (_calcHeight && _calcHeight > 0 && !isNaN(_calcHeight))  ? _calcHeight : _gridHeight;

            window.$$('dashboard-records-grid').$setSize(_width, _gridHeight);
            $('.horizontal-scroll-grid').height(_gridHeight);
        }, 200)

    }
};

export const refreshColumns = (config, {needRefresh, recordsCount}) => {
    const grid = window.$$('dashboard-records-grid')

    if (grid) {
        grid.refreshColumns(config);

        // if (needRefresh) { // i dont know - it need?
        //     const INTERVAL = 100
        //
        //     let time = 0,
        //         interval = setInterval(() => {
        //             time += INTERVAL
        //             resizeHandler(recordsCount)
        //             grid.adjust();
        //             if (time >= 300) {
        //                 clearInterval(interval)
        //                 interval = null
        //             }
        //         }, INTERVAL);
        // }
    }
};

export const convertFilter2Params = (filter) => {
    let _data = {};

    if (filter) {
        if (filter.Course) {
            _data.course = filter.Course
        }
        if (filter.DateRange) {
            const dates = filter.DateRange;

            if (dates.length === 2 && dates.every(d => d !== null && d !== undefined)) {
                _data.st_date = `${moment(dates[0]).locale('ru').toISOString()}`;
                _data.fin_date = `${moment(dates[1]).locale('ru').toISOString()}`;
            }
        }
    }

    return _data
};


export const getProcessState = (val) => {
    if (val) {
        const processState = Object.values(DASHBOARD_PROCESS_STATE).find(prS => prS.value === val);
        return processState ? {css: processState.css, label: processState.label} : {css: "", label: "--"};
    } else {
        return {css: '', label: ''}
    }
};