import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useLocation, withRouter} from 'react-router-dom';
import {useWindowSize} from "../../tools/window-resize-hook";
import {convertFilter2Params, getFilterConfig, parseParams, resizeHandler} from "./functions";
import type {GridSortOrder} from "../../types/grid";
import {GRID_SORT_DIRECTION} from "../../constants/common";
import FilterRow from "../filter";
import Webix from "../Webix";
import type {FilterField} from "../filter/types";
import {showTaskEditor} from "tt-ducks/process-task";
import ModalTaskEditor from '../../components/process-page/editors/process-task-editor'
import {taskSelector} from "tt-ducks/task";
import {bindActionCreators} from "redux";
import {applyFilter, setGridSortOrder, setInitState, setPathname} from "tt-ducks/route";
import {connect} from "react-redux";
import './notifications.sass';
import {fetchingSelector, getNotifications, markNotifsAsRead, notificationsSelector} from "tt-ducks/notifications";
import {NOTIFICATION_TYPES} from "../../constants/notifications";
import {hasAdminRights} from "tt-ducks/auth";

let notificationsCount = 0;

const Notifications = (props) => {
    const {fetching, actions, notifications, showModal, hasAdminRights} = props;

    const location = useLocation();

    const _sortRef = useRef({field: null, direction: null}),
        filter = useRef(null);

    const [modalInfo, setModalInfo] = useState({});
    const [notificationUuid, setNotifUuid] = useState(null);

    useWindowSize(() => {
        resizeHandler(notificationsCount)
    });

    useEffect(() => {
        notificationsCount = props.notifications.length;
        _onResize();
    }, [notifications]);

    useEffect(() => {
        const initState = parseParams();
        if (initState.order) {
            _sortRef.current = initState.order
            const _grid = window.webix.$$("notifications-grid");
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
            actions.getNotifications();
        }
    }, [location]);

    useEffect(() => {
        if (showModal) {
            setModalInfo({
                ...modalInfo,
                taskId: location.pathname.split('tasks/')[0].match(/\d+/)[0]
            });

        }
    }, [showModal]);

    const _onResize = useCallback(() => {
        resizeHandler(notificationsCount.length)
    }, [notifications]);

    function getUpdatedNotifications() {
        actions.getNotifications();
    }

    const GRID_CONFIG = {
        view: "datatable",
        id: 'notifications-grid',
        css: 'tt-grid ',
        hover: "row-hover",
        scroll: 'none',
        headerRowHeight: 40,
        rowHeight: 72,
        height: 1000,
        select: true,
        editable: false,
        scheme: {
            $change: function (item) {
                if (item.NotRead)
                    item.$css = "notif-not-read";
            }
        },
        columns: [
            {
                id: 'TimeCr', header: 'Дата/Время', minWidth: 50, fillspace: 10, format: function (value) {
                    let fn = window.webix.Date.dateToStr("%d.%m.%Y", false);
                    return value ? fn(new Date(value)) : '';
                }
            },
            {
                id: 'NotifType', header: 'Тип', minWidth: 50, fillspace: 35, editor: 'select',
                options: [
                    {id: '1', value: NOTIFICATION_TYPES["1"]},
                    {id: '2', value: NOTIFICATION_TYPES["2"]},
                    {id: '3', value: NOTIFICATION_TYPES["3"]},
                    {id: '3', value: NOTIFICATION_TYPES["4"]}
                ]
            },
            {id: 'Subject', header: 'Описание', minWidth: 100, fillspace: !hasAdminRights ? 45 : 30},
            {
                id: 'Urgent', header: 'Срочность', minWidth: 100, fillspace: 8, format: function (value) {
                    return value ? 'Срочно' : 'Не Срочно'
                }
            },
            {id: 'NotRead', header: 'Непрочитано', hidden: true},
            {id: 'UserName', header: 'Пользователь', hidden: !hasAdminRights, fillspace: 25}
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
                    console.log(item);
                    props.history.push(`/notifications/task/${item.URL.split('tasks/')[1].match(/\d+/)[0]}`);
                    setNotifUuid(item.URL.split('notification=')[1]);
                    actions.showTaskEditor({taskId: item.URL.split('tasks/')[1].match(/\d+/)[0]});
                    actions.markNotifsAsRead([item.Id]);
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
            <div className="notifications-page form _scrollable-y">
                <h5 className="form-header _grey70">Нотификации</h5>
                <FilterRow fields={FILTER_CONFIG} onApply={_onApplyFilter} onChangeVisibility={_onResize}/>
                <div className="grid-container notifications-table">
                    <Webix ui={GRID_CONFIG} data={notifications}/>
                </div>
            </div>

            {showModal && modalInfo.taskId}
            {
                notificationUuid && notificationUuid.length > 0
                && showModal && modalInfo.taskId
                && <ModalTaskEditor taskId={modalInfo.taskId}
                                    editorVisible={showModal}
                                    notifUuid={notificationUuid}
                                    beforeCloseCallback={getUpdatedNotifications}/>
            }
        </React.Fragment>
    )
};

const mapState2Props = (state) => {
    return {
        notifications: notificationsSelector(state),
        fetching: fetchingSelector(state),
        selectedTask: taskSelector(state),
        hasAdminRights: hasAdminRights(state)
    }
};

const mapDispatch2Props = (dispatch) => {
    return {
        actions: bindActionCreators({
            getNotifications,
            applyFilter,
            setInitState,
            setPathname,
            setGridSortOrder,
            showTaskEditor,
            markNotifsAsRead
        }, dispatch)
    }
};

export default connect(mapState2Props, mapDispatch2Props)(withRouter(Notifications));
