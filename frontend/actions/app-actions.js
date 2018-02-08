import {
    SWITCH_SIZE_TO
} from '../constants/app'

export const switchSizeTo = (size) => {
    return {
        type: SWITCH_SIZE_TO,
        payload: size
    }
};