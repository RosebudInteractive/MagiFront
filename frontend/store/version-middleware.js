import {APP_CHANGE_PAGE} from "../constants/app";
import {checkVersion, CHECK_SUCCESS} from 'ducks/version'
import {store as mainStore} from './configureStore';
import {PLAYER_PLAYED} from "../constants/player";

const VersionMiddleware = store => next => action => {

    switch (action.type) {

        case APP_CHANGE_PAGE:
        case PLAYER_PLAYED: {
            mainStore.dispatch(checkVersion())

            return next(action)
        }

        case CHECK_SUCCESS: {
            let _oldVersion = store.getState().version.get('main')

            let result = next(action),
                _newVersion = store.getState().version.get('main')

            // console.log(`fire: version ${_oldVersion} / ${_newVersion}`)
            if (_newVersion !== _oldVersion) {
                window.location.reload()
            }

            return result
        }

        default:
            return next(action)
    }
}

export default VersionMiddleware;