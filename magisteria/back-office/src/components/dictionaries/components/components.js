import React, {useCallback, useEffect, useMemo, useRef} from "react";
import {Route, useLocation, withRouter} from 'react-router-dom';
import {useWindowSize} from "../../../tools/window-resize-hook";
import {convertFilter2Params, getFilterConfig, parseParams, resizeHandler} from "./functions";
import {GRID_SORT_DIRECTION} from "../../../constants/common";
import FilterRow from "../../filter";
import Webix from "../../Webix";
import {
    componentFormOpenedSelector,
    componentsDictionarySelector,
    fetchingSelector,
    getComponents,
    selectComponent,
    toggleComponentForm,
} from "tt-ducks/components-dictionary";
import {userWithSupervisorRightsSelector} from "tt-ducks/dictionary"
import {bindActionCreators} from "redux";
import {applyFilter, setGridSortOrder, setInitState, setPathname} from "tt-ducks/route";
import {connect} from "react-redux";
import './components.sass'
import ComponentForm from "./form/form";
import type {GridSortOrder} from "../../../types/grid";
import type {FilterField} from "../../filter/types";

let _componentsCount = 0;

const DictionaryComponents = (props) => {
    const {components, fetching, actions, supervisors} = props;
    const location = useLocation();
    const _sortRef = useRef({field: null, direction: null}),
        filter = useRef(null);

    const openUserForm = () => {
        actions.toggleComponentForm(true);
    };

    useWindowSize(() => {
        resizeHandler(_componentsCount)
    });

    useEffect(() => {
        if(!fetching &&  supervisors.length > 0 && supervisors.some(sup => sup.hasOwnProperty('Id'))) {
            actions.getComponents();
        }
    },[supervisors]);

    useEffect(() => {
        _componentsCount = props.components.length;
        _onResize();
    }, [components]);

    useEffect(() => {
        const initState = parseParams()
        if (initState.order) {
            _sortRef.current = initState.order
            const _grid = window.webix.$$("dictionary-components-grid");
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

        if(!fetching && supervisors.length > 0){
            actions.getComponents();
        }
    }, [location]);

    useEffect(() => {
        if(components.length > 0){
            const splitedPathname = location.pathname.split('/');
            const locationComponentId = +(splitedPathname[splitedPathname.length - 1]);

            if(Number.isInteger(locationComponentId)){
                actions.selectComponent(locationComponentId);
                actions.toggleComponentForm(true);
            }
        }
    },[components]);



    const _onResize = useCallback(() => {
        resizeHandler(components.length)
    }, [components]);
    //
    const GRID_CONFIG = {
        view: "datatable",
        id: 'dictionary-components-grid',
        css: 'tt-grid ',
        hover: "row-hover",
        scroll: 'none',
        headerRowHeight: 40,
        rowHeight: 72,
        height: 1000,
        select: true,
        editable: false,
        columns: [
            {id: 'Id', header: 'Id', minWidth: 50, fillspace: 10},
            {id: 'Name', header: 'Имя компонента', minWidth: 100, fillspace: 25},
            {id: 'SupervisorName', header: 'Ответственный', minWidth: 100, fillspace: 25},
            {id: 'StructName', header: 'Структура Проекта', minWidth: 100, fillspace: 35},
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
                    actions.selectComponent(item.Id);
                    actions.toggleComponentForm(true);
                    props.history.push(`/dictionaries/components/${item.Id}`);
                }

            }
        },
        onClick: {
            "elem-delete": function (e, data) {
                console.log('component removed')
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


    return (
        <React.Fragment>
            <div className="dictionary-components-page form _scrollable-y">
                <h5 className="form-header _grey70">Справочник компонентов</h5>
                <FilterRow fields={FILTER_CONFIG} onApply={_onApplyFilter} onChangeVisibility={_onResize}/>
                <div className="grid-container components-table unselectable">
                    <Webix ui={GRID_CONFIG} data={components}/>
                </div>
                {props.modalVisible
                    ? <Route exact path="/dictionaries/components/:id" component={ComponentForm} />
                    : null
                }

            </div>

        </React.Fragment>
    )
};

const mapState2Props = (state) => {
    return {
        components: componentsDictionarySelector(state),
        fetching: fetchingSelector(state),
        supervisors: userWithSupervisorRightsSelector(state),
        modalVisible: componentFormOpenedSelector(state)
    }
};

const mapDispatch2Props = (dispatch) => {
    return {
        actions: bindActionCreators({
            getComponents,
            applyFilter,
            setInitState,
            setPathname,
            setGridSortOrder,
            selectComponent,
            toggleComponentForm
        }, dispatch)
    }
};

export default connect(mapState2Props, mapDispatch2Props)(withRouter(DictionaryComponents));
