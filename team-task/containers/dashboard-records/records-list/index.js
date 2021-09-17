import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {convertFilter2Params, getFilterConfig, parseParams, refreshColumns, resizeHandler} from "./functions";
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
import {MAIN_COLUMNS, STATE_COLUMNS} from "./consts";

let recordsCount = 0,
    scrollPosition = 0;

const Records = (props) => {
    const {
        dashboardRecords,
        actions,
        elementsFieldSet,
        resizeTrigger,
        courses,
        unpublishedPanelOpened,
        params
    } = props;

    const location = useLocation();

    const [columnFields, setColumnFields] = useState([...MAIN_COLUMNS, ...STATE_COLUMNS]);

    const _onResize = useCallback(() => {
        resizeHandler(recordsCount)
    }, [dashboardRecords]);

    const _sortRef = useRef({field: null, direction: null}),
        filter = useRef(null);

    useWindowSize(() => {
        resizeHandler(recordsCount)
    });

    useEffect(() => {
        const grid = window.webix.$$("dashboard-records-grid");
        if (unpublishedPanelOpened) {
            const elementsColumnExists = grid.getColumnIndex("processElements") >= 0

            if (elementsColumnExists) {
                grid.hideColumn('processElements', {spans: true});
            }
        }

        resizeHandler(recordsCount,); //add additional width here todo removeit
    }, [unpublishedPanelOpened, resizeTrigger]);

    useEffect(() => {
        const elementsFieldsExists = elementsFieldSet && Array.isArray(elementsFieldSet) && elementsFieldSet.length,
            columns = elementsFieldsExists && !unpublishedPanelOpened
                ? [...MAIN_COLUMNS, ...elementsFieldSet, ...STATE_COLUMNS]
                : [...MAIN_COLUMNS, ...STATE_COLUMNS]

        if (JSON.stringify(columnFields) !== JSON.stringify(columns)) {
            setColumnFields(columns);
        }
    }, [elementsFieldSet, unpublishedPanelOpened]);

    useEffect(() => {
        refreshColumns(columnFields, {needRefresh: true, recordsCount});
    }, [columnFields]);

    useEffect(() => {
        recordsCount = dashboardRecords.length;
        // if (sideBarMenuVisible) {
        //     _onResize();
        // } else {
        //     setTimeout(() => {
        //         _onResize();
        //     }, 200);
        // }
        _onResize();

        if (scrollPosition) {
            window.scroll(0, scrollPosition)
            scrollPosition = 0
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
                onItemDblClick: function (id) {
                    // todo open action
                },
                onBeforeDrop: function (context, e) {
                    const toItem = this.getItem(context.target);
                    const fromItem = context.from.getItem(context.source[0]);

                    actions.setPublishRecordDate({isoDateString: toItem.DateObject.toISOString(), lessonId: fromItem.LessonId});
                    scrollPosition = window.scrollY;

                    return false;
                },
                onAfterDrop: function (context, e) {
                    console.log('after drop')
                },
                onAfterRender: function () {
                    gridLoadedRef.current = true;
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
