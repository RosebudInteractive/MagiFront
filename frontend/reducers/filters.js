import {
    LOAD_FILTER_VALUES,
    // GET_COURSES_SUCCESS,
    // GET_COURSES_FAIL,
} from '../constants/filters'

const initialState = {
    items: [],
};

export default function filters(state = initialState, action) {

    switch (action.type) {
        case LOAD_FILTER_VALUES: {
            let _items = [];
            let _filters = action.payload;
            _filters.forEach((item) => {
                _items.push({
                    name: item.Name,
                    count: item.Counter,
                    selected: false
                })
            });

            return {...state, items: _items,};
        }

        default:
            return state;
    }
}