import {SIGN_IN_SUCCESS, WHO_AM_I_SUCCESS, LOGOUT_SUCCESS} from "../constants/user";
import {GET_APP_OPTIONS_SUCCESS} from "../constants/app";
import {disableBilling, enableBilling} from "../actions/app-actions";

const AppOptionsMiddleware = store => next => action => {

    switch (action.type) {

        case SIGN_IN_SUCCESS:
        case WHO_AM_I_SUCCESS:
        case GET_APP_OPTIONS_SUCCESS:
        case LOGOUT_SUCCESS: {
            let result = next(action)

            let _state = store.getState(),
                _billingEnabled = calcBillingEnabled(_state);

            if (_state.app.enabledBilling !== _billingEnabled) {
                if (_billingEnabled) {
                    store.dispatch(enableBilling());
                } else {
                    store.dispatch(disableBilling())
                }
            }

            return result
        }

        default:
            return next(action)
    }
}


const calcBillingEnabled = (state) => {
    let _user = state.user.user,
        _app = state.app;

    if (_app.billingTest) {
        return !!_user && ((_user.PData && _user.PData.isAdmin) || (_user.PData && _user.PData.roles && _user.PData.roles.billing_test))
    } else {
        return true
    }
}

export default AppOptionsMiddleware;