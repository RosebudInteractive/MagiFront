import ResourceLoader from 'work-shop/resource-loader';

import {
    PLAYER_CLEAR_AUDIOS,
    PLAYER_PREINIT_AUDIOS,
} from '../constants/player'

/* eslint-disable */
const AudioLoaderMiddleware = store => next => action => {
/* eslint-enable */

    switch (action.type) {
        case PLAYER_PREINIT_AUDIOS : {
            ResourceLoader.preinitAudio(action.payload)
            return next(action)
        }

        case PLAYER_CLEAR_AUDIOS : {
            ResourceLoader.clearAudios()
            return next(action)
        }

        default:
            return next(action)
    }
}

export default AudioLoaderMiddleware