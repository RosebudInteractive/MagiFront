import React, {useEffect, useRef, useMemo, useCallback} from "react"
import {connect, useSelector} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getTasks, goToTask, statesSelector, tasksSelector, fetchingSelector} from "tt-ducks/tasks";
import {setGridSortOrder, applyFilter, setInitState, setPathname} from "tt-ducks/route";
import Webix from "../../components/Webix";
import "./tasks.sass"
import FilterRow from "../../components/filter";
import type {FilterField} from "../../components/filter/types";
import {GRID_SORT_DIRECTION} from "../../constants/common";
import {useLocation,} from "react-router-dom"
import type {GridSortOrder} from "../../types/grid";
import {convertFilter2Params, getFilterConfig, parseParams, resizeHandler} from "./functions";
import {useWindowSize} from "../../tools/window-resize-hook";

let _taskCount = 0

function Tasks(props) {
    const {actions, states, tasks, fetching} = props

    const location = useLocation()
    const _sortRef = useRef({field: null, direction: null}),
        filter = useRef(null)

    useWindowSize(() => {
        resizeHandler(_taskCount)
    })

    useEffect(() => {
        _taskCount = tasks.length
        _onResize();
    }, [tasks])

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
            initState.filter = convertFilter2Params(initState.filter)
        } else {
            filter.current = null
        }

        initState.pathname = location.pathname
        actions.setInitState(initState)

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
        height: 1000,
        select: true,
        editable: false,
        columns: [
            {id: 'TimeCr', header: 'СОЗДАНО', fillspace: 7, format: function(value) {
                    let fn = window.webix.Date.dateToStr("%d.%m.%Y", false);
                    return value ? fn(new Date(value)) : '';
            }},
            {id: 'ProcessName', header: 'ПРОЦЕСС', fillspace: 11},
            {id: 'Name', header: 'Название', fillspace: 25},
            {id: 'Id', header: 'ID ЗАДАЧИ', autofill: 10, css: "_number-field"},
            {id: 'ElementName', header: 'ЭЛЕМЕНТ', autofill: 8}, // Нет сортировки
            {id: 'UserName', header: 'ИСПОЛНИТЕЛЬ', width: 170, autofill: 20}, // UserName
            {id: 'DueDate', header: 'ВЫПОЛНИТЬ ДО', autofill: 11, format: function(value) {
                    let fn = window.webix.Date.dateToStr("%d.%m.%Y", false);
                    return value ? fn(new Date(value)) : '';
                }},
            {
                id: 'State', header: 'СОСТОЯНИЕ', width: 150, css: "_container",
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
            },
            onItemDblClick: function (id) {
                const item = this.getItem(id)
                if (item && item.Id) {
                    actions.goToTask(item.Id)
                }
            }
        }
    };

    const FILTER_CONFIG : Array<FilterField> = useMemo(() => getFilterConfig(filter.current, states),[filter.current, states])

    const _onApplyFilter = (filterData) => {
        filter.current = filterData
        actions.applyFilter(convertFilter2Params(filterData))
    }

    const _onResize = useCallback(() => {
        resizeHandler(tasks.length)
    }, [tasks])

    return <div className="tasks-page form _scrollable-y">
        <h5 className="form-header _grey70">Задачи</h5>
        <FilterRow fields={FILTER_CONFIG}  onApply={_onApplyFilter} onChangeVisibility={_onResize}/>
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
        actions: bindActionCreators({getTasks, goToTask, applyFilter, setGridSortOrder, setInitState, setPathname}, dispatch)
    }
}

export default connect(mapState2Props, mapDispatch2Props)(Tasks)
