import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useWindowSize} from "../../../tools/window-resize-hook";
import {convertFilter2Params, getFilterConfig, parseParams, refreshColumns, resizeHandler} from "./functions";
import type {GridSortOrder} from "../../../types/grid";
import {GRID_SORT_DIRECTION} from "../../../constants/common";
import type {FilterField} from "../../../components/filter/types";
import FilterRow from "../../../components/filter";
import Webix from "../../../components/Webix";
import {hideSideBarMenu, showSideBarMenu, sideBarMenuVisible} from "tt-ducks/app";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import {
    displayRecordsSelector,
    elementsFieldSetSelector,
    fetchingSelector,
    getRecords
} from "tt-ducks/dashboard-records";
import {applyFilter, setGridSortOrder, setInitState, setPathname} from "tt-ducks/route";
import './records-list.sass'
import {DASHBOARD_PROCESS_STATE} from '../../../constants/states'


const defaultColumnConfigOne = [
    {
        id: 'Id', header: [{text: 'id', css: 'up-headers'}], hidden: true
    },
    {
        id: 'Week', header: [{text: 'Неделя', css: 'up-headers'}] , css: 'week-up'
    },
    {
        id: 'PubDate', header: [{text: 'Дата', css: 'up-headers'}],
    },
    {
        id: 'CourseName', header: [{text: 'Курс', css: 'up-headers'}], fillspace: true, minWidth: 130
    },
    {
        id: 'LessonNum', header:  [{text: 'Номер', css: 'up-headers'}], css: '_container',
        template: function (val) {
            return `<div class="centered-by-flex">${val.LessonNum}</div>`;
        },
    },
    {
        id: 'LessonName', header: [{text: 'Название лекции', css: 'up-headers'}], fillspace: true, minWidth: 130
    },
];

const getProcessState = (val) => {
    if(val){
        const processState = Object.values(DASHBOARD_PROCESS_STATE).find(prS => prS.value === val);
        return  processState ? {css: processState.css, label: processState.label} : {css: "", label: "--"};
    }else {
        return {css: '', label: ''}
    }
}

const defaultColumnConfigTwo = [
    {
        id: 'IsPublished', header: [{text: 'Опубликовано', css: 'up-headers'}],
        css: '_container',
        template: function(data) {
            return `<div class='${'check-box-block'} ${data.IsPublished ? 'checked' : ''}'>
                        <div class=${data.IsPublished ? 'check-mark' : ''}></div>
                        </div>`
        }
    },
    {
        id: 'ProcessState', header: [{text: 'Процесс', css: 'up-headers'}], width: 150, css: "_container",
        template: function(val) {
            const state = getProcessState(val.ProcessState);
            return `<div class="process-state ${state.css}">${state.label}</div>`;
        }
    }
]

let recordsCount = 0;

const Records = (props) => {
    const {
        dashboardRecords,
        actions,
        sideBarMenuVisible, fetching,
        elementsFieldSet,
        resizeTrigger
    } = props;


    const [columnFields, setColumnFields] = useState([...defaultColumnConfigOne,...defaultColumnConfigTwo]);

    const _onResize = useCallback(() => {
        console.log('onresize works');
        resizeHandler(recordsCount, 1900)
    }, [dashboardRecords]);

    const _sortRef = useRef({field: null, direction: null}),
        filter = useRef(null);

    useWindowSize(() => {
        resizeHandler(recordsCount, 1900)
    });

    useEffect(() => {
        console.log('resizeTrigger in records:', resizeTrigger)
        resizeHandler(recordsCount, 1900)
    }, [resizeTrigger]);

    useEffect(() => {
        setColumnFields([...defaultColumnConfigOne, ...elementsFieldSet, ...defaultColumnConfigTwo]);
    }, [elementsFieldSet]);

    useEffect(() => {
        refreshColumns(columnFields);
        setTimeout(() => {
            _onResize();
        }, 200);
    }, [columnFields]);

    useEffect(() => {
        console.log('dashboardRecords:', dashboardRecords)
        recordsCount = dashboardRecords.length;
        if (sideBarMenuVisible) {
            _onResize();
        } else {
            setTimeout(() => {
                _onResize();
            }, 200);
        }
    }, [dashboardRecords]);

    useEffect(() => {
        const initState = parseParams();
        if (initState.order) {
            _sortRef.current = initState.order;
            const _grid = window.webix.$$("dashboard-records-grid");
            if (_grid) {
                _grid.markSorting(_sortRef.current.field, _sortRef.current.direction)
            }
        }
        if (initState.filter) {
            filter.current = initState.filter;
            initState.filter = convertFilter2Params(initState.filter)
        } else {
            filter.current = null
        }

        initState.pathname = location.pathname;
        actions.setInitState(initState);

        if (!fetching) {
            actions.getRecords()
            // refreshColumns
        }
    }, [location]);

    const GRID_CONFIG = useMemo(() => {
        return {
        view: "datatable",
        id: 'dashboard-records-grid',
        css: 'tt-grid scroll-all-table',
        hover: "row-hover",
        scroll: 'none',
        headerRowHeight: 40,
        rowHeight: 72,
        height: 1000,
        select: true,
        editable: false,
            scheme: {
                $change: function (item) {
                    if (item.IsEven){
                        item.$css = "even-record";
                    }
                }
            },
        columns: [],
        on: {
            onHeaderClick: function (header) {
                const _sort: GridSortOrder = _sortRef.current;

                if (header.column !== _sort.field) {
                    _sort.field = header.column
                    _sort.direction = GRID_SORT_DIRECTION.ACS
                } else {
                    _sort.direction = _sort.direction === GRID_SORT_DIRECTION.ACS ? GRID_SORT_DIRECTION.DESC : _sort.type = GRID_SORT_DIRECTION.ACS
                }

                actions.setGridSortOrder(_sort);
                this.markSorting(_sort.field, _sort.direction);
            },
            onItemDblClick: function (id) {
                // const item = this.getItem(id);
                //
                // if (item && item.Id) {
                //     // todo open action
                //     actions.selectTimeline(item.Id);
                //     props.history.push(`timelines/${item.Id}`);
                // }

            }
        },
        onClick: {
            "js-publish": function (e, data) {
                e.preventDefault()
                const item = this.getItem(data.row);
                if (item) {
                    actions.publishTimeline(item.Id, true);
                    // actions.updateTimeline(item.Id, {
                    //     ...item,
                    //     State: 2
                    // });
                    actions.getTimelines();
                }
            },
            "js-copy": function (e, data) {
                e.preventDefault();
                const item = this.getItem(data.row);
                if (item) {
                    //todo copy action after api complete
                }
            },
            "remove-timeline-button": function (e, data) {
                e.preventDefault();
                const item = this.getItem(data.row);
                if (item) {
                    (+item.State) === 1 && actions.removeTimeline(item.Id);
                    actions.getTimelines();
                }
            }
        },
    }}, [columnFields]);

    const FILTER_CONFIG: Array<FilterField> = useMemo(() => {
        return getFilterConfig(filter.current)
    }, [filter.current]);

    const _onApplyFilter = (filterData) => {
        filter.current = filterData;
        let params = convertFilter2Params(filterData);
        actions.applyFilter(params)
    };



    return (
        <React.Fragment>
            <div className="records-page form">
                {/*<h5 className="form-header _grey70">План публикаций</h5>*/}

                <div className="filters">
                    <FilterRow fields={FILTER_CONFIG}
                               onApply={_onApplyFilter}
                               onChangeVisibility={_onResize}/>


                    <button  disabled={true} style={{pointerEvents: 'none'}} className="open-form-button" >

                    </button>
                </div>

                <div className="grid-container dashboard-records-table unselectable">
                    <Webix ui={GRID_CONFIG} data={dashboardRecords}/>
                </div>
            </div>

        </React.Fragment>
    )
}

const mapState2Props = (state) => {
    return {
        dashboardRecords: displayRecordsSelector(state),
        sideBarMenuVisible: sideBarMenuVisible(state),
        fetching: fetchingSelector(state),
        elementsFieldSet: elementsFieldSetSelector(state)
    }
}

const mapDispatch2Props = (dispatch) => {
    return {
        actions: bindActionCreators({
            hideSideBarMenu, showSideBarMenu,
            applyFilter,
            setInitState,
            setPathname,
            setGridSortOrder,
            getRecords
        }, dispatch)
    }
};

export default connect(mapState2Props, mapDispatch2Props)(Records)
