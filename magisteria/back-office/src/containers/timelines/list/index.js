import React, {useCallback, useEffect, useMemo, useRef} from "react";
import {useLocation, withRouter} from 'react-router-dom';
import {useWindowSize} from "../../../tools/window-resize-hook";
import {convertFilter2Params, getFilterConfig, parseParams, resizeHandler} from "./functions";
import {GRID_SORT_DIRECTION} from "../../../constants/common";
import FilterRow from "../../../components/filter";
import Webix from "../../../components/Webix";
import {taskSelector} from "tt-ducks/task";
import {bindActionCreators} from "redux";
import {applyFilter, setGridSortOrder, setInitState, setPathname} from "tt-ducks/route";
import {connect} from "react-redux";
import './timelines.sass';
import {
    clearSelectedTimeline,
    copyTimeline,
    currentTimelineSelector,
    getTimelines,
    openTimelineEditor,
    publishTimeline,
    removeTimeline,
    selectTimeline,
    timelineOpenedSelector,
    timelinesFetchingSelector,
    timelinesSelector,
    unpublishTimeline,
    updateTimeline
} from "tt-ducks/timelines";
import {setTemporaryPeriods} from "tt-ducks/periods-timeline";
import {setTemporaryEvents} from "tt-ducks/events-timeline";
import {hasAdminRights, hasSupervisorRights} from "tt-ducks/auth";
import {TimelineStatuses, TimelineTypesOfUse} from "../../../constants/timelines";
import {hideSideBarMenu, sideBarMenuVisible} from "tt-ducks/app";
import PlusIco from "tt-assets/svg/plus.svg";
import {TIMELINE_STATE} from "../../../constants/states";
import type {GridSortOrder} from "../../../types/grid";
import type {FilterField} from "../../../components/filter/types";

let timelinesCount = 0;

const Timelines = (props) => {
    const {fetching, actions, timelines} = props;

    const location = useLocation();

    const _sortRef = useRef({field: null, direction: null}),
        filter = useRef(null);

    useWindowSize(() => {
        resizeHandler(timelinesCount)
    });

    useEffect(() => {
        timelinesCount = timelines.length;
        if (props.sideBarMenuVisible) { _onResize() }
        else {
            setTimeout(() => {_onResize()}, 200)
        }
    }, [timelines]);

    useEffect(() => {
        const initState = parseParams();
        if (initState.order) {
            _sortRef.current = initState.order
            const _grid = window.webix.$$("timelines-grid");
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

        initState.pathname = location.pathname;
        actions.setInitState(initState);

        if (!fetching) {
            actions.setTemporaryEvents([]);
            actions.setTemporaryPeriods([]);
            actions.clearSelectedTimeline();
            actions.getTimelines();
        }
    }, [location]);

    const _onResize = useCallback(() => {
        resizeHandler(timelinesCount)
    }, [timelines]);

    const GRID_CONFIG = {
        view: "datatable",
        id: 'timelines-grid',
        css: 'tt-grid ',
        hover: "row-hover",
        scroll: 'none',
        headerRowHeight: 40,
        rowHeight: 72,
        height: 1000,
        select: true,
        editable: false,
        columns: [
            {
                id: 'Id', header: 'id', hidden: true
            },
            {
                id: 'TimeCr', header: '????????/??????????', minWidth: 50, fillspace: 10, format: function (value) {
                    let fn = window.webix.Date.dateToStr("%d.%m.%Y", false);
                    return value ? fn(new Date(value)) : '';
                }
            },
            {
              id: 'Name', header: '????????????????',  minWidth: 50, fillspace: 10
            },
            {
                id: 'TypeOfUse',
                header: '?????? ??????????????????????????',
                fillspace: 10,
                options: Object.entries(TimelineTypesOfUse).map((ent) => ({id: ent[0], value: ent[1]}))
                ,  minWidth: 50
            },
            {
                id: 'Code',
                header: '??????',
                minWidth: 50,
                fillspace: 10
            },
            {
                id: 'LessonOrCourse', header: '???????????????? ?????????? ?????? ????????????',  minWidth: 20, fillspace: 20
            },
            {
                id: 'State',
                header: '??????????????????',
                editor: "select",
                options: Object.entries(TimelineStatuses).map((ent) => ({id: ent[0], value: ent[1]}))
                ,  minWidth: 50,
                fillspace: 12,
                css: "_container",
                template: function (val) {
                    const cssWithLabel = Object.values(TIMELINE_STATE).find(item => item.value === parseInt(val.State));
                    return `<div class="state-template-block-tm font-body-s ${cssWithLabel.css}">${cssWithLabel.label}</div>`
                }
            },
            {
                id: 'Order',
                header: '??????????'
                ,  minWidth: 50,
                fillspace: 8
            },
            {
                id: 'HasScript',
                header: '???????? ????????????',
                format: (value) => {return value ? '????' : '??????'},
                css: "_container",
                minWidth: 50,
                fillspace: 10,
                template: function(data) {
                    return `<div class='${'check-box-block'} ${data.HasScript ? 'checked' : ''}'>
                        <div class=${data.HasScript ? 'check-mark' : ''}></div>
                        </div>`
                }
            },
            {
                id: 'publish-btn', header: '', width: 50, css: "_container",
                template: function(data){
                    return data && data.State !== 2 ?  "<button class='grid-button _publish js-publish'/>" : "<button class='grid-button _unpublish js-unpublish'/>"
                }
            },
            {
                id: 'copy-btn', header: '', width: 50, css: "_container",
                template: function(){ return  "<button class='grid-button _copy js-copy'/>"}
            },
            {
                id: 'del-btn', header: '', width: 50,
                template: function (data) {
                    return data.State !== 2 ? "<button class='process-elements-grid__button elem-delete remove-timeline-button'/>" : ""
                }
            },

        ],
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
                const item = this.getItem(id);

                if (item && item.Id) {
                    actions.selectTimeline(item.Id);
                    props.history.push(`timelines/${item.Id}`);
                }

            }
        },
        onClick: {
            "js-publish": function (e, data) {
                e.preventDefault()
                const item = this.getItem(data.row);
                if (item) {
                    actions.publishTimeline(item.Id, true);
                    actions.getTimelines();
                }
            },
            "js-unpublish": function (e, data) {
                e.preventDefault()
                const item = this.getItem(data.row);
                if (item) {
                    actions.unpublishTimeline(item.Id, true);
                    actions.getTimelines();
                }
            },
            "js-copy": function (e, data) {
                e.preventDefault();
                const item = this.getItem(data.row);
                if (item) {
                    actions.copyTimeline(item.Id)
                }
            },
            "remove-timeline-button": function (e, data) {
                e.preventDefault();
                const item = this.getItem(data.row);
                if (item) {
                    (+item.State) ===  1 && actions.removeTimeline(item.Id);
                    actions.getTimelines();
                }
            }
        },
    };

    const FILTER_CONFIG: Array<FilterField> = useMemo(() => {
        return getFilterConfig(filter.current)
    }, [filter.current]);

    const _onApplyFilter = (filterData) => {
        filter.current = filterData;
        let params = convertFilter2Params(filterData);
        actions.applyFilter(params)
    };

    const openTimelineForm = () => {
        props.history.push(`timelines/new`);
    };


    return (
        <React.Fragment>
            <div className="timelines-page form _scrollable-y">
                <h5 className="form-header _grey70">??????????????????</h5>
                <FilterRow fields={FILTER_CONFIG}
                           onApply={_onApplyFilter}
                           onChangeVisibility={_onResize}/>
                <button className="open-form-button" onClick={openTimelineForm}>
                    <PlusIco/>
                </button>
                <div className="grid-container timelines-table unselectable">
                    <Webix ui={GRID_CONFIG} data={timelines}/>
                </div>
            </div>

        </React.Fragment>
    )
};

const mapState2Props = (state) => {
    return {
        timelines: timelinesSelector(state),
        fetching: timelinesFetchingSelector(state),
        selectedTask: taskSelector(state),
        hasAdminRights: hasAdminRights(state),
        hasSupervisorRights: hasSupervisorRights(state),
        editorMode: timelineOpenedSelector,
        timelineInEditor: currentTimelineSelector,
        sideBarMenuVisible: sideBarMenuVisible(state),
    }
};

const mapDispatch2Props = (dispatch) => {
    return {
        actions: bindActionCreators({
            getTimelines,
            applyFilter,
            setInitState,
            setPathname,
            setGridSortOrder,
            openTimelineEditor,
            selectTimeline,
            hideSideBarMenu,
            setTemporaryEvents,
            clearSelectedTimeline,
            setTemporaryPeriods,
            updateTimeline,
            publishTimeline,
            unpublishTimeline,
            removeTimeline,
            copyTimeline
        }, dispatch)
    }
};

export default connect(mapState2Props, mapDispatch2Props)(withRouter(Timelines));
