import {
    WORK_SHOP_SHOW,
    WORK_SHOP_HIDE,
} from '../constants/work-shop';

const initialState = {
    visible: false,
    callingRoute: '',
};

export default function workShop(state = initialState, action) {

    switch (action.type) {
        case WORK_SHOP_SHOW: {
            if (!state.visible) {
                return {...state, visible: true, callingRoute: action.payload};
            } else {
                return state
            }
        }

        case WORK_SHOP_HIDE: {
            if (state.visible) {
                return {...state, visible: false, callingRoute: ''};
            } else {
                return state
            }
        }

        default:
            return state;
    }

}