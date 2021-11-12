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
            name: 'ShowLesson',
            placeholder: 'Лекция',
            type: FILTER_FIELD_TYPE.CHECKBOX,
            value: filter ? filter.ShowLesson : false
        },
        {
            name: 'ShowSubLesson',
            placeholder: 'Доп.эпизод',
            type: FILTER_FIELD_TYPE.CHECKBOX,
            value: filter ? filter.ShowSubLesson : false
        }

    ];

    const resultFields = initialFields.filter(f => !disableFields.includes(f.name));

    return [...resultFields];
};

export const resizeHandler = (rowCount: number) => {
    const _form = $('.js-unpublished'),
        _height = _form.height(),
        _width = _form.width();

    if (window.$$('unpublished-records-grid-table')) {
        const _headerHeight = window.$$('unpublished-records-grid-table').config.headerRowHeight;

        setTimeout(() => {
            let _gridHeight = _height - _headerHeight

            const _calcHeight = (rowCount * 49) + _headerHeight
            _gridHeight = _calcHeight > _gridHeight ? _calcHeight : _gridHeight
            window.$$('unpublished-records-grid-table').$setSize(_width, _gridHeight)
        }, 0)

    }
};

export const grid2grid = (data, id) => {
    data.value = data.value || data.title;
    return data;
};

const trueFalseArray = [true, false];

// Эти функции не используются, но их можно пока оставить на будущее, если надо будет сохранять в url фильтр списка,
// НО!!! Если подключать, внимательно проверить и избавиться от trueFalseArray!!!

export const parseParams = ({courseName = null, lessonName = null}) => {
    const paramsData = {};
    const params = new URLSearchParams(location.search),
        CourseName = params.get("course_name_unpublished"),
        LessonName = params.get("lesson_name_unpublished"),
        ShowLesson = params.get('showLesson'),
        ShowSubLesson = params.get('showSubLesson');

    let _order = params.get('order');
    if (_order) {
        _order = _order.split(',');
        paramsData.order = {field: _order[0], direction: _order[1] ? _order[1] : GRID_SORT_DIRECTION.ACS}
    }

    const _filter = convertParam2Filter(
        {
            courseName: courseName ? courseName : CourseName,
            lessonName: lessonName ? lessonName : LessonName,
            showLesson: ShowLesson,
            showSubLesson: ShowSubLesson
        });

    if (_filter) {
        paramsData.filter = _filter
    }

    return paramsData
}

const convertParam2Filter = ({courseName, lessonName, showLesson, showSubLesson}) => {
    if (!(courseName ||
        lessonName || showLesson || showSubLesson)) return null;

    const filter = {};
    filter.CourseNameUnpublished = courseName ? courseName : '';
    filter.LessonNameUnpublished = lessonName ? lessonName : '';
    filter.ShowLesson = trueFalseArray.includes(showLesson) ? showLesson : undefined;
    filter.ShowSubLesson =  trueFalseArray.includes(showSubLesson) ? showSubLesson : undefined;

    return filter
};

export const convertFilter2Params = (filter) => {
    let _data = {};

    if (filter) {
        _data.course_name_unpublished = filter.CourseNameUnpublished ? filter.CourseNameUnpublished : undefined;
        _data.lesson_name_unpublished = filter.LessonNameUnpublished ? filter.LessonNameUnpublished : undefined;

        if(trueFalseArray.includes(filter.ShowLesson) ){
            _data.showLesson = filter.ShowLesson
        }

        if(trueFalseArray.includes(filter.ShowSubLesson)){
            _data.showSubLesson = filter.ShowSubLesson
        }

    }

    return _data
};
