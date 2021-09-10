import {FILTER_FIELD_TYPE} from "../../../components/filter/types";
import $ from "jquery";
import {GRID_SORT_DIRECTION} from "../../../constants/common";

export const getFilterConfig = (filter, disableFields = [], courseOptions = []) => {
    const initialFields = [
        {
            name: "CourseName",
            placeholder: "Название курса",
            type: FILTER_FIELD_TYPE.AUTOCOMPLETE,
            value: filter ? filter.CourseName : null,
            options: courseOptions
        },
        {
            name: "DateRange",
            placeholder: "Период",
            type: FILTER_FIELD_TYPE.DATE_RANGE,
            value: [null, null],
        },
    ];

    const resultFields = initialFields.filter(f => !disableFields.includes(f.name));

    return [...resultFields];
};

export const parseParams = () => {
    const paramsData = {};
    const _params = new URLSearchParams(location.search),
        CourseName = _params.get("CourseName"),
        DateRange = _params.get("DateRange");

    let _order = _params.get('order');
    if (_order) {
        _order = _order.split(',');
        paramsData.order = {field: _order[0], direction: _order[1] ? _order[1] : GRID_SORT_DIRECTION.ACS}
    }

    const _filter = convertParam2Filter(
        {
            CourseName,
            DateRange
        });

    if (_filter) {
        paramsData.filter = _filter
    }

    return paramsData
}

const convertParam2Filter = ({CourseName, DateRange}) => {

    if (!(CourseName ||
        DateRange)) return null;

    const filter = {};
    filter.CourseName = CourseName && CourseName.length > 0 ? CourseName : '';
    filter.DateRange = DateRange && DateRange.length === 2 && DateRange.every(d => d !== null) ? DateRange : '';


    return filter
};

export const resizeHandler = (rowCount, minWidth = null) => {
    const _form = $('.form'),
        _height = _form.height(),
        _width = _form.width(),
        setMinWidth = minWidth !== null;


    if (window.$$('dashboard-records-grid')) {
        const _headerHeight = window.$$('dashboard-records-grid').config.headerRowHeight;


        console.log('width', _width);
        setTimeout(() => {
            let _gridHeight = _height - _headerHeight - 48

            const _calcHeight = (rowCount * 80) + _headerHeight + 60
            _gridHeight = _calcHeight > _gridHeight ? _calcHeight : _gridHeight
            window.$$('dashboard-records-grid').$setSize(setMinWidth ? minWidth : _width, _gridHeight)
        }, 0)

    }
};

export const refreshColumns = (config) => {
    if (window.$$('dashboard-records-grid')) {
        window.$$('dashboard-records-grid').refreshColumns(config)
    }
}

export const convertFilter2Params = (filter) => {
    let _data = {};

    if (filter) {
        if(filter.CourseName && filter.CourseName.length > 0) { _data.CourseName = filter.CourseName }
        if(filter.DateRange !== null && filter.DateRange.every(d => d !== null)) { _data.DateRange = filter.DateRange}
    }

    return _data
};
