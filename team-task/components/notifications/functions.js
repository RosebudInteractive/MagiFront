import {FILTER_FIELD_TYPE} from "../filter/types";
import $ from "jquery";
import {GRID_SORT_DIRECTION} from "../../constants/common";

export const getFilterConfig = (filter) => {
    //todo add filter for notification type
    return [
        {
            name: "NotRead",
            placeholder: "Новизна", //todo заменить на какое-нибудь нормальное слово или оставить - подумать потом
            type: FILTER_FIELD_TYPE.COMBO,
            options: [{value: 1, label: 'Непрочитанные'},{value: 2, label: 'Прочитанные'}], //1 = true, 2 = false
            value: filter ? filter.NotRead : null
        },
        {
            name: "Urgent",
            placeholder: "Срочность",
            type: FILTER_FIELD_TYPE.COMBO,
            options: [{value: 1, label: 'Срочные'},{value: 2, label: 'Не срочные'}], //1 = true, 2 = false
            value: filter ? filter.Urgent : null
        }
    ]
};

export const parseParams = () => {
    const paramsData = {};
    const _params = new URLSearchParams(location.search),
        notRead = _params.get("notRead"),
        urgent = _params.get("urgent");

    let _order = _params.get('order');
    if (_order) {
    _order = _order.split(',')
        paramsData.order = {field: _order[0], direction: _order[1] ? _order[1] : GRID_SORT_DIRECTION.ACS}
    }

    const _filter = convertParam2Filter({notRead, urgent});

    if (_filter) {
        paramsData.filter = _filter
    }

    return paramsData
}

const convertParam2Filter = ({notRead, urgent}) => {
    if (!(notRead || urgent)) return null;

    const filter = {};
    filter.NotRead = (notRead !== null && notRead !== undefined) ? notRead.split(',') : '';
    filter.Urgent = (urgent !== null && urgent !== undefined) ? urgent.split(',') : '';

    return filter
};

export const resizeHandler = (rowCount: number) => {
    const _form = $('.form'),
        _height = _form.height(),
        _width = _form.width()

    if (window.$$('notifications-grid')) {
        const _headerHeight = window.$$('notifications-grid').config.headerRowHeight;


        setTimeout(() => {
            let _gridHeight = _height - _headerHeight - 48

            const _calcHeight = (rowCount * 80) + _headerHeight + 60
            _gridHeight = _calcHeight > _gridHeight ? _calcHeight : _gridHeight
            window.$$('notifications-grid').$setSize(_width, _gridHeight)
        }, 0)

    }
}

export const convertFilter2Params = (filter) => {
    let _data = {};

    if (filter) {
        if(filter.NotRead) {_data.notRead = filter.NotRead.join(',')}
        if(filter.Urgent) {_data.urgent = filter.Urgent.join(',')}
    }

    return _data
};
