import {SIGN_IN_SUCCESS, WHO_AM_I_SUCCESS, LOGOUT_SUCCESS} from "../constants/user";
import {calcBillingEnable, reloadCurrentPage} from "ducks/app";
import {getUserProfile,} from "ducks/profile";
import {store} from './configureStore';

const AppOptionsMiddleware = store => next => action => {

    switch (action.type) {

        case WHO_AM_I_SUCCESS: {
            let result = next(action)

            dispatchCalcBillingEnabled()

            return result
        }

        case SIGN_IN_SUCCESS: {
            dispatchReloadPage()

            const _result = next(action)

            dispatchLoadUserProfile()

            return _result
        }

        case LOGOUT_SUCCESS: {
            dispatchReloadPage()

            return next(action)
        }

        default:
            return next(action)
    }
}


const dispatchCalcBillingEnabled = () => {
    store.dispatch(calcBillingEnable())
}

const dispatchLoadUserProfile = () => {
    store.dispatch(getUserProfile())
}

const dispatchReloadPage = () => {
    store.dispatch(reloadCurrentPage())
}

export default AppOptionsMiddleware;