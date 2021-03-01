import {GRID_SORT_DIRECTION} from "../../constants/common";
import {FILTER_FIELD_TYPE} from "../../components/filter/types";

export const parseParams = () => {
    const paramsData = {}

    const _params = new URLSearchParams(location.search),
        supervisor = _params.get("supervisor"),
        course = _params.get("course"),
        state = _params.get("state"),
        lesson = _params.get("lesson")

    let _order = _params.get('order')
    if (_order) {
        _order = _order.split(',')
        paramsData.order = {field: _order[0], direction: _order[1] ? _order[1] : GRID_SORT_DIRECTION.ACS}
    }

    const _filter = convertParam2Filter({supervisor, course, lesson, state})
    if (_filter) {
        paramsData.filter = _filter
    }

    return paramsData
}

const convertParam2Filter = ({supervisor, course, lesson, state}) => {
    if (!(supervisor || course || lesson || state)) return null

    const filter = {}
    filter.State = (state ? state.split(",") : []).map(item => +item)
    filter.SupervisorName = supervisor ? supervisor : ""
    filter.CourseName = course ? course : ""
    filter.LessonName = lesson ? lesson : ""

    return filter
}

export const convertFilter2Params = (filter) => {
    let _data = {}

    if (filter) {
        if (filter.State) { _data.state = filter.State.join(",") }
        if (filter.SupervisorName) { _data.supervisor = filter.SupervisorName }
        if (filter.CourseName) { _data.course = filter.CourseName }
        if (filter.LessonName) { _data.lesson = filter.LessonName }
    }

    return _data
}

export const getFilterConfig = (filter, states) => {
    return [
        {
            name: "SupervisorName",
            placeholder: "Супервизор",
            type: FILTER_FIELD_TYPE.TEXT,
            value: filter ? filter.SupervisorName : null
        },
        {
            name: "CourseName",
            placeholder: "Курс",
            type: FILTER_FIELD_TYPE.TEXT,
            value: filter ? filter.CourseName : null
        },
        {
            name: "State",
            placeholder: "Состояние задачи",
            type: FILTER_FIELD_TYPE.COMBO,
            options: states,
            value: filter ? filter.State : null
        },
        {
            name: "LessonName",
            placeholder: "Лекция",
            type: FILTER_FIELD_TYPE.TEXT,
            value: filter ? filter.LessonName : null
        },
    ]
}
