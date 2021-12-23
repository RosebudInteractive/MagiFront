import {appName} from '../config'
import {createSelector} from 'reselect'
import {OrderedMap, Record,} from 'immutable'
import {replace} from 'react-router-redux'
import 'whatwg-fetch';
import {checkStatus, handleJsonError, parseJSON} from "../tools/fetch-tools";
import {reset, isDirty} from 'redux-form'
import {HIDE_DELETE_DLG, SHOW_ERROR_DIALOG} from "../constants/Common";
import {all, takeEvery, select, put, call} from 'redux-saga/effects'
import {convertLinksToString} from "../tools/link-tools";
import {confirmCloseEditorSaga} from "adm-ducks/messages";

/**
 * Constants
 * */
export const moduleName = 'books'
const prefix = `${appName}/${moduleName}`

export const GET_BOOKS_REQUEST = `${prefix}/GET_BOOKS_REQUEST`
export const GET_BOOKS_START = `${prefix}/GET_BOOKS_START`
export const GET_BOOKS_SUCCESS = `${prefix}/GET_BOOKS_SUCCESS`
export const GET_BOOKS_FAIL = `${prefix}/GET_BOOKS_FAIL`

export const CREATE_NEW_BOOK = `${prefix}/CREATE_NEW_BOOK`
export const EDIT_CURRENT_BOOK = `${prefix}/EDIT_CURRENT_BOOK`
export const EDIT_CURRENT_BOOK_REQUEST = `${prefix}/EDIT_CURRENT_BOOK_REQUEST`
export const SHOW_EDITOR = `${prefix}/SHOW_EDITOR`
export const CLOSE_EDITOR_REQUEST = `${prefix}/CLOSE_EDITOR_REQUEST`
export const CLOSE_EDITOR = `${prefix}/CLOSE_EDITOR`

export const INSERT_BOOK = `${prefix}/INSERT_BOOK`
export const UPDATE_BOOK = `${prefix}/UPDATE_BOOK`
export const DELETE_BOOK = `${prefix}/DELETE_BOOK`
export const UPSERT_BOOK_START = `${prefix}/UPSERT_BOOK_START`
export const UPSERT_BOOK_SUCCESS = `${prefix}/UPSERT_BOOK_SUCCESS`
export const SAVE_CHANGES = `${prefix}/SAVE_CHANGES`

export const MOVE_UP = `${prefix}/MOVE_UP`
export const MOVE_DOWN = `${prefix}/MOVE_DOWN`
export const CHANGE_ORDER = `${prefix}/CHANGE_ORDER`

export const RAISE_ERROR_REQUEST = `${prefix}/RAISE_ERROR_REQUEST`
// export const RAISE_ERROR = `${prefix}/RAISE_ERROR`

const NOT_EXIST_BOOK_ERROR = "Запрошенной книги не существует"

/**
 * Reducer
 * */
export const ReducerRecord = Record({
    loading: false,
    loaded: false,
    showEditor: false,
    editMode: true,
    selected: null,
    hasChanges: false,
    entries: new OrderedMap([])
})

export const BookRecord = Record({
    Id: null,
    Name: null,
    Description: null,
    CourseId: null,
    OtherAuthors: null,
    OtherCAuthors: null,
    Cover: null,
    CoverMeta: null,
    Order: null,
    ExtLinks: null,
    Authors: null,
})

export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action

    switch (type) {
        case GET_BOOKS_START: {
            return state
                .set('loaded', false)
                .set('loading', true)
        }

        case GET_BOOKS_SUCCESS:
            return state
                .set('loading', false)
                .set('loaded', true)
                .set('entries', dataToEntries(payload, BookRecord))

        case GET_BOOKS_FAIL: {
            return state
                .set('loaded', false)
                .set('loading', false)
        }

        case SHOW_EDITOR:
            return state.set('showEditor', true)

        case CLOSE_EDITOR:
            return state.set('showEditor', false)

        case UPSERT_BOOK_START:
            return state
                .setIn(['entries', payload.Id], payload)

        case CREATE_NEW_BOOK:
            return state.set('editMode', false)

        case EDIT_CURRENT_BOOK:
            return state
                .set('selected', payload)
                .set('editMode', true)

        case DELETE_BOOK:
            return state
                .update('entries', entries => entries.delete(payload))

        case CHANGE_ORDER:
            return state
                .setIn(['entries', payload.id1, 'Order'], payload.order1)
                .setIn(['entries', payload.id2, 'Order'], payload.order2)
                .update('entries', entries => entries.sort((a, b) => {
                        return a.get('Order') - b.get('Order')
                    })
                )
                .set('hasChanges', true)

        default:
            return state
    }
}


/**
 * Selectors
 * */
export const stateSelector = state => state[moduleName]
export const entriesSelector = createSelector(stateSelector, state => state.entries)
export const booksSelector = createSelector(entriesSelector, (entries) => {
    let _array = entries.toArray();

    return _array.map((item) => {
        let _item = item.toObject()

        _item.id = _item.Id

        if (_item.Authors) {
            _item.Authors.forEach((author) => {
                author.id = author.Id
            })
        }

        _item.extLinksValues = convertLinksToString(_item.ExtLinks)

        return _item
    })
})
export const loadingSelector = createSelector(stateSelector, state => state.loading)
export const loadedSelector = createSelector(stateSelector, state => state.loaded)
export const showEditorSelector = createSelector(stateSelector, state => state.showEditor)
export const editModeSelector = createSelector(stateSelector, state => state.editMode)
export const bookIdSelector = createSelector(stateSelector, state => state.selected)


/**
 * Action Creators
 * */
export const getBooks = () => {
    return {
        type: GET_BOOKS_REQUEST,
        payload: null
    }
}

const fetchBooks = () => {
    return fetch("/api/adm/books", {method: 'GET', credentials: 'include'})
        .then(checkStatus)
        .then(parseJSON)
}

const saveBooks = (books) => {
    return fetch("/api/adm/books", {
        method: 'PUT',
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify(books),
        credentials: 'include'
    })
        .then(checkStatus)
        .then(parseJSON)
}

export const createBook = () => {
    return {type: CREATE_NEW_BOOK}
}

export const editCurrentBook = (id) => {
    return {type: EDIT_CURRENT_BOOK_REQUEST, payload: id}
}

export const closeEditor = () => {
    return {type: CLOSE_EDITOR_REQUEST}
}

export const insertBook = (data) => {
    return {type: INSERT_BOOK, payload: data}
}

export const updateBook = (data) => {
    return {type: UPDATE_BOOK, payload: data}
}

export const deleteBook = (data) => {
    return {type: DELETE_BOOK, payload: data}
}

export const moveUp = (id) => {
    return {type: MOVE_UP, payload: id}
}

export const moveDown = (id) => {
    return {type: MOVE_DOWN, payload: id}
}

export const saveChanges = () => {
    return {type: SAVE_CHANGES}
}

export const raiseNotExistBookError = () => {
    return {type: RAISE_ERROR_REQUEST}
}


/**
 * Sagas
 */
export function* getBooksSaga() {
    yield put({type: GET_BOOKS_START})
    try {
        let _books = yield call(fetchBooks)

        yield put({
            type: GET_BOOKS_SUCCESS,
            payload: _books
        })
    } catch (error) {
        yield put({
            type: GET_BOOKS_FAIL,
            payload: {error}
        })

        let _message
        if (error.response) {
            _message = yield call(handleJsonError, error)
        } else {
            _message = error.message ? error.message : "unknown error"
        }

        yield put({type: SHOW_ERROR_DIALOG, payload: _message})
    }
}

export function* createBookSaga() {
    yield put(replace('/adm/books/new'))

    yield put({type: SHOW_EDITOR})
}

function* editBookRequestSaga(action) {
    const _editorOpened = yield select(showEditorSelector)

    if (_editorOpened) {
        const _hasChanges = yield select(isDirty('BookEditor'))

        if (_hasChanges) {
            const _confirmed = yield call(confirmCloseEditorSaga);

            if (_confirmed) {
                yield call(editBookSaga, action.payload)
            }
        } else {
            yield call(editBookSaga, action.payload)
        }
    } else {
        yield call(editBookSaga, action.payload)
    }
}

function* editBookSaga(id) {

    yield put(replace('/adm/books/edit/' + id))

    yield put({type: EDIT_CURRENT_BOOK, payload: id})
    yield put({type: SHOW_EDITOR})
}


function* closeEditorWithCheckSaga() {
    const _hasChanges = yield select(isDirty('BookEditor'))

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
    yield put(replace('/adm/books'))
    yield put({type: CLOSE_EDITOR})
}

export function* upsertBookSaga(action) {
    let _data = {...action.payload}

    const state = yield select(stateSelector)
    let _payload = {
        Id: _data.Id ? _data.Id : -1,
        Name: _data.name,
        Description: _data.description,
        CourseId: (_data.course && +_data.course) ? +_data.course : null,
        OtherAuthors: _data.otherAuthors,
        OtherCAuthors: _data.otherCommentAuthors,
        Cover: _data.cover.file,
        CoverMeta: _data.cover.meta,
        Order: _data.Order ? _data.Order : state.entries.size + 1,
        ExtLinks: _data.extLinksValues,
        Authors: _data.authors.slice(),
    }

    let _record = new BookRecord(_payload)


    yield put({
        type: UPSERT_BOOK_START,
        payload: _record
    })

    const _books = yield select(booksSelector)
    try {
        yield call(saveBooks, _books)

        yield put({type: UPSERT_BOOK_SUCCESS})
        yield put(reset('BookEditor'))
        yield put({type: GET_BOOKS_REQUEST})
        yield put({type: CLOSE_EDITOR_REQUEST})

    } catch (error) {
        yield put({
            type: SHOW_ERROR_DIALOG,
            payload: {error}
        })
    }
}

export function* deleteBookSaga() {
    yield put({type: HIDE_DELETE_DLG})
    const _books = yield select(booksSelector)
    try {
        yield call(saveBooks, _books)
    } catch (error) {
        yield put({
            type: SHOW_ERROR_DIALOG,
            payload: {error}
        })
    }
}

export function* moveUpSaga(action) {
    const _books = yield select(booksSelector)

    let _index = _books.findIndex((item) => {
            return item.Id === action.payload
        }),
        _currentBook = _books[_index]

    if (_index > 0) {
        let _prev = _books[_index - 1],
            _newOrderOfCurrentBook = _prev.Order,
            _newOrderOfPrevBook = _currentBook.Order

        yield put({
            type: CHANGE_ORDER,
            payload: {id1: _currentBook.Id, order1: _newOrderOfCurrentBook, id2: _prev.Id, order2: _newOrderOfPrevBook}
        })
    }
}

export function* moveDownSaga(action) {
    const _books = yield select(booksSelector)

    let _index = _books.findIndex((item) => {
            return item.Id === action.payload
        }),
        _currentBook = _books[_index]

    if (_index < _books.length - 1) {
        let _next = _books[_index + 1],
            _newOrderOfCurrentBook = _next.Order,
            _newOrderOfPrevBook = _currentBook.Order

        yield put({
            type: CHANGE_ORDER,
            payload: {id1: _currentBook.Id, order1: _newOrderOfCurrentBook, id2: _next.Id, order2: _newOrderOfPrevBook}
        })
    }
}

export function* saveChangesSaga() {

    const state = yield select(stateSelector)

    if (state.get('hasChanges')) {
        const _books = yield select(booksSelector)
        try {
            yield call(saveBooks, _books)
            yield put({type: UPSERT_BOOK_SUCCESS})
        } catch (error) {
            yield put({
                type: SHOW_ERROR_DIALOG,
                payload: {error}
            })
        }
    }
}

function* raiseNotExistBookErrorSaga() {
    yield call(closeEditorSaga)
    yield put({type: SHOW_ERROR_DIALOG, payload: NOT_EXIST_BOOK_ERROR})
}

export const saga = function* () {
    yield all([
        takeEvery(GET_BOOKS_REQUEST, getBooksSaga),
        takeEvery(CREATE_NEW_BOOK, createBookSaga),
        takeEvery(EDIT_CURRENT_BOOK_REQUEST, editBookRequestSaga),
        takeEvery(CLOSE_EDITOR_REQUEST, closeEditorWithCheckSaga),
        takeEvery(INSERT_BOOK, upsertBookSaga),
        takeEvery(UPDATE_BOOK, upsertBookSaga),
        takeEvery(DELETE_BOOK, deleteBookSaga),
        takeEvery(MOVE_UP, moveUpSaga),
        takeEvery(MOVE_DOWN, moveDownSaga),
        takeEvery(SAVE_CHANGES, saveChangesSaga),
        takeEvery(RAISE_ERROR_REQUEST, raiseNotExistBookErrorSaga),
    ])
}


const dataToEntries = (values, DataRecord) => {
    return Object.values(values)
        .reduce(
            (acc, value) => acc.set(value.Id, new DataRecord(value)),
            new OrderedMap({})
        )
}


