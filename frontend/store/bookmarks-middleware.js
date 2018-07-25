import {SIGN_IN_SUCCESS, WHO_AM_I_SUCCESS} from "../constants/user";

import {getUserBookmarks} from "../ducks/profile";
import {store} from './configureStore';

const BookmarksMiddleware = store => next => action => {

    switch (action.type) {

        case SIGN_IN_SUCCESS: {
            let result = next(action)
            Bookmarks.getInstance().loadBookmarks();
            return result
        }

        case WHO_AM_I_SUCCESS: {
            let result = next(action)
            Bookmarks.getInstance().loadBookmarks();
            return result
        }

        default:
            return next(action)
    }
}

let _instance = null;

class Bookmarks {

    static getInstance() {
        if (!_instance) {
            _instance = new Bookmarks()
        }

        return _instance
    }

    loadBookmarks() {
        store.dispatch(getUserBookmarks());
    }
}

export default BookmarksMiddleware;