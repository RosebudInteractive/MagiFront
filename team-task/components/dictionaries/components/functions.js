import {FILTER_FIELD_TYPE} from "../../../components/filter/types";
import $ from "jquery";
import {GRID_SORT_DIRECTION} from "../../../constants/common";

export const getFilterConfig = (filter, supervisors) => {
    return [
        {
            name: "Name",
            placeholder: "Имя компонента",
            type: FILTER_FIELD_TYPE.TEXT,
            value: filter ? filter.Name : null
        },
        {
            name: "SupervisorName",
            placeholder: "Ответственный",
            type: FILTER_FIELD_TYPE.TEXT,
            value: filter ? filter.SupervisorName : null
        },
        {
            name: "StructName",
            placeholder: "Структура Проекта",
            type: FILTER_FIELD_TYPE.TEXT,
            value: filter ? filter.StructName : null
        }
    ]
}

export const parseParams = () => {
    const paramsData = {};
    const _params = new URLSearchParams(location.search),
        name = _params.get("name"),
        supervisor = _params.get("supervisor"),
        structName = _params.get("structName");

    let _order = _params.get('order');
    if (_order) {
    _order = _order.split(',')
        paramsData.order = {field: _order[0], direction: _order[1] ? _order[1] : GRID_SORT_DIRECTION.ACS}
    }

    const _filter = convertParam2Filter({name, supervisor, structName});
    if (_filter) {
        paramsData.filter = _filter
    }

    return paramsData
}

const convertParam2Filter = ({name, supervisor, structName}) => {
    if (!(name || supervisor || structName)) return null;

    const filter = {};
    filter.Name = name ? name : '';
    filter.SupervisorName = supervisor ? supervisor : '';
    filter.StructName = structName ? structName : '';

    return filter
};

export const resizeHandler = (rowCount: number) => {
    const _form = $('.form'),
        _height = _form.height(),
        _width = _form.width()

    if (window.$$('dictionary-users-grid')) {
        const _headerHeight = window.$$('dictionary-components-grid').config.headerRowHeight


        setTimeout(() => {
            let _gridHeight = _height - _headerHeight - 48

            const _calcHeight = (rowCount * 80) + _headerHeight + 60
            _gridHeight = _calcHeight > _gridHeight ? _calcHeight : _gridHeight
            window.$$('dictionary-components-grid').$setSize(_width, _gridHeight)
        }, 0)

    }
}

export const convertFilter2Params = (filter) => {
    let _data = {};

    if (filter) {
        if(filter.Name) { _data.name = filter.Name}
        if (filter.SupervisorName) {_data.supervisor = filter.SupervisorName}
        if (filter.StructName) {_data.structName = filter.StructName}
    }

    return _data
};
