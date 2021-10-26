import React, {useCallback, useEffect, useMemo, useRef} from "react"
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {fetchingSelector, getTasks, goToTask, statesSelector, tasksSelector} from "tt-ducks/tasks";
import {applyFilter, setGridSortOrder, setInitState, setPathname} from "tt-ducks/route";
import Webix from "../../components/Webix";
import "./tasks.sass"
import FilterRow from "../../components/filter";
import type {FilterField} from "../../components/filter/types";
import {GRID_SORT_DIRECTION} from "../../constants/common";
import {useLocation,} from "react-router-dom"
import type {GridSortOrder} from "../../types/grid";
import {convertFilter2Params, getFilterConfig, parseParams, resizeHandler} from "./functions";
import {useWindowSize} from "../../tools/window-resize-hook";
import savedFilters, {FILTER_KEY} from "../../tools/saved-filters";

let _taskCount = 0

function Tasks(props) {
    const {actions, states, tasks, fetching} = props

    const location = useLocation()
    const _sortRef = useRef({field: null, direction: null}),
        filter = useRef(null),
        isMounted = useRef(false)


    useWindowSize(() => {
        resizeHandler(_taskCount)
    })

    useEffect(() => {
        _taskCount = tasks.length
        _onResize();
    }, [tasks])

    useEffect(() => {
        let initState = parseParams();
        const locationSearchUrl = new URLSearchParams(location.search);

        if (!isMounted.current && (Object.keys(initState).length === 0)) {
            initState = savedFilters.getFor(FILTER_KEY.TASKS)
            initState.replacePath = true
        } else {
            savedFilters.setFor(FILTER_KEY.TASKS, {...initState})
        }

        isMounted.current = true;

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
            if(locationSearchUrl.has('element')){
                initState.filter = {element: +locationSearchUrl.get('element')}
            }
            filter.current = null
        }

        initState.pathname = location.pathname;

        actions.setInitState(initState);

        if (!fetching) {
            actions.getTasks(locationSearchUrl.has('element') ? +locationSearchUrl.get('element') : undefined)
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
                    const notifUuid = location.search.split('notification=')[1];
                    actions.goToTask(item.Id, notifUuid)
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
        <div className="grid-container unselectable">
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
