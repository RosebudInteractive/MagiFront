import {SIGN_IN_SUCCESS, WHO_AM_I_SUCCESS, LOGOUT_SUCCESS} from "../constants/user";
import {calcBillingEnable, reloadCurrentPage} from "ducks/app";
import {getUserProfile,} from "ducks/profile";
import {store} from './configureStore';
import {notifyUserHasBeenLoaded} from 'actions/user-actions'

const AppOptionsMiddleware = store => next => action => {

    switch (action.type) {

        case WHO_AM_I_SUCCESS: {
            const _authorizedOld = !!store.getState().user.user,
                _userLoadingOld = !!store.getState().user.loading


            let result = next(action)

            const _authorizedNew = !!store.getState().user.user,
                _userLoadingNew = !!store.getState().user.loading

            dispatchCalcBillingEnabled()
            if (!_authorizedOld && _authorizedNew) {
                dispatchLoadUserProfile()
            }

            if (_userLoadingOld && !_userLoadingNew) {
                dispatchNotifyUserHasBeenLoaded()
            }

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

const dispatchNotifyUserHasBeenLoaded = () => {
    store.dispatch(notifyUserHasBeenLoaded())
}

export default AppOptionsMiddleware;