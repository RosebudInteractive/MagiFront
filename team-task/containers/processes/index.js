import React, {useMemo, useEffect, useRef} from "react"
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {processesSelector, statesSelector, fetchingSelector, getProcesses} from "tt-ducks/processes";
import {setGridSortOrder, applyFilter, setInitState, setPathname} from "tt-ducks/route";
import $ from "jquery";
import "./processes.sass"
import Webix from "../../components/Webix";
import type {FilterField} from "../../components/filter/types";
import FilterRow from "../../components/filter";
import {GRID_SORT_DIRECTION} from "../../constants/common";
import {convertFilter2Params, getFilterConfig, parseParams, resizeHandler} from "./functions";
import {useLocation,} from "react-router-dom"


function Processes(props) {
    const {actions, processes, states, fetching} = props

    const location = useLocation()
    const _sortRef = useRef({field: null, direction: null}),
        filter = useRef(null)

    useEffect(() => {
        const initState = parseParams()
        if (initState.order) {
            _sortRef.current = initState.order
            const _grid = window.webix.$$("processes-grid")
            if (_grid) {
                _grid.markSorting(_sortRef.current.field, _sortRef.current.direction)
            }
        }
        if (initState.filter) {
            filter.current = initState.filter
            initState.filter = convertFilter2Params(initState.filter)
        }

        initState.pathname = location.pathname

        actions.setInitState(initState)

        $(window).on('resize', resizeHandler);
        resizeHandler();

        return () => {
            $(window).unbind('resize', resizeHandler)
        }
    }, [])

    useEffect(() => {
        actions.setPathname(location.pathname)
        if (!fetching) {
            actions.getProcesses()
        }
    }, [location])

    const GRID_CONFIG = {
        view: "datatable",
        id: 'processes-grid',
        css: 'tt-grid',
        hover:"row-hover",
        scroll: 'none',
        headerRowHeight: 40,
        rowHeight: 72,
        height: 500,
        select: true,
        editable: false,
        columns: [
            {id: 'TimeCr', header: 'СОЗДАНО', width: 100, format: function(value) {
                    let fn = window.webix.Date.dateToStr("%d.%m.%Y", false);
                    return value ? fn(new Date(value)) : '';
                }},
            {id: 'Id', header: 'ID процесса', width: 105},
            {
                id: 'State', header: 'СОСТОЯНИЕ', width: 150,
                template: function(data) {
                    return `<div class="process-state ${data.css}">${data.label}</div>`
                }
            },
            {id: 'UserName', header: 'Супервизор', width: 170},
            {id: 'Name', header: 'Название', width: 250, fillspace: 30},
            {id: 'CourseName', header: 'Курс', width: 80, fillspace: 30},
            {id: 'LessonName', header: 'Лекция', width: 115, fillspace: 30},
        ],
        on: {
            onHeaderClick: function(header,) {
                const _sort = _sortRef.current

                if (header.column !== _sort.field) {
                    _sort.field = header.column
                    _sort.direction = GRID_SORT_DIRECTION.ACS
                } else {
                    _sort.direction = _sort.direction === GRID_SORT_DIRECTION.ACS ? GRID_SORT_DIRECTION.DESC : GRID_SORT_DIRECTION.ACS
                }

                actions.setGridSortOrder(_sort)
                this.markSorting(_sort.field, _sort.direction)
            }
        }
    };

    const FILTER_CONFIG : Array<FilterField> = useMemo(() => getFilterConfig(filter.current, states),[filter.current, states])

    const _onApplyFilter = (filter) => {
        actions.applyFilter(convertFilter2Params(filter))
    }

    const _onChangeFilterVisibility = () => {
        // _resizeHandler()
    }

    return <div className="processes-page form">
        <h5 className="form-header _grey70">Процессы</h5>
        <FilterRow fields={FILTER_CONFIG}  onApply={_onApplyFilter} onChangeVisibility={_onChangeFilterVisibility}/>
        <div className="grid-container">
            <Webix ui={GRID_CONFIG} data={processes}/>
        </div>
    </div>
}

const mapState2Props = (state) => {
    return {
        processes: processesSelector(state),
        states: statesSelector(state),
        fetching: fetchingSelector(state),
    }
}

const mapDispatch2Props = (dispatch) => {
    return {
        actions: bindActionCreators({getProcesses, setGridSortOrder, applyFilter, setInitState, setPathname}, dispatch)
    }
}

export default connect(mapState2Props, mapDispatch2Props)(Processes)
