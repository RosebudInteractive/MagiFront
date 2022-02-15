import React, {useCallback, useEffect, useMemo, useRef} from "react";
import {Route, useLocation, withRouter} from 'react-router-dom';
import {useWindowSize} from "../../../tools/window-resize-hook";
import {convertFilter2Params, getFilterConfig, parseParams, resizeHandler} from "./functions";
import {GRID_SORT_DIRECTION} from "../../../constants/common";
import FilterRow from "../../filter";
import Webix from "../../Webix";
import {
    // fetchingSelector,
    getRights,
    rightFormOpenedSelector,
    rightsDictionarySelector,
    selectRight,
    toggleRightForm,
} from "tt-ducks/access-rights-dictionary";
import {getTaskType, getTaskTypes, updateTaskType, deleteTaskType, currentTaskTypeSelector, taskTypesSelector, selectTaskType, fetchingSelector, setNewTaskType} from "../../../ducks/task";
import {userWithSupervisorRightsSelector} from "tt-ducks/dictionary"
import {bindActionCreators} from "redux";
import {applyFilter, setGridSortOrder, setInitState, setPathname} from "tt-ducks/route";
import {connect} from "react-redux";
import './task-types.sass'
import PlusIco from "tt-assets/svg/plus.svg";
import TaskTypeForm from './form'



let taskTypesCount = 0;

const TaskTypes = (props) => {

    const {taskTypes, currentTaskType, fetching, actions} = props;
    const location = useLocation();
    const _sortRef = useRef({field: null, direction: null}),
        filter = useRef(null);

    useWindowSize(() => {
        resizeHandler(taskTypesCount)
    });

    useEffect(() => {
        taskTypesCount = taskTypes.length;
        _onResize();

        if (taskTypes.length > 0) {
            const splitedPathname = location.pathname.split('/');
            const locationComponentId = +(splitedPathname[splitedPathname.length - 1]);

            if (Number.isInteger(locationComponentId)) {
                // actions.selectRight(locationComponentId);
                // actions.toggleRightForm(true);
            }
        }
    }, [taskTypes]);

    useEffect(() => {
        console.log('location', location)
        !currentTaskType && actions.selectTaskType()
    }, [location])

    useEffect(() => {

    }, [taskTypes]);

    useEffect(() => {
        const initState = parseParams()
        if (initState.order) {
            _sortRef.current = initState.order
            const _grid = window.webix.$$("dictionary-task-types-grid");
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
            actions.getTaskTypes();
            // action.getRights()
        }
    }, [location]);

    useEffect(() => {
        if(currentTaskType === null){
            actions.getTaskTypes()
        }
    }, [currentTaskType])


    const _onResize = useCallback(() => {
        resizeHandler(taskTypes.length)
    }, [taskTypes]);
    //
    const GRID_CONFIG = {
        view: "datatable",
        id: 'dictionary-task-types-grid',
        css: 'tt-grid ',
        hover: "row-hover",
        scroll: 'none',
        headerRowHeight: 40,
        rowHeight: 72,
        height: 1000,
        select: true,
        editable: false,
        columns: [
            {id: 'Id', header: 'Id'},
            {id: 'Code', header: 'Код'},
            {id: 'Name', header: 'Название', fillspace: true},
            {
                id: 'del-btn', header: '', width: 50,
                template: function (data) {
                    return "<button class='process-elements-grid__button elem-delete remove-timeline-button'/>";
                    //     return data.State !== 2 ? "<button class='process-elements-grid__button elem-delete remove-timeline-button'/>" : ""
                }
            },
        ],
        on: {
            onHeaderClick: function (header) {
                const _sort = _sortRef.current;

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
                console.log('item', item)
                if (item && item.Id) {
                    actions.selectTaskType(item.Id);
                    // actions.selectRight(item.Id);
                    // actions.toggleRightForm(true);
                    props.history.push(`/dictionaries/task-types/${item.Id}`);
                }

            }
        },
        onClick: {
            "elem-delete": function (e, data) {
                console.log('it delete')
                e.preventDefault();

                const item = this.getItem(data.row);
                if (item && item.Id) {
                    actions.deleteTaskType(item.Id)
                    // actions.selectRight(item.Id);
                    // actions.toggleRightForm(true);
                    // props.history.push(`/dictionaries/task-types/${item.Id}`);
                }

            }
        },
    };

    const FILTER_CONFIG = useMemo(() => {
        return getFilterConfig(filter.current)
    }, [filter.current]);

    const _onApplyFilter = (filterData: null) => {
        filter.current = filterData;
        let params = convertFilter2Params(filterData);
        actions.applyFilter(params)
    };

    const createTaskType = () => {
        actions.setNewTaskType()
        props.history.push(`/dictionaries/task-types/new`);
    }


    return (
        <React.Fragment>
            <div className="dictionary-task-types-page form _scrollable-y">
                <h5 className="form-header _grey70">Справочник типов задач</h5>
                <FilterRow fields={FILTER_CONFIG} onApply={_onApplyFilter} onChangeVisibility={_onResize}/>
                <button className="open-form-button" onClick={createTaskType}>
                    <PlusIco/>
                </button>
                <div className="grid-container task-types-table unselectable">
                    <Webix ui={GRID_CONFIG} data={taskTypes}/>
                </div>
                {(currentTaskType)
                    ? <Route path="/dictionaries/task-types/:id" component={TaskTypeForm}/>
                    : null}

            </div>

        </React.Fragment>
    )
};

const mapState2Props = (state) => {
    return {
        taskTypes: taskTypesSelector(state),
        fetching: fetchingSelector(state),
        currentTaskType: currentTaskTypeSelector(state),
        supervisors: userWithSupervisorRightsSelector(state),
        // roles: rightsDictionarySelector(state)
        // modalVisible: rightFormOpenedSelector(state)
    }
};

const mapDispatch2Props = (dispatch) => {
    return {
        actions: bindActionCreators({
            getTaskTypes,
            getTaskType,
            updateTaskType,
            deleteTaskType,
            selectTaskType,
            applyFilter,
            setInitState,
            setNewTaskType,
            setPathname,
            setGridSortOrder,
            selectRight,
            toggleRightForm
        }, dispatch)
    }
};

export default connect(mapState2Props, mapDispatch2Props)(withRouter(TaskTypes));

