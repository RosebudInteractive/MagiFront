import {FILTER_FIELD_TYPE} from "../../components/filter/types";
import $ from "jquery";
import {GRID_SORT_DIRECTION} from "../../constants/common";
import savedFilters, {FILTER_KEY} from "../../tools/saved-filters";

export const getFilterConfig = (filter, states) => {
    return [
        {
            name: "Executor",
            placeholder: "Исполнитель",
            type: FILTER_FIELD_TYPE.USER,
            value: filter ? filter.Executor : null
        },
        {
            name: "State",
            placeholder: "Состояние задачи",
            type: FILTER_FIELD_TYPE.COMBO,
            options: states,
            value: filter ? filter.State : null
        },
        {
            name: "ProcessName",
            placeholder: "Процесс",
            type: FILTER_FIELD_TYPE.TEXT,
            value: filter ? filter.ProcessName : null
        },
    ]
}

export const parseParams = () => {
    const paramsData = {}

    const _params = new URLSearchParams(location.search),
        executor = _params.get("executor"),
        hasExecutor = _params.get("hasExecutor"),
        state = _params.get("state"),
        process = _params.get("process");

    let _order = _params.get('order')
    if (_order) {
        _order = _order.split(',')
        paramsData.order = {field: _order[0], direction: _order[1] ? _order[1] : GRID_SORT_DIRECTION.ACS}
    }

    const _filter = convertParam2Filter({hasExecutor, executor, state, process});
    if (_filter) {
        paramsData.filter = _filter
    }

    return paramsData ? paramsData : savedFilters.getFor(FILTER_KEY.TASKS)
}

const convertParam2Filter = ({hasExecutor, executor, state, process}) => {
    if (!(hasExecutor || executor || state || process)) return null

    const filter = {}
    filter.Executor = {
        hasNoExecutor: hasExecutor === "false",
        userName: executor ? executor : ""
    }

    if (state) {
        filter.State = state.split(",").map(item => +item)
    }
    filter.ProcessName = process ? process : ""

    return filter
}

export const resizeHandler = (rowCount: number) => {
    const _form = $('.form'),
        _height = _form.height(),
        _width = _form.width()

    if (window.$$('tasks-grid')) {
        const _headerHeight = window.$$('tasks-grid').config.headerRowHeight


        setTimeout(() => {
            let _gridHeight = _height - _headerHeight - 48

            const _calcHeight = (rowCount * 80) + _headerHeight + 60
            _gridHeight = _calcHeight > _gridHeight ? _calcHeight : _gridHeight
            window.$$('tasks-grid').$setSize(_width, _gridHeight)
        }, 0)

    }
}

export const convertFilter2Params = (filter) => {
    let _data = {}

    if (filter) {
        if (filter.Executor && (filter.Executor.hasNoExecutor || filter.Executor.userName)) {
            _data.hasExecutor = !filter.Executor.hasNoExecutor
            if (_data.hasExecutor) {
                _data.executor = filter.Executor.userName
            }
        }

        if (filter.State) { _data.state = filter.State.join(",") }
        if (filter.ProcessName) { _data.process = filter.ProcessName }
    }

    return _data
}
