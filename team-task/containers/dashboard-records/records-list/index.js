import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {convertFilter2Params, getFilterConfig, parseParams, refreshColumns, resizeHandler} from "./functions";
import type {FilterField} from "../../../components/filter/types";
import FilterRow from "../../../components/filter";
import Webix from "../../../components/Webix";
import {useLocation, withRouter} from "react-router-dom"
import {hideSideBarMenu, showSideBarMenu, sideBarMenuVisible} from "tt-ducks/app";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import {
    addToDisplayedRecords,
    courseOptionsUnpublishedFilter,
    displayRecordsSelector,
    elementsFieldSetSelector,
    fetchingSelector,
    getRecords,
    menuOptionsOpenedSelector,
    modeSelector,
    removeFromPublished,
    selectedRecordSelector,
    setPublishRecordDate,
    setRecordsDateRange,
    setSelectedRecord,
    toggleMenuOptions
} from "tt-ducks/dashboard-records";
import {
    applyFilter,
    dashboardActiveRecordSelector,
    filterSelector,
    paramsSelector,
    setDashboardActiveRecord,
    setGridSortOrder,
    setInitState,
    setPathname
} from "tt-ducks/route";
import './records-list.sass'
import {useWindowSize} from "../../../tools/window-resize-hook";
import {MAIN_COLUMNS, STATE_COLUMNS} from "./consts";
import {hasAdminRights, hasSupervisorRights, userSelector} from "tt-ducks/auth";
import savedFilters, {FILTER_KEY} from "../../../tools/saved-filters";
import moment from 'moment'

let recordsCount = 0,
    scrollPosition = 0,
    dActiveRecord = null;

const Records = (props) => {
    const {
        dashboardRecords,
        actions,
        elementsFieldSet,
        resizeTrigger,
        courses,
        unpublishedPanelOpened,
        filterValue,
        hasAdminRights,
        menuOptionsOpened,
        selectedRecord,
        paramsValue,
        dashboardActiveRecord,
        mode,
    } = props;

    const location = useLocation();

    const [columnFields, setColumnFields] = useState([...MAIN_COLUMNS, ...STATE_COLUMNS]);
    const [menuOptionCoords, setMenuOptionCoords] = useState({top: '0px', left: '0px'});
    // const []
    const windowScrollRef = useRef(window.scrollY);

    const[scrollPos, setScrollPos] = useState(0);

    const _onResize = useCallback(() => {
        resizeHandler(recordsCount);
    }, [dashboardRecords]);

    const _sortRef = useRef({field: null, direction: null}),
        filter = useRef(null),
        isMounted = useRef(false);

    useWindowSize(() => {
        resizeHandler(recordsCount)
    });

    const nullifyReadyDate = (record) => {
        // const nullifiedRecord record.PubDate = null;
        actions.removeFromPublished(record.id, record);
    };

    useEffect(() => {
        dActiveRecord = +dashboardActiveRecord;
    }, [dashboardActiveRecord]);

    useEffect(() => {
        const grid = window.webix.$$("dashboard-records-grid");

        setTimeout(() => {
            _onResize();
        }, 300);
    }, [unpublishedPanelOpened, resizeTrigger]);

    useEffect(() => {
        const elementsFieldsExists = elementsFieldSet && Array.isArray(elementsFieldSet) && elementsFieldSet.length,
            columns = elementsFieldsExists
                ? [...MAIN_COLUMNS, ...elementsFieldSet, ...STATE_COLUMNS]
                : [...MAIN_COLUMNS, ...STATE_COLUMNS];

        if (JSON.stringify(columnFields) !== JSON.stringify(columns)) {
            setColumnFields(columns);
        }
    }, [elementsFieldSet]);

    useEffect(() => {
        refreshColumns(columnFields, {needRefresh: true, recordsCount});
    }, [columnFields]);

    useEffect(() => {
        recordsCount = dashboardRecords.length;
        if (recordsCount > 0) {
            const recordsDateRangeStart = dashboardRecords[0].DateObject.format('DD.MM');
            const recordsDateRangeEnd = dashboardRecords[recordsCount - 1].DateObject.format('DD.MM');
            actions.setRecordsDateRange(`c ${recordsDateRangeStart} по ${recordsDateRangeEnd}`);
        }

        setTimeout(() => {
            _onResize();
        }, 300);


        if (scrollPosition) {
            window.scroll(0, scrollPosition)
            scrollPosition = 0
        }
    }, [dashboardRecords]);

    useEffect(() => {
        let initState = parseParams();

        if (!isMounted.current && (Object.keys(initState).length === 0)) {
            initState = savedFilters.getFor(FILTER_KEY.DASHBOARD_PUBLISHED);
            initState.replacePath = true;
        } else {
            savedFilters.setFor(FILTER_KEY.DASHBOARD_PUBLISHED, {...initState})
        }

        isMounted.current = true;

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
    }, [filterValue]);

    const GRID_CONFIG = useMemo(() => {
        return {
            view: "datatable",
            id: 'dashboard-records-grid',
            css: 'tt-grid scroll-all-table dashboard-table',
            hover: "bluelight-hover",
            scroll: 'none',
            headerRowHeight: 40,
            rowHeight: 72,
            height: 1000,
            select: true,
            drag: 'target',
            editable: false,
            scheme: {
                $change: function (item) {
                    let resultCss = ``;
                    if (item.IsEven) {
                        resultCss += " even-record";
                    }

                    if (item.IsEndOfWeek) {
                        resultCss += " end-of-week-record"
                    }

                    if (item.IsWeekend) {
                        resultCss += " weekend"
                    }

                    item.$css = resultCss;
                }
            },
            columns: [],
            on: {
                onAfterLoad: function (data){
                    if(dActiveRecord && typeof +dActiveRecord === 'number') {
                            this.showItem(dActiveRecord)
                    }
                },
                onItemClick: function (data) {
                    const item = this.getItem(data.row);

                    if (item) {
                        actions.setDashboardActiveRecord(item.id);
                        actions.setSelectedRecord(item)
                    }
                },
                onItemDblClick: function (data) {
                    if (!hasAdminRights) {
                        return;
                    }

                    const item = this.getItem(data.row);

                    if (data.column === 'PubDate') {
                        if ((item && item.CourseId && item.LessonId) && hasAdminRights) {
                            if (hasAdminRights) {
                                props.openModalOnPublication();
                            } else {
                                if (((item.Supervisor && item.Supervisor.Id) && (item.Supervisor.Id === user.Id))) {
                                    props.openModalOnPublication();
                                }
                            }
                        }
                    }

                    if (data.column === 'ProcessState' && (hasAdminRights || hasSupervisorRights)) {
                        if (item && item.ProcessId) {
                            if (hasAdminRights) {
                                window.open(`/pm/process/${item.ProcessId}`, '_blank');
                            } else {
                                if ((item.Supervisor && item.Supervisor.Id) && (item.Supervisor.Id === user.Id)) {
                                    window.open(`/pm/process/${item.ProcessId}`, '_blank');
                                }
                            }
                        }
                    }

                    if (item.ElementFields && item.ElementFields.includes(data.column)) {
                        if (item[data.column] && item[data.column].elementId) {
                            if (hasAdminRights) {
                                window.open(`/pm/tasks?element=${item[data.column].elementId}`)
                            } else {
                                if (item[data.column].supervisorId && item[data.column].supervisorId === user.Id) {
                                    window.open(`/pm/tasks?element=${item[data.column].elementId}`)
                                }
                            }
                        }
                    }
                },
                onBeforeDrop: function (context, e) {
                    const toItem = this.getItem(context.target);
                    const fromItem = context.from.getItem(context.source[0]);

                    scrollPosition = window.scrollY;

                    if(toItem.DateObject.isBefore(moment(), 'day')){
                        return false;
                    }

                    actions.addToDisplayedRecords(toItem.id, {
                        IsEven: toItem.IsEven,
                        PubDate: toItem.PubDate,
                        IsWeekend: toItem.IsWeekend,
                        DateObject: toItem.DateObject,
                        IsEndOfWeek: toItem.IsEndOfWeek,
                        CourseName: fromItem.CourseName,
                        LessonId: fromItem.LessonId,
                        CourseId: fromItem.CourseId,
                        Week: toItem.Week,
                        LessonNum: fromItem.LessonNum,
                        CourseLessonName: [fromItem.CourseName, fromItem.LessonName],
                        LessonName: fromItem.LessonName,
                        Elements: [],
                        IsPublished: null,
                        ProcessId: null,
                        ProcessState: null
                    });

                    return false;
                },
            },
            onClick: {},
        }
    }, [columnFields, hasAdminRights]);

    const FILTER_CONFIG: Array<FilterField> = useMemo(() => {
        const optionsCourses = (courses && courses.length > 0) ? courses.map(c => ({value: c.Id, label: c.Name})) : [];
        return getFilterConfig(filter.current, optionsCourses.length > 0 ? optionsCourses : []);
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
};

const mapState2Props = (state) => {
    return {
        dashboardRecords: displayRecordsSelector(state),
        sideBarMenuVisible: sideBarMenuVisible(state),
        hasAdminRights: hasAdminRights(state),
        fetching: fetchingSelector(state),
        elementsFieldSet: elementsFieldSetSelector(state),
        courses: courseOptionsUnpublishedFilter(state),
        filterValue: filterSelector(state),
        paramsValue: paramsSelector(state),
        hasSupervisorRights: hasSupervisorRights(state),
        user: userSelector(state),
        mode: modeSelector(state),
        menuOptionsOpened: menuOptionsOpenedSelector(state),
        selectedRecord: selectedRecordSelector(state),
        dashboardActiveRecord: dashboardActiveRecordSelector(state)
    }
};

const mapDispatch2Props = (dispatch) => {
    return {
        actions: bindActionCreators({
            hideSideBarMenu, showSideBarMenu,
            applyFilter,
            setInitState,
            setPathname,
            setGridSortOrder,
            getRecords,
            setPublishRecordDate,
            addToDisplayedRecords,
            setSelectedRecord,
            setRecordsDateRange,
            toggleMenuOptions,
            setDashboardActiveRecord,
            removeFromPublished
        }, dispatch)
    }
};

export default connect(mapState2Props, mapDispatch2Props)(withRouter(Records))
