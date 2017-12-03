/**
 * Created by levan.kiknadze on 11/11/2017.
 */

import { SELECT_ITEM /*, MENU_ITEM_EPISODES*/ } from '../constants/Menu'

export function setSelected(id) {
    console.log("setSelected", this)
    return (dispatch) => {
        dispatch( {
            type: SELECT_ITEM,
            payload: id
        })

        /*if (id == MENU_ITEM_EPISODES)
            setTimeout(() => {
                getEpisodes()
            })*/
    }
}