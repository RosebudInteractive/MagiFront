import {FILTER_FIELD_TYPE} from "../../components/filter/types";
import $ from "jquery";
import {GRID_SORT_DIRECTION} from "../../constants/common";
import {TimelineStatuses, TimelineTypesOfUse} from "../../constants/timelines";

export const getFilterConfig = (filter, disableFields = []) => {
    const initialFields = [
        {
            name: "Name",
            placeholder: "Название",
            type: FILTER_FIELD_TYPE.TEXT,
            value: filter ? filter.Name : null,
        },
        {
            name: "TypeOfUse",
            placeholder: "Тип использования",
            type: FILTER_FIELD_TYPE.SELECT,
            value: filter ? filter.TypeOfUse : null,
            options: Object.entries(TimelineTypesOfUse).map(ent => ({value: +ent[0], label: ent[1]}))
        },
        {
            name: "NameOfLectionOrCourse",
            placeholder: "Название курса или лекции",
            type: FILTER_FIELD_TYPE.TEXT,
            value: filter ? filter.NameOfLectionOrCourse : null,
        },
        {
            name: "State",
            placeholder: "Состояние",
            type: FILTER_FIELD_TYPE.SELECT,
            value: filter ? filter.State : null,
            options: Object.entries(TimelineStatuses).map(ent => ({value: +ent[0], label: ent[1]}))
        },
        {
            name: "OrderNumber",
            placeholder: "Порядковый номер",
            type: FILTER_FIELD_TYPE.TEXT,
            value: filter ? filter.OrderNumber : null,
        },
        {
            name: "HasScript",
            placeholder: "Наличие скрипта",
            type: FILTER_FIELD_TYPE.SELECT,
            value: filter ? filter.HasScript : null,
            options: [
                {value: 1, label: 'Да'},
                {value: 2, label: 'Нет'}
            ]
        }
    ];

    const resultFields = initialFields.filter(f => !disableFields.includes(f.name));

    return [...resultFields];
};

export const parseParams = () => {
    const paramsData = {};
    const _params = new URLSearchParams(location.search),
        name = _params.get("name"),
        typeOfUse = _params.get("typeOfUse"),
        nameOfLectionOrCourse = _params.get("nameOfLectionOrCourse"),
        state = _params.get("state"),
        orderNumber = _params.get("orderNumber"),
        hasScript = _params.get("hasScript");

    let _order = _params.get('order');
    if (_order) {
        _order = _order.split(',')
        paramsData.order = {field: _order[0], direction: _order[1] ? _order[1] : GRID_SORT_DIRECTION.ACS}
    }

    const _filter = convertParam2Filter(
        {
            name,
            typeOfUse,
            nameOfLectionOrCourse,
            state,
            orderNumber,
            hasScript
        });

    if (_filter) {
        paramsData.filter = _filter
    }

    return paramsData
}

const convertParam2Filter = ({name, typeOfUse, nameOfLectionOrCourse, state, orderNumber, hasScript}) => {

    if (!(name ||
        typeOfUse ||
        nameOfLectionOrCourse ||
        state ||
        orderNumber ||
        hasScript)) return null;

    const filter = {};
    filter.Name = name && name.length > 0 ? name : '';
    filter.TypeOfUse = (typeOfUse !== null && typeOfUse !== undefined) ? +typeOfUse : '';
    filter.NameOfLectionOrCourse = nameOfLectionOrCourse ? nameOfLectionOrCourse : '';
    filter.State = (state !== null && state !== undefined) ? +state : '';
    filter.OrderNumber = orderNumber ? +orderNumber : '';
    filter.HasScript = (hasScript !== null && hasScript !== undefined) ? +hasScript : '';


    return filter
};

export const resizeHandler = (rowCount: number) => {
    const _form = $('.form'),
        _height = _form.height(),
        _width = _form.width()

    if (window.$$('timelines-grid')) {
        const _headerHeight = window.$$('timelines-grid').config.headerRowHeight;


        setTimeout(() => {
            let _gridHeight = _height - _headerHeight - 48

            const _calcHeight = (rowCount * 80) + _headerHeight + 60
            _gridHeight = _calcHeight > _gridHeight ? _calcHeight : _gridHeight
            window.$$('timelines-grid').$setSize(_width, _gridHeight)
        }, 0)

    }
}

export const convertFilter2Params = (filter) => {
    let _data = {};

    if (filter) {
        if(filter.Name) { _data.name = filter.Name }

        if(filter.TypeOfUse !== null && filter.TypeOfUse !== undefined) { _data.typeOfUse = filter.TypeOfUse}

        if(filter.NameOfLectionOrCourse) { _data.nameOfLectionOrCourse = filter.NameOfLectionOrCourse }

        if(filter.State) { _data.state = filter.State }

        if(filter.OrderNumber) { _data.orderNumber = filter.OrderNumber }

        if(filter.HasScript !== null && filter.HasScript !== undefined ) { _data.hasScript = filter.HasScript }
    }

    return _data
};
