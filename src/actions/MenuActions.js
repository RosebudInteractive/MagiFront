/**
 * Created by levan.kiknadze on 11/11/2017.
 */

import { SELECT_ITEM } from '../constants/Menu'

export function setSelected(id) {
    return (dispatch) => {
        dispatch( {
            type: SELECT_ITEM,
            payload: id
        })
    }
}