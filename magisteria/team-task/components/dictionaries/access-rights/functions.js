import {FILTER_FIELD_TYPE} from "../../filter/types";
import $ from "jquery";
import {GRID_SORT_DIRECTION} from "../../../constants/common";

export const getFilterConfig = (filter, supervisors) => {
    return [
        {
            name: "Code",
            placeholder: "Код",
            type: FILTER_FIELD_TYPE.TEXT,
            value: filter ? filter.Code : null
        },
        {
            name: "Name",
            placeholder: "Название",
            type: FILTER_FIELD_TYPE.TEXT,
            value: filter ? filter.Name : null
        }
    ]
};

export const parseParams = () => {
    const paramsData = {};
    const _params = new URLSearchParams(location.search),
        name = _params.get("Name"),
        code = _params.get("Code");

    let _order = _params.get('order');
    if (_order) {
    _order = _order.split(',')
        paramsData.order = {field: _order[0], direction: _order[1] ? _order[1] : GRID_SORT_DIRECTION.ACS}
    }

    const _filter = convertParam2Filter({name, code});
    if (_filter) {
        paramsData.filter = _filter
    }

    return paramsData
}

const convertParam2Filter = ({name, code}) => {
    if (!(name || code)) return null;

    const filter = {};
    filter.Name = name ? name : '';
    filter.Code = code ? code : '';

    return filter
};

export const resizeHandler = (rowCount: number) => {
    const _form = $('.form'),
        _height = _form.height(),
        _width = _form.width()

    if (window.$$('dictionary-rights-grid')) {
        const _headerHeight = window.$$('dictionary-rights-grid').config.headerRowHeight;


        setTimeout(() => {
            let _gridHeight = _height - _headerHeight - 48

            const _calcHeight = (rowCount * 80) + _headerHeight + 60
            _gridHeight = _calcHeight > _gridHeight ? _calcHeight : _gridHeight
            window.$$('dictionary-rights-grid').$setSize(_width, _gridHeight)
        }, 0)

    }
}

export const convertFilter2Params = (filter) => {
    let _data = {};

    if (filter) {
        if(filter.Name) { _data.Name = filter.Name}
        if (filter.Code) {_data.Code = filter.Code}
    }

    return _data
};
