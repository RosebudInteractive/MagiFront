import {appName} from '../config'
import {createSelector} from 'reselect'
import {Record, OrderedMap} from 'immutable'
import 'whatwg-fetch';
import {checkStatus, parseJSON} from "../tools/fetch-tools";
import {all, takeEvery, put, call, select, fork,} from 'redux-saga/effects'
import {analyticsDebugModeSelector} from './app'

/**
 * Constants
 * */
export const moduleName = 'google-analytics'
const prefix = `${appName}/${moduleName}`

const COURSES_PAGE_SHOWED = `${prefix}/COURSES_PAGE_SHOWED`
const LESSON_PAGE_SHOWED = `${prefix}/LECTURE_PAGE_SHOWED`
const LESSON_LINK_CLICKED = `${prefix}/LESSON_LINK_CLICKED`
const CONCRETE_COURSE_PAGE_SHOWED = `${prefix}/CONCRETE_COURSE_PAGE_SHOWED`
const CONCRETE_COURSE_LINK_CLICKED = `${prefix}/CONCRETE_COURSE_LINK_CLICKED`
const PRICE_BUTTON_CLICKED = `${prefix}/PRICE_BUTTON_CLICKED`
const PAYMENT_BUTTON_CLICKED = `${prefix}/PAYMENT_BUTTON_CLICKED`

const SEND_USER_ID = `${prefix}/SEND_USER_ID`
const SEND_USER_SIGN_UP = `${prefix}/SEND_USER_SIGN_UP`

const GET_NON_REGISTER_TRANSACTION_REQUEST = `${prefix}/GET_NON_REGISTER_TRANSACTION_REQUEST`
const GET_NON_REGISTER_TRANSACTION_START = `${prefix}/GET_NON_REGISTER_TRANSACTION_START`
export const GET_NON_REGISTER_TRANSACTION_SUCCESS = `${prefix}/GET_NON_REGISTER_TRANSACTION_SUCCESS`
const GET_NON_REGISTER_TRANSACTION_FAIL = `${prefix}/GET_NON_REGISTER_TRANSACTION_FAIL`

const SET_TRANSACTION_REGISTERED_REQUEST = `${prefix}/SET_TRANSACTION_REGISTERED_REQUEST`
const SET_TRANSACTION_REGISTERED_START = `${prefix}/SET_TRANSACTION_REGISTERED_START`
const SET_TRANSACTION_REGISTERED_SUCCESS = `${prefix}/SET_TRANSACTION_REGISTERED_SUCCESS`
const SET_TRANSACTION_REGISTERED_FAIL = `${prefix}/SET_TRANSACTION_REGISTERED_FAIL`

const SET_PLAYER_PROGRESS_PERCENT = `${prefix}/SET_PLAYER_PROGRESS_PERCENT`
const PLAYER_PLAYED = `${prefix}/PLAYER_PLAYED`
const PAGE_CHANGED = `${prefix}/PAGE_CHANGED`

/**
 * Reducer
 * */
export const ReducerRecord = Record({
    fetching: false,
    entries: new OrderedMap([])
})

const TransactionRecord = new Record({
    id: null,
    currencyCode: "RUB",
    revenue: 0,
    tax: 0,
    coupon: null,
    products: []
})


export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action

    switch (type) {
        case GET_NON_REGISTER_TRANSACTION_START:
            return state
                .set('fetching', true)
                .update('entries', entries => entries.clear())

        case GET_NON_REGISTER_TRANSACTION_SUCCESS:
            return state
                .set('fetching', false)
                .set('entries', dataToEntries(payload, TransactionRecord))

        case GET_NON_REGISTER_TRANSACTION_FAIL:
            return state
                .set('fetching', false)

        default:
            return state
    }
}

/**
 * Selectors
 * */
export const stateSelector = state => state[moduleName]
const transactions = createSelector(stateSelector, state => state.entries)


/**
 * Action Creators
 * */
export const getNonRegisterTransaction = () => {
    return { type: GET_NON_REGISTER_TRANSACTION_REQUEST }
}

export const notifyCoursesShowed = (courses) => {
    return { type: COURSES_PAGE_SHOWED, payload: courses }
}

export const notifyCourseLinkClicked = (course) => {
    return { type: CONCRETE_COURSE_LINK_CLICKED, payload: course }
}

export const notifyConcreteCourseShowed = (course) => {
    return { type: CONCRETE_COURSE_PAGE_SHOWED, payload: course }
}

export const notifyLessonLinkClicked = (data) => {
    return { type: LESSON_LINK_CLICKED, payload: data }
}

export const notifyLessonShowed = (data) => {
    return { type: LESSON_PAGE_SHOWED, payload: data }
}

export const notifyPriceButtonClicked = (data) => {
    return { type: PRICE_BUTTON_CLICKED, payload: data }
}

export const notifyPaymentButtonClicked = (data) => {
    return { type: PAYMENT_BUTTON_CLICKED, payload: data }
}

export const notifyUserIdChanged = (userId) => {
    return { type: SEND_USER_ID, payload: userId }
}

export const notifyNewUserRegistered = () => {
    return { type: SEND_USER_SIGN_UP }
}

export const notifyPageChanged = (data) => {
    return { type: PAGE_CHANGED, payload: data }
}

export const notifyPlayerPlayed = (data) => {
    return { type: PLAYER_PLAYED, payload: data }
}

export const setPlayerProgress = (data) => {
    return { type: SET_PLAYER_PROGRESS_PERCENT, payload: data }
}

/**
 * Sagas
 */
export const saga = function* () {
    yield all([
        takeEvery(GET_NON_REGISTER_TRANSACTION_REQUEST, getNonRegisterTransactionSaga),
        takeEvery(SET_TRANSACTION_REGISTERED_REQUEST, registerTransactionsSaga),
        takeEvery(COURSES_PAGE_SHOWED, addCoursesPageShowedSaga),
        takeEvery(CONCRETE_COURSE_PAGE_SHOWED, addConcreteCoursePageShowedSaga),
        takeEvery(CONCRETE_COURSE_LINK_CLICKED, addConcreteCourseLinkClickedSaga),
        takeEvery(LESSON_PAGE_SHOWED, addLessonPageShowedSaga),
        takeEvery(LESSON_LINK_CLICKED, addLessonClickedSaga),
        takeEvery(PRICE_BUTTON_CLICKED, addPriceButtonClickedSaga),
        takeEvery(PAYMENT_BUTTON_CLICKED, addPaymentButtonClickedSaga),
        takeEvery(SEND_USER_ID, addUserIdSaga),
        takeEvery(SEND_USER_SIGN_UP, newUserRegisteredSaga),
        takeEvery(SET_PLAYER_PROGRESS_PERCENT, setPlayerProgressSaga),
        takeEvery(PLAYER_PLAYED, notifyPlayerPlayedSaga),
        takeEvery(PAGE_CHANGED, notifyPageChangedSaga),
    ])
}

function* getNonRegisterTransactionSaga() {
    yield put({type: GET_NON_REGISTER_TRANSACTION_START})

    try {
        let _data = yield call(_fetchNonRegisterTransactions)

        yield put({type: GET_NON_REGISTER_TRANSACTION_SUCCESS, payload: _data})
        yield put({type: SET_TRANSACTION_REGISTERED_REQUEST})
    } catch (error) {
        yield put({type: GET_NON_REGISTER_TRANSACTION_FAIL})
    }
}

const _fetchNonRegisterTransactions = () => {
    return fetch('/api/users/not-sent-trans', {method: 'GET', credentials: 'include', cache: 'no-cache'})
        .then(checkStatus)
        .then(parseJSON)
}

function* registerTransactionsSaga() {
    const _transactions = yield select(transactions)

    let _result = yield call(_registerTransactions, _transactions)

    yield put({type: SET_TRANSACTION_REGISTERED_START})
    try {
        if (_result.length > 0) {
            yield call(_fetchSetRegisterTransactions, _result)
        }
        yield put({type: SET_TRANSACTION_REGISTERED_SUCCESS})
    } catch (error) {
        yield put({type: SET_TRANSACTION_REGISTERED_FAIL})
    }
}

function* _registerTransactions(data) {
    let _result = [],
        _data = null

    if (data.size > 0) {
        data.forEach((item) => {
            _result.push(item.id)
            _data = {
                'ecommerce': {
                    'currencyCode': 'RUB',
                    'purchase': {
                        'actionField': {
                            'id': item.id,     //'id заказа',
                            'revenue': item.revenue, // '91.4', //полная сумма транзакции
                            'tax': item.tax, // '9.4', //сумма всех налогов транзакции
                            'coupon': item.coupon // 'Coupon 1' //промокод, использовавшийся при оформлении заказа
                        },
                        'products': []
                    }
                },
                'event': 'gtm-ee-event',
                'gtm-ee-event-category': 'Enhanced Ecommerce',
                'gtm-ee-event-action': 'Purchase',
                'gtm-ee-event-non-interaction': 'False',
            }
            _data.ecommerce.purchase.products = item.products.slice()
        })
    }

    yield call(_pushAnalyticsData, _data)

    return _result
}

const _fetchSetRegisterTransactions = (values) => {
    return fetch('/api/users/send-trans', {
        method: 'POST',
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify(values),
        credentials: 'include',
        redirect: 'manual'
    })
        .then(checkStatus)
        .then(parseJSON)
}

function* addCoursesPageShowedSaga(data) {

    if (!data.payload) return

    let _data = {
        ecommerce: {
            currencyCode: 'RUB',
            impressions: []
        },
        'event': 'gtm-ee-event',
        'gtm-ee-event-category': 'Enhanced Ecommerce',
        'gtm-ee-event-action': 'Product Impressions',
        'gtm-ee-event-non-interaction': 'True',
    }

    data.payload.forEach((course, index) => {
        let _author = course.AuthorsObj && course.AuthorsObj[0] ? course.AuthorsObj[0].FirstName + " " + course.AuthorsObj[0].LastName : '',
            _category = course.CategoriesObj && course.CategoriesObj[0] ? course.CategoriesObj[0].Name : '',
            _price = course.IsPaid ? (course.DPrice && course.Discount ? course.DPrice : course.Price) : 0

        _data.ecommerce.impressions.push({
            'name': course.Name,
            'id': course.Id,
            'price': _price,
            'brand': _author,
            'category': _category,
            'position': index + 1
        })
    })

    yield call(_pushAnalyticsData, _data)
}

function* addConcreteCoursePageShowedSaga(data) {

    if (!data.payload) return

    const _course = data.payload

    let _author = _course.Authors && _course.Authors[0] ? _course.Authors[0].FirstName + " " + _course.Authors[0].LastName : '',
        _category = _course.Categories && _course.Categories[0] ? _course.Categories[0].Name : '',
        _price = _course.IsPaid ? (_course.DPrice && _course.Discount ? _course.DPrice : _course.Price) : 0

    let _data = {
        ecommerce: {
            'currencyCode': 'RUB',
            'detail': {
                'actionField': {'list': ''},
                'products': [{
                    'name': _course.Name, // 'Название курса',
                    'id': _course.Id, // 'ID1',
                    'price': _price, // '23.5',
                    'brand': _author, // 'Имя автора',
                    'category': _category // 'Категория курса'
                }]
            },
        },
        'event': 'gtm-ee-event',
        'gtm-ee-event-category': 'Enhanced Ecommerce',
        'gtm-ee-event-action': 'Product Details',
        'gtm-ee-event-non-interaction': 'True',
    }


    yield call(_pushAnalyticsData, _data)
}

function* addLessonPageShowedSaga(data) {
    if (!data.payload) return

    const _course = data.payload

    let _data = {
        'ecommerce': {
            'currencyCode': 'RUB',
            'detail': {
                'actionField': {'list': ''},
                'products': [{
                    'name': _course.Name, // 'Название курса',
                    'id': _course.Id, // 'ID1',
                    'price': _course.price,
                    'brand': _course.author,
                    'category': _course.category, //'Категория курса',
                    'variant': _course.lessonName,
                }]
            },
        },
        'event': 'gtm-ee-event',
        'gtm-ee-event-category': 'Enhanced Ecommerce',
        'gtm-ee-event-action': 'Product Details',
        'gtm-ee-event-non-interaction': 'True',
    }

    yield call(_pushAnalyticsData, _data)
}

function* addPriceButtonClickedSaga(data) {
    if (!data.payload) return

    const _course = data.payload

    const _data = {
        'ecommerce': {
            'currencyCode': 'RUB',
            'checkout': {
                'actionField': {'step': 1},
                'products': [{
                    'name': _course.name, // 'Название курса',
                    'id': _course.id, // 'ID1',
                    'price': _course.price, // '23.5',
                    'brand': _course.author, // 'Имя автора',
                    'category': _course.category, // 'Категория курса',
                    'quantity': 1
                }]
            },
        },
        'event': 'gtm-ee-event',
        'gtm-ee-event-category': 'Enhanced Ecommerce',
        'gtm-ee-event-action': 'Checkout Step 1',
        'gtm-ee-event-non-interaction': 'False',
    }

    yield call(_pushAnalyticsData, _data)
}

function* addPaymentButtonClickedSaga(data) {
    if (!data.payload) return

    const _course = data.payload

    const _data = {
        'ecommerce': {
            'currencyCode': 'RUB',
            'checkout': {
                'actionField': {'step': 2},
                'products': [{
                    'name': 'Название курса',
                    'id': _course.id, // 'ID1',
                    'price': _course.price, //'23.5',
                    'brand': _course.author, //'Имя автора',
                    'category': _course.category, //'Категория курса',
                    'quantity': 1
                }]

            },
        },
        'event': 'gtm-ee-event',
        'gtm-ee-event-category': 'Enhanced Ecommerce',
        'gtm-ee-event-action': 'Checkout Step 2',
        'gtm-ee-event-non-interaction': 'False',
    }

    yield call(_pushAnalyticsData, _data)
}

function* addConcreteCourseLinkClickedSaga(data) {
    if (!data.payload) return

    const _course = data.payload

    const _data = {
        'ecommerce': {
            'currencyCode': 'RUB',
            'click': {
                'actionField': {'list': ''},
                'products': [{
                    'name': _course.Name, //'Название курса',
                    'id': _course.Id, //'ID1',
                    'price': _course.price, //'23.5',
                    'brand': _course.author, //'Имя автора',
                    'category': _course.category, //'Категория курса',
                    'position': 1
                }]
            },
        },
        'event': 'gtm-ee-event',
        'gtm-ee-event-category': 'Enhanced Ecommerce',
        'gtm-ee-event-action': 'Product Clicks',
        'gtm-ee-event-non-interaction': 'False',
    }

    yield call(_pushAnalyticsData, _data)
}

function* addLessonClickedSaga(data) {
    if (!data.payload) return

    const _analyticsData = data.payload

    let _data = {
        'ecommerce': {
            'currencyCode': 'RUB',
            'click': {
                'actionField': {'list': ''},
                'products': [{
                    'name': _analyticsData.Name, // 'Название курса',
                    'id': _analyticsData.Id, // 'ID1',
                    'price': _analyticsData.price, // '23.5',
                    'brand': _analyticsData.author, // 'Имя автора',
                    'category': _analyticsData.category, // 'Категория курса',
                    'variant': _analyticsData.lessonName, // 'Название лекции',
                    'position': 1
                }]
            }
        },
        'event': 'gtm-ee-event',
        'gtm-ee-event-category': 'Enhanced Ecommerce',
        'gtm-ee-event-action': 'Product Clicks',
        'gtm-ee-event-non-interaction': 'False',
    }

    yield call(_pushAnalyticsData, _data)

}

function* addUserIdSaga(data) {
    if (!data.payload) return

    yield call(_pushAnalyticsData, { 'UID': data.payload })
}

function* newUserRegisteredSaga() {
    yield call(_pushAnalyticsData, { 'event': 'reg' })
}

function* setPlayerProgressSaga(data) {
    if (!data.payload) return

    yield call(_pushAnalyticsData, data.payload)
}

function* notifyPlayerPlayedSaga(data) {
    if (!data.payload) return

    yield call(_pushAnalyticsData, data.payload)
}

function* notifyPageChangedSaga(data) {
    if (!data.payload) return

    yield call(_pushAnalyticsData, data.payload)
}

function* _pushAnalyticsData(data) {
    const _isDebugMode = yield select(analyticsDebugModeSelector),
        _state = yield select(state => state)

    if (window.dataLayer && data) {
        if (_state.user.user && _state.user.user.Id) {
            data.UID = _state.user.user.Id
            data.email = _state.user.user.Email
        }

        window.dataLayer.push(data)

        if (_isDebugMode) {
            console.log(data)
        }
    }
}

const dataToEntries = (values, DataRecord) => {
    return Object.values(values)
        .reduce(
            (acc, value) => acc.set(value.id, new DataRecord(value)),
            new OrderedMap({})
        )
}




