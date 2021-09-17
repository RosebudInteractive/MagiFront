import {FILTER_FIELD_TYPE} from "../../../components/filter/types";
import $ from "jquery";
import {GRID_SORT_DIRECTION} from "../../../constants/common";

export const getFilterConfig = (filter, disableFields = [], {courseOptions = [], lessonOptions = []}) => {
    const initialFields = [
        {
            name: "CourseNameUnpublished",
            placeholder: "Курс",
            type: FILTER_FIELD_TYPE.AUTOCOMPLETE,
            value: filter ? filter.CourseNameUnpublished : null,
            options: courseOptions
        },
        {
            name: "LessonNameUnpublished",
            placeholder: "Лекция",
            type: FILTER_FIELD_TYPE.AUTOCOMPLETE,
            value: filter ? filter.LessonNameUnpublished : null,
            options: lessonOptions
        },
    ];

    const resultFields = initialFields.filter(f => !disableFields.includes(f.name));

    return [...resultFields];
};

export const parseParams = ({courseName = null, lessonName = null}) => {
    const paramsData = {};
    const params = new URLSearchParams(location.search),
        CourseName = params.get("course_name_unpublished"),
        LessonName = params.get("lesson_name_unpublished");

    let _order = params.get('order');
    if (_order) {
        _order = _order.split(',');
        paramsData.order = {field: _order[0], direction: _order[1] ? _order[1] : GRID_SORT_DIRECTION.ACS}
    }

    const _filter = convertParam2Filter(
        {
            courseName: courseName ? courseName : CourseName,
            lessonName: lessonName ? lessonName : LessonName
        });

    if (_filter) {
        paramsData.filter = _filter
    }

    return paramsData
}

const convertParam2Filter = ({courseName, lessonName}) => {

    if (!(courseName ||
        lessonName)) return null;

    const filter = {};
    filter.CourseNameUnpublished = courseName ? courseName : '';
    filter.LessonNameUnpublished = lessonName ? lessonName : '';


    return filter
};

export const resizeHandler = (rowCount: number) => {
    const _form = $('.unpublished-records'),
        _height = _form.height(),
        _width = _form.width();

    if (window.$$('unpublished-records-grid-table')) {
        const _headerHeight = window.$$('unpublished-records-grid-table').config.headerRowHeight;


        setTimeout(() => {
            let _gridHeight = _height - _headerHeight - 48

            const _calcHeight = (rowCount * 80) + _headerHeight + 60
            _gridHeight = _calcHeight > _gridHeight ? _calcHeight : _gridHeight
            window.$$('unpublished-records-grid-table').$setSize(_width, _gridHeight)
        }, 0)

    }
};

export const showColumn  = (columnName, options) => {
    !window.$$('dashboard-records-grid').isColumnVisible(columnName) && window.$$('dashboard-records-grid').showColumn(columnName, options)
};

export const convertFilter2Params = (filter) => {
    let _data = {};

    if (filter) {
        _data.course_name_unpublished = filter.CourseNameUnpublished ? filter.CourseNameUnpublished : undefined,
        _data.lesson_name_unpublished = filter.LessonNameUnpublished ? filter.LessonNameUnpublished : undefined;
    }

    return _data
};
