import {appName} from '../config'
import {createSelector} from 'reselect'
import {Record, OrderedMap} from 'immutable'
import 'whatwg-fetch';
import {checkStatus, parseJSON} from "../tools/fetch-tools";
import {all, takeEvery, put, call, select, fork} from 'redux-saga/effects'
import {analyticsDebugModeSelector} from './app'
import {getDomain} from "tools/page-tools";
import $ from "jquery";

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
const GET_NON_REGISTER_TRANSACTION_SUCCESS = `${prefix}/GET_NON_REGISTER_TRANSACTION_SUCCESS`
const GET_NON_REGISTER_TRANSACTION_FAIL = `${prefix}/GET_NON_REGISTER_TRANSACTION_FAIL`

const SEND_REGISTER_TRANSACTION_REQUEST = `${prefix}/SEND_REGISTER_TRANSACTION_REQUEST`
const SEND_REGISTER_TRANSACTION_START = `${prefix}/SEND_REGISTER_TRANSACTION_START`
const SEND_REGISTER_TRANSACTION_SUCCESS = `${prefix}/SEND_REGISTER_TRANSACTION_SUCCESS`
const SEND_REGISTER_TRANSACTION_FAIL = `${prefix}/SEND_REGISTER_TRANSACTION_FAIL`

const REGISTER_GTM_TRANSACTION_REQUEST = `${prefix}/REGISTER_GTM_TRANSACTION_REQUEST`

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
    products: [],
    call_payment: [],
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

export const sendRegisterTransactionSrc = (data) => {
    return { type: SEND_REGISTER_TRANSACTION_REQUEST, payload: data }
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
        takeEvery(SEND_REGISTER_TRANSACTION_REQUEST, sendRegisterTransactionSrcSaga),
        takeEvery(REGISTER_GTM_TRANSACTION_REQUEST, registerGtmTransactionsSaga),
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
        yield put({type: REGISTER_GTM_TRANSACTION_REQUEST})
    } catch (error) {
        yield put({type: GET_NON_REGISTER_TRANSACTION_FAIL})
    }
}

const _fetchNonRegisterTransactions = () => {
    return fetch('/api/users/not-sent-trans-src', {method: 'GET', credentials: 'include', cache: 'no-cache'})
        .then(checkStatus)
        .then(parseJSON)
}

function* sendRegisterTransactionSrcSaga(data) {
    let _isDebugMode = true

    try {
        _isDebugMode = yield select(analyticsDebugModeSelector)

        if (_isDebugMode) {console.log(`callback_payment :: EXEC with params ${JSON.stringify(data.payload)}`)}

        yield put({type: SEND_REGISTER_TRANSACTION_START})

        yield call(_fetchSendTransactionsSrc, data.payload)

        if (_isDebugMode) {console.log(`callback_payment :: SUCCESS with params ${JSON.stringify(data.payload)}`)}

        yield put({type: SEND_REGISTER_TRANSACTION_SUCCESS})
    } catch (error) {

        if (_isDebugMode) {console.error(`callback_payment :: ERROR with params ${JSON.stringify(data.payload)}\n${error}`)}

        yield put({type: SEND_REGISTER_TRANSACTION_FAIL})
    }
}

const _fetchSendTransactionsSrc = (data) => {
    const _url = `/api/users/send-tran-src?src=${data.systemName}&id=${data.id}`

    return fetch(_url, {method: 'GET', credentials: 'include', cache: 'no-cache'})
        .then(checkStatus)
        .then(parseJSON)
}

function* registerGtmTransactionsSaga() {
    const _transactions = yield select(transactions)

    yield _registerTransactions(_transactions)
}

function* _registerTransactions(data) {
    if (data.size > 0) {
        let _array = data.map((item) => {
            let _data = {
                'ecommerce': {
                    'currencyCode': 'RUB',
                    'purchase': {
                        'actionField': {
                            'id': item.id,     //'id заказа',
                            'revenue': item.revenue, // '91.4', //полная сумма транзакции
                            'tax': item.tax, // '9.4', //сумма всех налогов транзакции
                            'coupon': item.coupon // 'Coupon 1' //промокод, использовавшийся при оформлении заказа
                        },
                        'products': [],
                        'call_payment': []
                    }
                },
                'event': 'gtm-ee-event',
                'gtm-ee-event-category': 'Enhanced Ecommerce',
                'gtm-ee-event-action': 'Purchase',
                'gtm-ee-event-non-interaction': 'False',
            }
            _data.ecommerce.purchase.products = item.products.slice()

            let _array = item.call_payment.slice()

            _data.ecommerce.purchase.call_payment = _array
            _data.ecommerce.purchase.call_payment_string = _array.join("+")

            return _data
        }).toArray()

        yield all(_array.map((item) => {
            return fork(_pushAnalyticsData, item)
        }))
    }
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
        _price = _course.IsPaid ? (_course.DPrice && _course.Discount ? _course.DPrice : _course.Price) : 0,
        _image = _course.PageMeta && _course.PageMeta.Images && _course.PageMeta.Images.og ?
            getDomain() + `/data/${_course.PageMeta.Images.og.FileName}`
            :
            getDomain() + `/data/${_course.Cover}`

    let _data = {
        ecommerce: {
            'currencyCode': 'RUB',
            'detail': {
                'actionField': {'list': ''},
                'products': [{
                    'url_course': getDomain()  + `/category/${_course.URL}`,
                    'name': _course.Name, // 'Название курса',
                    'id': _course.Id, // 'ID1',
                    'price': _price, // '23.5',
                    'buy_course': _course.IsBought || _course.IsGift,
                    'brand': _author, // 'Имя автора',
                    'category': _category, // 'Категория курса'
                    'img_course': _image,
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
                    'url_course': getDomain()  + `/category/${_course.URL}`,
                    'name': _course.Name, // 'Название курса',
                    'id': _course.Id, // 'ID1',
                    'price': _course.price,
                    'buy_course': _course.IsBought || _course.IsGift,
                    'brand': _course.author,
                    'category': _course.category, //'Категория курса',
                    'variant': _course.lessonName,
                    'img_course': _course.image ? getDomain() + `/data/${_course.image}` : "",
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
            data.name = _state.user.user.DisplayName === _state.user.user.Email ? "" : _state.user.user.DisplayName
            data.carrotquest_hash = _state.user.user.CqHash
        }

        window.dataLayer.push(data)

        if (data['gtm-ee-event-action'] === "Purchase") {

            const _params = {
                UID: data.UID,
                purchaseId: data.ecommerce.purchase.actionField.id,
                revenue: data.ecommerce.purchase.actionField.revenue,
                productId: data.ecommerce.purchase.products.join("+"),
                call_payment: data.ecommerce.purchase.call_payment.join("+"),
            }

            yield call(_fetchPurchaseTrace, _params)
        }


        if (_isDebugMode) {
            console.log(data)
        }
    }
}

const _fetchPurchaseTrace = (params) => {
    const _str = decodeURIComponent($.param(params)),
        _url = '/api' + (_str ? '?' + _str : '');

    return fetch(_url, {method: 'GET', credentials: 'include', cache: 'no-cache'})
        .then(checkStatus)
}


const dataToEntries = (values, DataRecord) => {
    return Object.values(values)
        .reduce(
            (acc, value) => acc.set(value.id, new DataRecord(value)),
            new OrderedMap({})
        )
}




