import {appName} from "../config";
import {Record} from "immutable";
import {createSelector} from 'reselect'
import {all, call, put, select, takeEvery} from "@redux-saga/core/effects";
import {showErrorMessage} from "tt-ducks/messages";
import {clearLocationGuard, paramsSelector} from "tt-ducks/route";
import {commonGetQuery} from "tools/fetch-tools";
import {checkStatus, parseJSON} from "../../src/tools/fetch-tools";

export const moduleName = 'notifications';
const prefix = `${appName}/${moduleName}`;

const SET_NOTIFICATIONS = `${prefix}/SET_NOTIFICATIONS`;
const LOAD_NOTIFICATIONS = `${prefix}/LOAD_NOTIFICATIONS`;
const REQUEST_START = `${prefix}/REQUEST_START`;
const REQUEST_SUCCESS = `${prefix}/REQUEST_SUCCESS`;
const REQUEST_FAIL = `${prefix}/REQUEST_FAIL`;
const MARK_NOTIFICATIONS_AS_READ = `${prefix}/MARK_NOTIFICATIONS_AS_READ}`;

export const ReducerRecord = Record({
    notifications: [],
    fetching: false,
});

export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action;

    switch (type) {
        case REQUEST_START:
            return state.set('fetching', true);
        case REQUEST_SUCCESS:
        case REQUEST_FAIL:
            return state.set('fetching', false);
        case SET_NOTIFICATIONS:
            return state.set('notifications', payload);
        default:
            return state
    }
}

const stateSelector = state => state[moduleName];
export const notificationsSelector = createSelector(stateSelector, state => state.notifications);
export const newNotifsCountSelector = createSelector(stateSelector, state => state.notifications.filter(notif => notif.NotRead === true).length);
export const fetchingSelector = createSelector(stateSelector, state => state.fetching);

//params: notRead,urgent,type
export const getNotifications = (notRead = null, urgent = null, type) => {
    return {type: LOAD_NOTIFICATIONS, payload: {notRead, urgent, type}}
};

export const markNotifsAsRead = (notifIds = []) => {
    return {type: MARK_NOTIFICATIONS_AS_READ, payload: notifIds}
};


export const saga = function* () {
    yield all([
        takeEvery(LOAD_NOTIFICATIONS, getNotificationsSaga),
        takeEvery(MARK_NOTIFICATIONS_AS_READ, updateNotificationsAsRead)
    ])
};

function* updateNotificationsAsRead(data) {
    yield put({type: REQUEST_START});
    try {
        yield call(updateNotificationAsRead,data.payload); //response.result might be 'OK'
        yield put({type: REQUEST_SUCCESS});
    } catch (e) {
        yield put({type: REQUEST_FAIL});
        yield put(clearLocationGuard());
        yield put(showErrorMessage(e.message));
    }
}

function* getNotificationsSaga() {
    yield put({type: REQUEST_START});
    try {
        const params = yield select(paramsSelector);

        let paramsQuery = params.replace('notRead=1', 'notRead=true');
        paramsQuery = paramsQuery.replace('notRead=2', 'notRead=false');
        paramsQuery = paramsQuery.replace('urgent=2', 'urgent=false');
        paramsQuery = paramsQuery.replace('urgent=1', 'urgent=true');
        paramsQuery = paramsQuery.replace('notifType', 'type');
        paramsQuery = `${paramsQuery !== '' ? paramsQuery : ''}`;

        const notifications = yield call(_getNotifications, paramsQuery);

        yield put({
            type: SET_NOTIFICATIONS,
            payload: notifications.map(notif => ({...notif, NotRead: !notif.IsRead, UserName: notif.User.DisplayName}))
        });
        yield put({type: REQUEST_SUCCESS});
        yield put(clearLocationGuard());
    } catch (e) {
        yield put({type: REQUEST_FAIL});
        yield put(clearLocationGuard());
        yield put(showErrorMessage(e.message));
    }
}

const _getNotifications = (params) => {
    let urlString = `/api/pm/notification-list?${params}`;
    return commonGetQuery(urlString);
};

const updateNotificationAsRead = (notifIds = []) => {
    return fetch(`/api/pm/notification/mark-as-read`, {
        method: 'PUT',
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify(notifIds),
        credentials: 'include'
    }).then(checkStatus)
        .then(parseJSON);
};
