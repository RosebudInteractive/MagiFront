import {SIGN_IN_SUCCESS, WHO_AM_I_SUCCESS, LOGOUT_SUCCESS} from "../constants/user";
import {calcBillingEnable, } from "ducks/app";
import {store} from './configureStore';

const AppOptionsMiddleware = store => next => action => {

    switch (action.type) {

        case SIGN_IN_SUCCESS:
        case WHO_AM_I_SUCCESS:
        case LOGOUT_SUCCESS: {
            let result = next(action)

            dispatchCalcBillingEnabled()

            return result
        }

        default:
            return next(action)
    }
}


const dispatchCalcBillingEnabled = () => {
    store.dispatch(calcBillingEnable())
}

export default AppOptionsMiddleware;