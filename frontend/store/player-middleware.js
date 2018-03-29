import * as Player from '../components/player/nested-player';
import {
    PLAYER_START_PLAY,
    PLAYER_START_PAUSE,
    PLAYER_START_STOP, PLAYER_START_SET_CURRENT_TIME,
} from '../constants/player'

const playerMiddleware = store => next => action => {
    switch (action.type) {
        case PLAYER_START_PLAY: {
            console.log(store)
            if (Player.getInstance()) {
                Player.getInstance().play()
            }
            return next(action)
        }

        case PLAYER_START_PAUSE: {
            if (Player.getInstance()) {
                Player.getInstance().pause()
            }
            return next(action)
        }

        case PLAYER_START_STOP: {
            if (Player.getInstance()) {
                Player.getInstance().stop()
            }
            return next(action)
        }

        case PLAYER_START_SET_CURRENT_TIME: {
            if (Player.getInstance()) {
                Player.getInstance().setPosition(action.payload)
            }
            return next(action)
        }

        default:
            return next(action)
    }
}

export default playerMiddleware;