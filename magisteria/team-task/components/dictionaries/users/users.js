import React, {useCallback, useEffect, useMemo, useRef} from "react";
import {Route, useLocation, withRouter} from 'react-router-dom';
import {useWindowSize} from "../../../tools/window-resize-hook";
import {convertFilter2Params, getFilterConfig, parseParams, resizeHandler} from "./functions";
import {GRID_SORT_DIRECTION} from "../../../constants/common";
import FilterRow from "../../filter";
import Webix from "../../Webix";
import {
    deleteUser,
    fetchingSelector as userDictionaryFetching,
    getUsers,
    selectUser,
    toggleUserForm,
    userFormOpenedSelector,
    usersDictionarySelector
} from "tt-ducks/users-dictionary";
import {bindActionCreators} from "redux";
import {applyFilter, setGridSortOrder, setInitState, setPathname} from "tt-ducks/route";
import {connect} from "react-redux";
import {USER_ROLE_STRINGS} from "../../../constants/dictionary-users";
import './users.sass'
import PlusIco from "tt-assets/svg/plus.svg";
import UserForm from "./form/form";
import {hasAdminRights} from "tt-ducks/auth";
import {
    fetchingSelector as rolesFetching,
    getRights,
    getRolesWithPermissions,
    rolesPermissionsSelector
} from "tt-ducks/access-rights-dictionary";
import type {GridSortOrder} from "../../../types/grid";
import type {FilterField} from "../../filter/types";

let _usersCount = 0;

const DictionaryUsers = (props) => {
    const {users, fetching, actions, isAdmin} = props;
    const location = useLocation();
    const _sortRef = useRef({field: null, direction: null}),
        filter = useRef(null);

    const openUserForm = () => {
        actions.toggleUserForm(true);
        props.history.push(`/dictionaries/users/new`);
    };

    useWindowSize(() => {
        resizeHandler(_usersCount)
    });

    useEffect(() => {
        if(users.length > 0){
            const splitedPathname = location.pathname.split('/');
            const locationComponentId = +(splitedPathname[splitedPathname.length - 1]);

            if(Number.isInteger(locationComponentId)){
                actions.selectUser(locationComponentId);
                actions.toggleUserForm(true);
            }
        }
    },[users]);

    useEffect(() => {
        _usersCount = props.users.length;
        _onResize();
    }, [users]);

    useEffect(() => {
        const initState = parseParams()
        if (initState.order) {
            _sortRef.current = initState.order
            const _grid = window.webix.$$("dictionary-users-grid");
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
            actions.getUsers();
            actions.getRolesWithPermissions();
            actions.getRights();
        }


    }, [location]);

    const _onResize = useCallback(() => {
        resizeHandler(users.length)
    }, [users]);
    //
    const GRID_CONFIG = {
        view: "datatable",
        id: 'dictionary-users-grid',
        css: 'tt-grid ',
        hover: "row-hover",
        scroll: 'none',
        headerRowHeight: 40,
        rowHeight: 72,
        height: 1000,
        select: true,
        editable: false,
        columns: [
            {id: 'Id', header: 'Id', minWidth: 40, fillspace: 7, css: "_number-field"},
            {id: 'DisplayName', header: 'Имя пользователя', minWidth: 100, fillspace: 25},
            {id: 'Email', header: 'Почта', minWidth: 100, fillspace: 25},
            {
                id: 'Role', header: 'Роль пользователя', minWidth: 100, fillspace: 35, editor: 'select',
                options: [
                    {id: 'pma', value: USER_ROLE_STRINGS.pma},
                    {id: 'pms', value: USER_ROLE_STRINGS.pms},
                    {id: 'pme', value: USER_ROLE_STRINGS.pme},
                    {id: 'pmu', value: USER_ROLE_STRINGS.pmu},
                    {id: 'a', value: USER_ROLE_STRINGS.a}
                ],
            },
            {
                id: 'del-btn', header: '', width: 50,
                template: "<button class='process-elements-grid__button elem-delete remove-user-button'/>"
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
                if (id && id.column && (id.column === "del-btn")) return

                const item = this.getItem(id);
                if (item && item.Id) {
                    actions.selectUser(item.Id);
                    actions.toggleUserForm(true);
                    props.history.push(`/dictionaries/users/${item.Id}`);
                }

            }
        },
        onClick: {
            "elem-delete": function (e, data) {
                e.preventDefault()
                const item = this.getItem(data.row)
                if (item) {
                    if (!item.Role.includes("a") || (item.Role.includes("a")  && isAdmin)) {
                        actions.deleteUser(item.Id)
                    }
                }
            }
        },
    };

    const FILTER_CONFIG: Array<FilterField> = useMemo(() => getFilterConfig(filter.current), [filter.current]);

    const _onApplyFilter = (filterData) => {
        filter.current = filterData

        let params = convertFilter2Params(filterData);
        actions.applyFilter(params)
    };


    return (
        <React.Fragment>
            <div className="dictionary-users-page form _scrollable-y">
                <h5 className="form-header _grey70">Справочник пользователей</h5>
                <FilterRow fields={FILTER_CONFIG} onApply={_onApplyFilter} onChangeVisibility={_onResize}/>
                <button className="open-form-button" onClick={openUserForm}>
                    <PlusIco/>
                </button>
                <div className="grid-container users-table unselectable">
                    <Webix ui={GRID_CONFIG} data={users}/>
                </div>

                {props.modalVisible
                    ? <Route path="/dictionaries/users/:id" component={UserForm} />
                    : null
                }
            </div>

        </React.Fragment>
    )
};

const mapState2Props = (state) => {
    return {
        users: usersDictionarySelector(state),
        rolesPermissions: rolesPermissionsSelector(state),
        fetching: userDictionaryFetching(state) || rolesFetching(state),
        modalVisible: userFormOpenedSelector(state),
        isAdmin: hasAdminRights(state),
    }
};

const mapDispatch2Props = (dispatch) => {
    return {
        actions: bindActionCreators({
            getUsers,
            getRights,
            getRolesWithPermissions,
            applyFilter,
            setInitState,
            setPathname,
            setGridSortOrder,
            selectUser,
            toggleUserForm,
            deleteUser
        }, dispatch)
    }
};

export default connect(mapState2Props, mapDispatch2Props)(withRouter(DictionaryUsers))
