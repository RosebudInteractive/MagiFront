import {
    SWITCH_SIZE_TO,
    SWITCH_TO_SMALL_PLAYER,
    SWITCH_TO_FULL_PLAYER,
} from '../constants/app'

export const switchSizeTo = (size) => {
    return {
        type: SWITCH_SIZE_TO,
        payload: size
    }
};

export const switchToSmallPlayer = () => {
    return {
        type: SWITCH_TO_SMALL_PLAYER,
        payload: null
    }
}

export const switchToFullPlayer = () => {
    return {
        type: SWITCH_TO_FULL_PLAYER,
        payload: null
    }
}