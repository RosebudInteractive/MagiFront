import ResourceLoader from 'work-shop/resource-loader';

import {
    PLAYER_PREINIT_AUDIOS,
} from '../constants/player'

const AudioLoaderMiddleware = store => next => action => {

    switch (action.type) {
        case PLAYER_PREINIT_AUDIOS : {
            ResourceLoader.preinitAudio(action.payload)
            return next(action)
        }

        default:
            return next(action)
    }

}

export default AudioLoaderMiddleware