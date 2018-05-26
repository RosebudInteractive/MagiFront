import WorkShop from '../tools/adm-work-shop'
import * as Adapter from '../tools/work-shop-adapter'
import * as episodeContentActions from '../actions/episode/episode-contents-actions'

import {
    WORK_SHOP_GET_DATA_SUCCESS, WORK_SHOP_HIDE, WORK_SHOP_SAVE_DATA,
} from '../constants/work-shop'

const loaderMiddleware = store => next => action => {

    switch (action.type) {
        case WORK_SHOP_GET_DATA_SUCCESS: {

            WorkShop.loadData(action.payload)

            return next(action)
        }

        case WORK_SHOP_SAVE_DATA : {
            let _data = Adapter.convertAssetsToContent(action.payload);
            store.dispatch(episodeContentActions.applyFromWorkShop(_data));
            // WorkShop.close()
            return next(action)
        }

        case WORK_SHOP_HIDE : {
            // WorkShop.close()
            return next(action)
        }

        default:
            return next(action)
    }
}

export default loaderMiddleware;