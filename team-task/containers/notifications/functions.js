import {FILTER_FIELD_TYPE} from "../../components/filter/types";
import $ from "jquery";
import {GRID_SORT_DIRECTION} from "../../constants/common";
import {NOTIFICATION_TYPES} from "../../constants/notifications";

export const getFilterConfig = (filter, disableFields = []) => {
    const initialFields = [
        {
            name: "NotRead",
            placeholder: "Актуальность",
            type: FILTER_FIELD_TYPE.SELECT,
            options: [{value: 1, label: 'Непрочитанные'}], //1 = true, 2 = false
            value: filter ? filter.NotRead : null
        },
        {
            name: "Urgent",
            placeholder: "Приоритет",
            type: FILTER_FIELD_TYPE.COMBO,
            options: [{value: 1, label: 'Срочные'},{value: 2, label: 'Штатные'}], //1 = true, 2 = false
            value: filter ? filter.Urgent : null
        },
        {
            name: "NotifType",
            placeholder: "Тип уведомления",
            type: FILTER_FIELD_TYPE.COMBO,
            options: Object.entries(NOTIFICATION_TYPES).map(ent => ({value: +ent[0], label: ent[1]})), // +ent - parse to Number
            value: filter ? filter.NotifType : null
        },

        {
            name: "UserName",
            placeholder: 'Имя пользователя',
            type: FILTER_FIELD_TYPE.TEXT,
            value: filter ? filter.UserName : null
        }
    ];

    const resultFields = initialFields.filter(f => !disableFields.includes(f.name));

    return [...resultFields];
};

export const parseParams = () => {
    const paramsData = {};
    const _params = new URLSearchParams(location.search),
        notRead = _params.get("notRead"),
        urgent = _params.get("urgent"),
    notifType = _params.get("notifType"),
    userName = _params.get("userName");

    let _order = _params.get('order');
    if (_order) {
    _order = _order.split(',')
        paramsData.order = {field: _order[0], direction: _order[1] ? _order[1] : GRID_SORT_DIRECTION.ACS}
    }

    const _filter = convertParam2Filter({notRead, urgent, notifType, userName});

    if (_filter) {
        paramsData.filter = _filter
    }

    return paramsData
}

const convertParam2Filter = ({notRead, urgent, notifType, userName}) => {
    if (!(notRead || urgent || notifType || userName)) return null;

    const filter = {};
    filter.NotRead = (notRead !== null && notRead !== undefined) ? +notRead : '';
    filter.Urgent = (urgent !== null && urgent !== undefined) ? urgent.split(',').map(pr => +pr) : '';
    filter.NotifType = (notifType !== null &&  notifType !== undefined) ? notifType.split(',').map(pr => +pr) : '';
    filter.UserName = userName && userName.length > 0 ? userName : '';

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
        if(filter.NotRead) {
            filter.NotRead === 1 ?
                _data.notRead = +filter.NotRead : delete _data.notRead;
        } //cause its for SELECT (+filter.NotRead) and delete for not perform to pass param 'notRead'
        if(filter.Urgent) {_data.urgent = filter.Urgent.join(',')}
        if(filter.NotifType) {_data.notifType = filter.NotifType.join(',')}
        if(filter.UserName) {_data.userName = filter.UserName}
    }

    return _data
};
