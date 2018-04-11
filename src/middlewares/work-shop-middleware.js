import WorkShop from '../tools/adm-work-shop'

import {
    WORK_SHOP_GET_DATA_SUCCESS,
} from '../constants/work-shop'


const loaderMiddleware = store => next => action => {

    switch (action.type) {
        case WORK_SHOP_GET_DATA_SUCCESS: {

            WorkShop.loadData(action.payload)

            return next(action)
        }

        default:
            return next(action)
    }
}

export default loaderMiddleware;