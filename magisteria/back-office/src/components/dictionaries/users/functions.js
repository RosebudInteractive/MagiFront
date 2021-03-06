import {FILTER_FIELD_TYPE} from "../../filter/types";
import $ from "jquery";
import {GRID_SORT_DIRECTION} from "../../../constants/common";
import {USER_ROLE_STRINGS} from "../../../constants/dictionary-users";

export const getFilterConfig = (filter) => {
    return [
        {
            name: "DisplayName",
            placeholder: "Имя",
            type: FILTER_FIELD_TYPE.TEXT,
            value: filter ? filter.DisplayName : null
        },
        {
            name: "Email",
            placeholder: "Почта",
            type: FILTER_FIELD_TYPE.TEXT,
            value: filter ? filter.Email : null
        },
        {
            name: "Role",
            placeholder: "Роль",
            type: FILTER_FIELD_TYPE.COMBO,
            options: Object.entries(USER_ROLE_STRINGS).map(role => ({value: role[0], label: role[1]})),
            value: filter ? filter.Role : null
        }
    ]
}

export const parseParams = () => {
    const paramsData = {};
    const _params = new URLSearchParams(location.search),
        role = _params.get("role"),
        name = _params.get("name"),
        email = _params.get("email");

    let _order = _params.get('order');
    if (_order) {
    _order = _order.split(',')
        paramsData.order = {field: _order[0], direction: _order[1] ? _order[1] : GRID_SORT_DIRECTION.ACS}
    }

    const _filter = convertParam2Filter({role, name, email});
    if (_filter) {
        paramsData.filter = _filter
    }

    return paramsData
}

const convertParam2Filter = ({role, name, email}) => {
    if (!(role || name || email)) return null;

    const filter = {};
    filter.Role = role ? role.split(",") : '';
    filter.Email = email ? email : '';
    filter.DisplayName = name ? name : '';

    return filter
};

export const resizeHandler = (rowCount: number) => {
    const _form = $('.form'),
        _height = _form.height(),
        _width = _form.width()

    if (window.$$('dictionary-users-grid')) {
        const _headerHeight = window.$$('dictionary-users-grid').config.headerRowHeight


        setTimeout(() => {
            let _gridHeight = _height - _headerHeight - 48

            const _calcHeight = (rowCount * 80) + _headerHeight + 60
            _gridHeight = _calcHeight > _gridHeight ? _calcHeight : _gridHeight
            window.$$('dictionary-users-grid').$setSize(_width, _gridHeight)
        }, 0)

    }
}

export const convertFilter2Params = (filter) => {
    let _data = {};

    if (filter) {
        if(filter.Role) { _data.role = filter.Role.join(',')}
        if (filter.DisplayName) {_data.name = filter.DisplayName}
        if (filter.Email) {_data.email = filter.Email}
    }

    return _data
};
