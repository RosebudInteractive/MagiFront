import {
    SHOW_SIGN_IN_FORM,
    CLOSE_SIGN_IN_FORM,
} from '../constants/user'


export const showSignInForm = () => {
    return {
        type: SHOW_SIGN_IN_FORM,
        payload: null
    }
};

export const closeSignInForm = () => {
    return {
        type: CLOSE_SIGN_IN_FORM,
        payload: null
    }
};