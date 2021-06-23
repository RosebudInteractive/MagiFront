import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useLocation, withRouter} from 'react-router-dom';
import {useWindowSize} from "../../tools/window-resize-hook";
import {convertFilter2Params, getFilterConfig, parseParams, resizeHandler} from "./functions";
import type {GridSortOrder} from "../../types/grid";
import {GRID_SORT_DIRECTION} from "../../constants/common";
import FilterRow from "../../components/filter";
import Webix from "../../components/Webix";
import type {FilterField} from "../../components/filter/types";
import {showTaskEditor} from "tt-ducks/process-task";
import ModalTaskEditor from '../../components/process-page/editors/process-task-editor'
import {taskSelector} from "tt-ducks/task";
import {bindActionCreators} from "redux";
import {applyFilter, setGridSortOrder, setInitState, setPathname} from "tt-ducks/route";
import {connect} from "react-redux";
import './notifications.sass';
import {fetchingSelector, getNotifications, markNotifsAsRead, notificationsSelector} from "tt-ducks/notifications";
import {NOTIFICATION_TYPES} from "../../constants/notifications";
import {hasAdminRights, hasSupervisorRights} from "tt-ducks/auth";

let notificationsCount = 0;

const Notifications = (props) => {
    const {fetching, actions, notifications, showModal, hasAdminRights, hasSupervisorRights} = props;

    const location = useLocation();

    const _sortRef = useRef({field: null, direction: null}),
        filter = useRef(null);

    const [modalInfo, setModalInfo] = useState({});
    const [notificationUuid, setNotifUuid] = useState(null);

    useWindowSize(() => {
        resizeHandler(notificationsCount)
    });

    useEffect(() => {
        notificationsCount = notifications.length;
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
        const notificationIdentifier = location.search.split('notification=')[1];

        if (notificationIdentifier && notificationIdentifier.length > 0 && location.pathname.includes('task/')) {
            const taskId = location.pathname.split('task/')[1].match(/\d+/)[0];
            setNotifUuid(notificationIdentifier);
            setModalInfo({...modalInfo, taskId: taskId});
            actions.showTaskEditor({taskId: taskId});
        }
    }, []);

    useEffect(() => {
        if (showModal && location.pathname.split('task/') !== undefined) {
            setModalInfo({
                ...modalInfo,
                taskId: location.pathname.split('task/')[1].match(/\d+/)[0]
            });
        }
    }, [showModal]);

    const _onResize = useCallback(() => {
        resizeHandler(notificationsCount)
    }, [notifications]);

    function getUpdatedNotifications() {
        actions.getNotifications();
        setNotifUuid(null);
        props.history.push(`/notifications`);
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
                id: 'NotifType', header: 'Тип', minWidth: 50, fillspace: 20, editor: 'select',
                options: [
                    {id: '1', value: NOTIFICATION_TYPES["1"]},
                    {id: '2', value: NOTIFICATION_TYPES["2"]},
                    {id: '3', value: NOTIFICATION_TYPES["3"]},
                    {id: '4', value: NOTIFICATION_TYPES["4"]}
                ]
            },
            {
                id: 'Subject',
                header: 'Описание',
                minWidth: 100,
                fillspace: (!hasAdminRights || !hasSupervisorRights) ? 45 : 30
            },
            {
                id: 'Urgent',
                header: 'Приоритет',
                minWidth: 100,
                fillspace: (!hasAdminRights || !hasSupervisorRights) ? 15 : 8,
                format: function (value) {
                    return value ? 'Срочно' : 'Не Срочно'
                }
            },
            {id: 'NotRead', header: 'Непрочитано', hidden: true},
            {id: 'UserName', header: 'Пользователь', hidden: (!hasAdminRights || !hasSupervisorRights), fillspace: 25}
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
                    const taskId = item.URL.split('task/')[1].match(/\d+/)[0];
                    props.history.push(`/notifications/task/${taskId}?notification=${item.URL.split('notification=')[1]}`);
                    setNotifUuid(item.URL.split('notification=')[1]);
                    actions.showTaskEditor({taskId: taskId});
                }

            }
        }
    };

    const FILTER_CONFIG: Array<FilterField> = useMemo(() => {
        return getFilterConfig(filter.current, !(hasSupervisorRights && hasAdminRights) ? ["UserName"] : [])
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
        hasAdminRights: hasAdminRights(state),
        hasSupervisorRights: hasSupervisorRights(state)
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
