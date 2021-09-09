import {FILTER_FIELD_TYPE} from "../../../components/filter/types";
import $ from "jquery";
import {GRID_SORT_DIRECTION} from "../../../constants/common";

//todo change it for dashboard-records

export const getFilterConfig = (filter, disableFields = []) => {
    const initialFields = [
        {
            name: "CourseName",
            placeholder: "Название курса",
            type: FILTER_FIELD_TYPE.AUTOCOMPLETE,
            value: filter ? filter.CourseName : null,
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
        Name = _params.get("Name"),
        TypeOfUse = _params.get("TypeOfUse"),
        LessonOrCourse = _params.get("LessonOrCourse"),
        State = _params.get("State"),
        Order = _params.get("Order"),
        HasScript = _params.get("HasScript");

    let _order = _params.get('order');
    if (_order) {
        _order = _order.split(',');
        paramsData.order = {field: _order[0], direction: _order[1] ? _order[1] : GRID_SORT_DIRECTION.ACS}
    }

    const _filter = convertParam2Filter(
        {
            Name,
            TypeOfUse,
            LessonOrCourse,
            State,
            Order,
            HasScript
        });

    if (_filter) {
        paramsData.filter = _filter
    }

    return paramsData
}

const convertParam2Filter = ({Name, TypeOfUse, LessonOrCourse, State, Order, HasScript}) => {

    if (!(Name ||
        TypeOfUse ||
        LessonOrCourse ||
        State ||
        Order ||
        HasScript)) return null;

    const filter = {};
    filter.Name = Name && Name.length > 0 ? Name : '';
    filter.TypeOfUse = (TypeOfUse !== null && TypeOfUse !== undefined) ? +TypeOfUse : '';
    filter.LessonOrCourse = LessonOrCourse ? LessonOrCourse : '';
    filter.State = (State !== null && State !== undefined) ? +State : '';
    filter.Order = Order ? +Order : '';
    filter.HasScript = (HasScript !== null && HasScript !== undefined) ? +HasScript : '';


    return filter
};

export const resizeHandler = (rowCount: number) => {
    const _form = $('.form'),
        _height = _form.height(),
        _width = _form.width()

    if (window.$$('dashboard-records-grid')) {
        const _headerHeight = window.$$('dashboard-records-grid').config.headerRowHeight;


        setTimeout(() => {
            let _gridHeight = _height - _headerHeight - 48

            const _calcHeight = (rowCount * 80) + _headerHeight + 60
            _gridHeight = _calcHeight > _gridHeight ? _calcHeight : _gridHeight
            window.$$('dashboard-records-grid').$setSize(_width, _gridHeight)
        }, 0)

    }
};

export const refreshColumns = (config) => {

    if (window.$$('dashboard-records-grid')) {
        window.$$('dashboard-records-grid').refreshColumns(config)

        // const _form = $('.form'),
        //     _height = _form.height(),
        //     _width = _form.width();

        // setTimeout(() => {
            // let _gridHeight = _height - _headerHeight - 48

            // const _calcHeight = (rowCount * 80) + _headerHeight + 60
            // _gridHeight = _calcHeight > _gridHeight ? _calcHeight : _gridHeight
            // window.$$('dashboard-records-grid').$setSize()
        // }, 0)
    }
}

export const convertFilter2Params = (filter) => {
    let _data = {};

    if (filter) {
        if(filter.Name && filter.Name.length > 0) { _data.Name = filter.Name }

        if(filter.TypeOfUse !== null && filter.TypeOfUse !== undefined && filter.TypeOfUse !== "") { _data.TypeOfUse = filter.TypeOfUse}

        if(filter.LessonOrCourse && filter.LessonOrCourse !== "") { _data.LessonOrCourse = filter.LessonOrCourse }

        if(filter.State && filter.State !== "") { _data.State = filter.State }

        if(filter.Order && filter.Order !== "") { _data.Order = filter.Order }

        if(filter.HasScript !== null && filter.HasScript !== undefined &&  filter.HasScript !== "" ) { _data.HasScript = filter.HasScript }
    }

    return _data
};
