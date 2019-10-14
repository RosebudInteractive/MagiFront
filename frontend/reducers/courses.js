import {
    GET_COURSES_REQUEST,
    GET_COURSES_SUCCESS,
    GET_COURSES_FAIL,
} from '../constants/courses'

import {SIGN_IN_START, LOGOUT_START, SIGN_UP_START} from "../constants/user";
import {REFUND_PAYMENT_REQUEST} from "ducks/billing";

const initialState = {
    items: [],
    fetching: false,
    loaded: false,
    lastSuccessTime: null,
};

export default function courses(state = initialState, action) {

    switch (action.type) {
        case GET_COURSES_REQUEST:
            return {...state, items: [], fetching: true, loaded: false, lastSuccessTime: null};

        case GET_COURSES_SUCCESS: {
            return {...state, items: action.payload.Courses, fetching: false, loaded: true, lastSuccessTime: action.payload.time};
        }

        case SIGN_IN_START:
        case LOGOUT_START:
        case SIGN_UP_START:
        case REFUND_PAYMENT_REQUEST:
            return {...state, lastSuccessTime: null};

        case GET_COURSES_FAIL:
            return initialState;

        default:
            return state;
    }
}