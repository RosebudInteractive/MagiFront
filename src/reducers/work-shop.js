import {
    WORK_SHOP_SHOW,
    WORK_SHOP_HIDE,
} from '../constants/work-shop';

const initialState = {
    visible: false,
};

export default function workShop(state = initialState, action) {

    switch (action.type) {
        case WORK_SHOP_SHOW: {
            if (!state.visible) {
                return {...state, visible: true};
            } else {
                return state
            }
        }

        case WORK_SHOP_HIDE: {
            if (state.visible) {
                return {...state, visible: false};
            } else {
                return state
            }
        }

        default:
            return state;
    }

}