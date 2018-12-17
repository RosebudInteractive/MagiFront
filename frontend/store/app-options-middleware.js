import {SIGN_IN_SUCCESS, WHO_AM_I_SUCCESS} from "../constants/user";
import {GET_APP_OPTIONS_SUCCESS} from "../constants/app";
import {disableBilling, enableBilling} from "../actions/app-actions";

const AppOptionsMiddleware = store => next => action => {

    switch (action.type) {

        case SIGN_IN_SUCCESS:
        case WHO_AM_I_SUCCESS:
        case GET_APP_OPTIONS_SUCCESS: {
            let _state = store.getState(),
                _billingEnabled = calcBillingEnabled(_state);

            if (_state.app.enabledBilling !== _billingEnabled) {
                if (_billingEnabled) {
                    store.dispatch(enableBilling());
                } else {
                    store.dispatch(disableBilling())
                }
            }

            return next(action)
        }

        default:
            return next(action)
    }
}


const calcBillingEnabled = (state) => {
    let _user = state.user,
        _app = state.app;

    if (_app.billingTest) {
        return !!_user && (_user.isAdmin || (_user.role && _user.role.billing_test))
    } else {
        return true
    }
}

export default AppOptionsMiddleware;