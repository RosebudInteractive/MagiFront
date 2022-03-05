import {appName} from '../config'
import {createSelector} from 'reselect'
import {OrderedMap, Record,} from 'immutable'
import {replace} from 'react-router-redux'
import 'whatwg-fetch';
import {checkStatus, handleJsonError, parseJSON} from "../tools/fetch-tools";
import {isDirty, reset,} from 'redux-form'
import {HIDE_DELETE_DLG, SHOW_ERROR_DIALOG} from "../constants/Common";
import {all, takeEvery, put, call, select} from 'redux-saga/effects'
import {confirmCloseEditorSaga} from "adm-ducks/messages";

/**
 * Constants
 * */
export const moduleName = 'promo-codes'
const prefix = `${appName}/${moduleName}`

export const GET_PROMO_CODES_REQUEST = `${prefix}/GET_PROMO_CODES_REQUEST`
export const GET_PROMO_CODES_START = `${prefix}/GET_PROMO_CODES_START`
export const GET_PROMO_CODES_SUCCESS = `${prefix}/GET_PROMO_CODES_SUCCESS`
export const GET_PROMO_CODES_FAIL = `${prefix}/GET_PROMO_CODES_FAIL`

export const CREATE_NEW_PROMO_REQUEST = `${prefix}/CREATE_NEW_PROMO_REQUEST`
export const CREATE_NEW_PROMO_START = `${prefix}/CREATE_NEW_PROMO_START`

export const EDIT_CURRENT_PROMO_REQUEST = `${prefix}/EDIT_CURRENT_PROMO_REQUEST`
export const EDIT_CURRENT_PROMO_START = `${prefix}/EDIT_CURRENT_PROMO_START`

export const SHOW_EDITOR = `${prefix}/SHOW_EDITOR`
export const CLOSE_EDITOR_REQUEST = `${prefix}/CLOSE_EDITOR_REQUEST`
export const CLOSE_EDITOR = `${prefix}/CLOSE_EDITOR`

export const INSERT_PROMO_REQUEST = `${prefix}/INSERT_PROMO_REQUEST`
export const INSERT_PROMO_START = `${prefix}/INSERT_PROMO_START`
export const INSERT_PROMO_SUCCESS = `${prefix}/INSERT_PROMO_SUCCESS`
export const INSERT_PROMO_FAIL = `${prefix}/INSERT_PROMO_FAIL`

export const UPDATE_PROMO_REQUEST = `${prefix}/UPDATE_PROMO_REQUEST`
export const UPDATE_PROMO_START = `${prefix}/UPDATE_PROMO_START`
export const UPDATE_PROMO_SUCCESS = `${prefix}/UPDATE_PROMO_SUCCESS`
export const UPDATE_PROMO_FAIL = `${prefix}/UPDATE_PROMO_FAIL`

export const DELETE_PROMO_REQUEST = `${prefix}/DELETE_PROMO_REQUEST`
export const DELETE_PROMO_START = `${prefix}/DELETE_PROMO_START`
export const DELETE_PROMO_SUCCESS = `${prefix}/DELETE_PROMO_SUCCESS`
export const DELETE_PROMO_FAIL = `${prefix}/DELETE_PROMO_FAIL`

export const RAISE_ERROR_REQUEST = `${prefix}/RAISE_ERROR_REQUEST`

const NOT_EXIST_PROMO_ERROR = "Запрошенного промокода не существует"

/**
 * Reducer
 * */
const ReducerRecord = Record({
    loading: false,
    loaded: false,
    showEditor: false,
    editMode: true,
    selected: null,
    hasChanges: false,
    entries: new OrderedMap([])
})

const PromoRecord = Record({
    Id: null,
    Code: null,
    Description: null,
    Perc: null,
    Counter: 0,
    FirstDate: null,
    LastDate: null,
    Products: [],
    Rest: null,
})


export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action

    switch (type) {
        case GET_PROMO_CODES_START: {
            return state
                .set('loaded', false)
                .set('loading', true)
        }

        case GET_PROMO_CODES_SUCCESS: {
            return state
                .set('loading', false)
                .set('loaded', true)
                .set('entries', dataToEntries(payload, PromoRecord))
        }

        case GET_PROMO_CODES_FAIL: {
            return state
                .set('loaded', false)
                .set('loading', false)
        }

        case CREATE_NEW_PROMO_START:
            return state.set('editMode', false)

        case EDIT_CURRENT_PROMO_START:
            return state
                .set('selected', payload)
                .set('editMode', true)

        case DELETE_PROMO_SUCCESS:
            return state
                .update('entries', entries => entries.delete(payload))

        case SHOW_EDITOR:
            return state.set('showEditor', true)

        case CLOSE_EDITOR:
            return state.set('showEditor', false)

        default:
            return state
    }
}


/**
 * Selectors
 * */
const stateSelector = state => state[moduleName]
export const loadingSelector = createSelector(stateSelector, state => state.loading)
export const loadedSelector = createSelector(stateSelector, state => state.loaded)

const entriesSelector = createSelector(stateSelector, state => state.entries)
export const promosSelector = createSelector(entriesSelector, (entries) => {
    let _array = entries.toArray();

    return _array.map((item) => {
        let _item = item.toObject()

        _item.id = _item.Id
        return _item
    })
})
export const showEditorSelector = createSelector(stateSelector, state => state.showEditor)
export const editModeSelector = createSelector(stateSelector, state => state.editMode)
export const selectedIdSelector = createSelector(stateSelector, state => state.selected)

/**
 * Action Creators
 * */
export const getPromoCodes = () => {
    return {type : GET_PROMO_CODES_REQUEST}
}

export const createPromo = () => {
    return { type : CREATE_NEW_PROMO_REQUEST }
}

export const editCurrentPromo = (id) => {
    return {type: EDIT_CURRENT_PROMO_REQUEST, payload: id}
}

export const closeEditor = () => {
    return {type: CLOSE_EDITOR_REQUEST}
}

export const insertPromo = (data) => {
    return {type: INSERT_PROMO_REQUEST, payload: data}
}

export const updatePromo = (data) => {
    return {type: UPDATE_PROMO_REQUEST, payload: data}
}

export const deletePromo = (data) => {
    return {type: DELETE_PROMO_REQUEST, payload: data}
}

export const raiseNotExistPromoError = () => {
    return {type: RAISE_ERROR_REQUEST}
}


/**
 * Sagas
 */
function* getPromoCodesSaga() {
    yield put({type: GET_PROMO_CODES_START})

    try {
        const _promos = yield call(_fetchPromoCodes)

        yield put( {type: GET_PROMO_CODES_SUCCESS, payload: _promos} )
    } catch (e) {
        yield put({ type: GET_PROMO_CODES_FAIL, payload: {e} })

        let _message
        if (e.response) {
            _message = yield call(handleJsonError, e)
        } else {
            _message = e.message ? e.message : "unknown error"
        }

        yield put({type: SHOW_ERROR_DIALOG, payload: _message})
    }
}

const _fetchPromoCodes = () => {
    return fetch("/api/promo-codes?is_visible=true", {method: 'GET', credentials: 'include'})
        .then(checkStatus)
        .then(parseJSON)
}

function* createPromoCodeSaga(){
    yield put(replace('/adm/promos/new'))

    yield put({type: CREATE_NEW_PROMO_START})
    yield put({type: SHOW_EDITOR})
}

function* editPromoRequestSaga(action) {
    const _editorOpened = yield select(showEditorSelector)

    if (_editorOpened) {
        const _hasChanges = yield select(isDirty('PromoEditor'))

        if (_hasChanges) {
            const _confirmed = yield call(confirmCloseEditorSaga);

            if (_confirmed) {
                yield call(editPromoSaga, action.payload)
            }
        } else {
            yield call(editPromoSaga, action.payload)
        }
    } else {
        yield call(editPromoSaga, action.payload)
    }
}

function* editPromoSaga(id) {
    yield put(replace('/adm/promos/edit/' + id))

    yield put({type: EDIT_CURRENT_PROMO_START, payload: id})
    yield put({type: SHOW_EDITOR})
}

function* closeEditorWithCheckSaga() {
    const _hasChanges = yield select(isDirty('PromoEditor'))

    if (_hasChanges) {
        const _confirmed = yield call(confirmCloseEditorSaga);

        if (_confirmed) {
            yield call(closeEditorSaga)
        }
    } else {
        yield call(closeEditorSaga)
    }
}

function* closeEditorSaga() {
    yield put(replace('/adm/promos'))
    yield put({type: CLOSE_EDITOR})
}

function* insertPromoSaga(action) {
    yield put({type: INSERT_PROMO_START})

    try {
        let _data = {...action.payload}

        let _payload = {
            Code: _data.code,
            Description: _data.description,
            Perc: _data.perc,
            Counter: _data.counter,
            FirstDate: _data.firstDate,
            LastDate: _data.lastDate,
            Products: _data.products.slice()
        }

        const _newData = yield call(_postPromo, _payload)

        yield put({type: INSERT_PROMO_SUCCESS, payload: _newData})

        yield put(reset('PromoEditor'))
        yield put({type: GET_PROMO_CODES_REQUEST})
        yield put({type: CLOSE_EDITOR})
    } catch (error) {
        yield put({ type: INSERT_PROMO_FAIL })

        yield put({
            type: SHOW_ERROR_DIALOG,
            payload: error.message
        })
    }
}

const _postPromo = (data) => {
    return fetch("/api/adm/promo-codes", {
        method: 'POST',
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify(data),
        credentials: 'include'
    })
        .then(checkStatus)
        .then(parseJSON)
}

function* deletePromoSaga(data) {
    yield put({type: DELETE_PROMO_START})
    yield put({type: HIDE_DELETE_DLG})

    try {
        yield call(_deletePromo, data.payload)
        yield put({type: DELETE_PROMO_SUCCESS, payload: data.payload})
    } catch (error) {
        yield put({type: DELETE_PROMO_FAIL})

        yield put({
            type: SHOW_ERROR_DIALOG,
            payload: error.message
        })
    }
}

const _deletePromo = (id) => {
    return fetch("/api/adm/promo-codes/" + id,
        {
            method: "DELETE",
            credentials: 'include'
        })
        .then(checkStatus)
        .then(parseJSON)
}

function* updatePromoSaga(action) {
    yield put({type: UPDATE_PROMO_START})

    try {
        let _data = {...action.payload}

        let _payload = {
            Id: _data.Id,
            Code: _data.code,
            Description: _data.description,
            Perc: _data.perc,
            Counter: _data.counter,
            FirstDate: _data.firstDate,
            LastDate: _data.lastDate,
            Products: _data.products.slice()
        }

        const _newData = yield call(_putPromo, _payload)

        yield put({type: UPDATE_PROMO_SUCCESS, payload: _newData})

        yield put(reset('PromoEditor'))
        yield put({type: GET_PROMO_CODES_REQUEST})
        yield put({type: CLOSE_EDITOR_REQUEST})
    } catch (error) {
        yield put({ type: UPDATE_PROMO_FAIL })

        yield put({
            type: SHOW_ERROR_DIALOG,
            payload: error.message
        })
    }
}

const _putPromo = (data) => {
    return fetch("/api/adm/promo-codes/" + data.Id, {
        method: 'PUT',
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify(data),
        credentials: 'include'
    })
        .then(checkStatus)
        .then(parseJSON)
}

function* raiseNotExistBookErrorSaga() {
    yield call(closeEditorSaga)
    yield put({type: SHOW_ERROR_DIALOG, payload: NOT_EXIST_PROMO_ERROR})
}

export const saga = function* () {
    yield all([
        takeEvery(GET_PROMO_CODES_REQUEST, getPromoCodesSaga),
        takeEvery(CREATE_NEW_PROMO_REQUEST, createPromoCodeSaga),
        takeEvery(EDIT_CURRENT_PROMO_REQUEST, editPromoRequestSaga),
        takeEvery(CLOSE_EDITOR_REQUEST, closeEditorWithCheckSaga),
        takeEvery(INSERT_PROMO_REQUEST, insertPromoSaga),
        takeEvery(UPDATE_PROMO_REQUEST, updatePromoSaga),
        takeEvery(DELETE_PROMO_REQUEST, deletePromoSaga),
        takeEvery(RAISE_ERROR_REQUEST, raiseNotExistBookErrorSaga),
    ])
}

const dataToEntries = (values, DataRecord) => {
    return values.reduce(
            (acc, value) => acc.set(value.Id, new DataRecord(value)),
            new OrderedMap({})
        )
}
