import React, {useEffect, useRef, useMemo} from "react"
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getTasks, statesSelector, tasksSelector, fetchingSelector} from "tt-ducks/tasks";
import {setGridSortOrder, applyFilter, setInitState} from "tt-ducks/route";
import Webix from "../../components/Webix";
import "./tasks.sass"
import $ from "jquery";
import FilterRow from "../../components/filter";
import type {FilterField} from "../../components/filter/types";
import {FILTER_FIELD_TYPE} from "../../components/filter/types";
import {GRID_SORT_DIRECTION} from "../../constants/common";
import {useLocation,} from "react-router-dom"
import type {GridSortOrder} from "../../types/grid";


function Tasks(props) {
    const {actions, states, tasks, fetching} = props

    const location = useLocation()
    const _sortRef = useRef({field: null, direction: null}),
        filter = useRef(null)

    useEffect(() => {
        const initState = parseParams()
        if (initState.order) {
            _sortRef.current = initState.order
            const _grid = window.webix.$$("tasks-grid")
            if (_grid) {
                _grid.markSorting(_sortRef.current.field, _sortRef.current.direction)
            }
        }
        if (initState.filter) {
            filter.current = initState.filter
        }

        actions.setInitState(initState)

        $(window).on('resize', _resizeHandler);
        _resizeHandler();

        return () => {
            $(window).unbind('resize', _resizeHandler)
        }
    }, [])

    const parseParams = () => {
        const paramsData = {}

        const _params = new URLSearchParams(location.search),
            executor = _params.get("executor"),
            hasExecutor = _params.get("hasExecutor"),
            state = _params.get("state"),
            process = _params.get("process")

        let _order = _params.get('order')
        if (_order) {
            _order = _order.split(',')
            paramsData.order = {field: _order[0], direction: _order[1] ? _order[1] : GRID_SORT_DIRECTION.ACS}
        }

        const _filter = convertParam2Filter({hasExecutor, executor, state, process})
        if (_filter) {
            paramsData.filter = _filter
        }

        return paramsData
    }

    useEffect(() => {
        if (!fetching) {
            actions.getTasks()
        }
    }, [location])

    const GRID_CONFIG = {
        view: "datatable",
        id: 'tasks-grid',
        css: 'tt-grid',
        hover:"row-hover",
        scroll: 'none',
        headerRowHeight: 40,
        rowHeight: 72,
        height: 500,
        select: true,
        editable: false,
        columns: [
            {id: 'TimeCr', header: 'СОЗДАНО', fillspace: 7, format: function(value) {
                    let fn = window.webix.Date.dateToStr("%d.%m.%Y", false);
                    return value ? fn(new Date(value)) : '';
            }},
            {id: 'ProcessName', header: 'ПРОЦЕСС', fillspace: 11},
            {id: 'Name', header: 'Название', fillspace: 25},
            {id: 'Id', header: 'ID ЗАДАЧИ', autofill: 10, css: "number-field"},
            {id: 'ElementName', header: 'ЭЛЕМЕНТ', autofill: 8}, // Нет сортировки
            {id: 'ExecutorName', header: 'ИСПОЛНИТЕЛЬ', autofill: 10}, // UserName
            {id: 'DueDate', header: 'ВЫПОЛНИТЬ ДО', autofill: 11, format: function(value) {
                    let fn = window.webix.Date.dateToStr("%d.%m.%Y", false);
                    return value ? fn(new Date(value)) : '';
                }},
            {
                id: 'State', header: 'СОСТОЯНИЕ', width: 150,
                template: function(data) {
                    return `<div class="task-state ${data.css}">${data.label}</div>`
                }
            },
        ],
        on: {
            onHeaderClick: function(header,) {
                const _sort: GridSortOrder = _sortRef.current

                if (header.column !== _sort.field) {
                    _sort.field = header.column
                    _sort.direction = GRID_SORT_DIRECTION.ACS
                } else {
                    _sort.direction =_sort.direction === GRID_SORT_DIRECTION.ACS ? GRID_SORT_DIRECTION.DESC : _sort.type = GRID_SORT_DIRECTION.ACS
                }

                actions.setGridSortOrder(_sort)
                this.markSorting(_sort.field, _sort.direction)
            }
        }
    };

    const _onApplyFilter = (filter) => {
        actions.applyFilter(convertFilter2Params(filter))
    }

    const FILTER_CONFIG : Array<FilterField> = useMemo(() => getFilterConfig(filter.current, states),[filter.current, states])

    const _onChangeFilterVisibility = () => {
        _resizeHandler()
    }



    return <div className="tasks-page form">
        <h5 className="form-header _grey70">Задачи</h5>
        <FilterRow fields={FILTER_CONFIG}  onApply={_onApplyFilter} onChangeVisibility={_onChangeFilterVisibility}/>
        <div className="grid-container">
            <Webix ui={GRID_CONFIG} data={tasks}/>
        </div>
    </div>
}

const mapState2Props = (state) => {
    return {
        tasks: tasksSelector(state),
        states: statesSelector(state),
        fetching: fetchingSelector(state),
    }
}

const mapDispatch2Props = (dispatch) => {
    return {
        actions: bindActionCreators({getTasks, applyFilter, setGridSortOrder, setInitState}, dispatch)
    }
}

export default connect(mapState2Props, mapDispatch2Props)(Tasks)


const _resizeHandler = () => {
    const _form = $('.form'),
        _filter = $(".filter-block"),
        _height = _form.height(),
        _width = _form.width()

    if (window.$$('tasks-grid')) {
        const _headerHeight = window.$$('tasks-grid').config.headerRowHeight


        setTimeout(() => {
            const _filterHeight = _filter && _filter.length ? _filter.height() : 0
            window.$$('tasks-grid').$setSize(_width, _height - _headerHeight - 48)
        }, 0)

    }
}


const convertParam2Filter = ({hasExecutor, executor, state, process}) => {
    if (!(hasExecutor || executor || state || process)) return null

    const filter = {}
    filter.Executor = {
        hasNoExecutor: hasExecutor === "false",
        name: executor ? executor : ""
    }

    filter.State = (state ? state.split(",") : []).map(item => +item)
    filter.ProcessName = process ? process : ""

    return filter
}

const convertFilter2Params = (filter) => {
    let _data = {}

    if (filter) {
        if (filter.Executor) {
            _data.hasExecutor = !filter.Executor.hasNoExecutor
            if (_data.hasExecutor) {
                _data.executor = filter.Executor.name
            }
        }

        if (filter.State) { _data.state = filter.State.join(",") }
        if (filter.ProcessName) { _data.process = filter.ProcessName }
    }

    return _data
}

const getFilterConfig = (filter, states) => {
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
