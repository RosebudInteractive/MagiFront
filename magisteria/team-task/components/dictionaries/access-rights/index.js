import React, {useCallback, useEffect, useMemo, useRef} from "react";
import {Route, useLocation, withRouter} from 'react-router-dom';
import {useWindowSize} from "../../../tools/window-resize-hook";
import {convertFilter2Params, getFilterConfig, parseParams, resizeHandler} from "./functions";
import {GRID_SORT_DIRECTION} from "../../../constants/common";
import FilterRow from "../../filter";
import Webix from "../../Webix";
import {
    fetchingSelector,
    getRights,
    rightFormOpenedSelector,
    rightsDictionarySelector,
    selectRight,
    toggleRightForm,
} from "tt-ducks/access-rights-dictionary";
import {userWithSupervisorRightsSelector} from "tt-ducks/dictionary"
import {bindActionCreators} from "redux";
import {applyFilter, setGridSortOrder, setInitState, setPathname} from "tt-ducks/route";
import {connect} from "react-redux";
import './access-rights.sass'
import RightForm from './form'

let _rightsCount = 0;

const AccessRights = (props) => {
    const {rights, fetching, actions} = props;
    const location = useLocation();
    const _sortRef = useRef({field: null, direction: null}),
        filter = useRef(null);

    useWindowSize(() => {
        resizeHandler(_rightsCount)
    });

    useEffect(() => {
        _rightsCount = rights.length;
        _onResize();

        if (rights.length > 0) {
            const splitedPathname = location.pathname.split('/');
            const locationComponentId = +(splitedPathname[splitedPathname.length - 1]);

            if (Number.isInteger(locationComponentId)) {
                actions.selectRight(locationComponentId);
                actions.toggleRightForm(true);
            }
        }
    }, [rights]);

    useEffect(() => {
        const initState = parseParams()
        if (initState.order) {
            _sortRef.current = initState.order
            const _grid = window.webix.$$("dictionary-rights-grid");
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
            actions.getRights();
        }
    }, [location]);


    const _onResize = useCallback(() => {
        resizeHandler(rights.length)
    }, [rights]);
    //
    const GRID_CONFIG = {
        view: "datatable",
        id: 'dictionary-rights-grid',
        css: 'tt-grid ',
        hover: "row-hover",
        scroll: 'none',
        headerRowHeight: 40,
        rowHeight: 72,
        height: 1000,
        select: true,
        editable: false,
        columns: [
            {id: 'Id', header: 'Id', hidden: true},
            {id: 'ShortCode', header: 'Краткое название'},
            {id: 'Name', header: 'Название'},
            {id: 'Code', header: 'Код'},
            {id: 'Description', header: 'Описание', fillspace: true}
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
                if (item && item.Id) {
                    actions.selectRight(item.Id);
                    actions.toggleRightForm(true);
                    props.history.push(`/dictionaries/rights/${item.Id}`);
                }

            }
        },
        onClick: {
            "elem-delete": function () {
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


    return (
        <React.Fragment>
            <div className="dictionary-rights-page form _scrollable-y">
                <h5 className="form-header _grey70">Справочник ролей</h5>
                <FilterRow fields={FILTER_CONFIG} onApply={_onApplyFilter} onChangeVisibility={_onResize}/>
                <div className="grid-container rights-table unselectable">
                    <Webix ui={GRID_CONFIG} data={rights}/>
                </div>
                {props.modalVisible
                    ? <Route path="/dictionaries/rights/:id" component={RightForm}/>
                    : null
                }

            </div>

        </React.Fragment>
    )
};

const mapState2Props = (state) => {
    return {
        rights: rightsDictionarySelector(state),
        fetching: fetchingSelector(state),
        supervisors: userWithSupervisorRightsSelector(state),
        modalVisible: rightFormOpenedSelector(state)
    }
};

const mapDispatch2Props = (dispatch) => {
    return {
        actions: bindActionCreators({
            getRights,
            applyFilter,
            setInitState,
            setPathname,
            setGridSortOrder,
            selectRight,
            toggleRightForm
        }, dispatch)
    }
};

export default connect(mapState2Props, mapDispatch2Props)(withRouter(AccessRights));
