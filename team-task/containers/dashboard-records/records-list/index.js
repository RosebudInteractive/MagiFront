import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {convertFilter2Params, getFilterConfig, parseParams, refreshColumns, resizeHandler} from "./functions";
import type {GridSortOrder} from "../../../types/grid";
import {GRID_SORT_DIRECTION} from "../../../constants/common";
import type {FilterField} from "../../../components/filter/types";
import FilterRow from "../../../components/filter";
import Webix from "../../../components/Webix";
import {useLocation} from "react-router-dom"
import {hideSideBarMenu, showSideBarMenu, sideBarMenuVisible} from "tt-ducks/app";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import {
    displayRecordsSelector,
    elementsFieldSetSelector,
    fetchingSelector,
    getRecords,
    setPublishRecordDate
} from "tt-ducks/dashboard-records";
import {applyFilter, paramsSelector, setGridSortOrder, setInitState, setPathname} from "tt-ducks/route";
import './records-list.sass'
import {coursesSelector} from "tt-ducks/dictionary";
import {useWindowSize} from "../../../tools/window-resize-hook";
import {defaultColumnConfigOne, defaultColumnConfigTwo} from "./consts";


let recordsCount = 0;

const Records = (props) => {
    const {
        dashboardRecords,
        actions,
        sideBarMenuVisible,
        elementsFieldSet,
        resizeTrigger,
        courses,
        unpublishedPanelOpened,
        params
    } = props;

    const location = useLocation();

    const [columnFields, setColumnFields] = useState([...defaultColumnConfigOne, ...defaultColumnConfigTwo]);

    const _onResize = useCallback(() => {
        resizeHandler(recordsCount, unpublishedPanelOpened ? 400 : 0)
    }, [dashboardRecords]);

    const _sortRef = useRef({field: null, direction: null}),
        filter = useRef(null);

    useWindowSize(() => {
        resizeHandler(recordsCount, 0)
    });

    useEffect(() => {
        const additionalWidth = unpublishedPanelOpened ? 400 : 0; // todo remove
        const grid = window.webix.$$("dashboard-records-grid");
        if(unpublishedPanelOpened){
            !(grid.getColumnIndex("processElements") < 0) && grid.hideColumn('processElements', {spans: true});
        }

        resizeHandler(recordsCount, additionalWidth); //add additional width here todo removeit
    }, [unpublishedPanelOpened, resizeTrigger]);

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
        recordsCount = dashboardRecords.length;
        if (sideBarMenuVisible) {
            _onResize();
        } else {
            setTimeout(() => {
                _onResize();
            }, 200);
        }
    }, [dashboardRecords, unpublishedPanelOpened]);

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
    }, [location]);

    useEffect(() => {
        actions.getRecords();
    }, [params]);

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
            drag: "target",
            editable: false,
            scheme: {
                $change: function (item) {
                    if (item.IsEven) {
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
                    // todo open action

                },
                onBeforeDrop: function (context, e) {
                    const toItem = this.getItem(context.target);
                    const fromItem = context.from.getItem(context.source[0]);

                    actions.setPublishRecordDate({isoDateString: toItem.DateObject.toISOString(), lessonId: fromItem.LessonId});

                    return true;
                }
            },
            onClick: {
            },
        }
    }, [columnFields]);

    const FILTER_CONFIG: Array<FilterField> = useMemo(() => {
        const optionsCourses = (courses && courses.length > 0) ? courses.map(c => ({value: c.Id, label: c.Name})) : [];
        return getFilterConfig(filter.current, [], optionsCourses.length > 0 ? optionsCourses : []);
    }, [filter.current, courses]);

    const _onApplyFilter = (filterData) => {
        filter.current = filterData;
        let params = convertFilter2Params(filterData);
        actions.applyFilter(params)
    };


    return (
        <React.Fragment>
            <div className="records-page form">
                <div className="filters">
                    {
                        (courses && courses.length > 0) &&
                        <FilterRow fields={FILTER_CONFIG}
                                   onApply={_onApplyFilter}
                                   onChangeVisibility={_onResize}/>
                    }
                </div>

                <div className="horizontal-scroll-grid">
                    <div className="grid-container dashboard-records-table unselectable">
                        <Webix ui={GRID_CONFIG} data={dashboardRecords}/>
                    </div>
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
        elementsFieldSet: elementsFieldSetSelector(state),
        courses: coursesSelector(state),
        params: paramsSelector(state)
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
            getRecords,
            setPublishRecordDate
        }, dispatch)
    }
};

export default connect(mapState2Props, mapDispatch2Props)(Records)
