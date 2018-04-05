import {
    LOAD_FILTER_VALUES,
    SWITCH_FILTERS,
    CLEAR_FILTERS,
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
                    id: item.Id,
                    name: item.Name,
                    count: item.Counter,
                    selected: false
                })
            });

            return {...state, items: _items,};
        }

        case  SWITCH_FILTERS: {
            let _index = state.items.findIndex((item) => {
                return item.id === parseInt(action.payload)
            });

            if (_index > -1) {
                let _items = state.items.slice(0, _index);
                let _newItem = Object.assign({}, state.items[_index]);
                _newItem.selected = !_newItem.selected;
                _items.push(_newItem);
                let _newItems = _items.concat(state.items.slice(_index + 1));

                return {...state, items: _newItems}
            } else {
                return state;
            }
        }
        case CLEAR_FILTERS: {
            let _newItems = [...state.items];
            _newItems.forEach((item) => {
                item.selected = false
            });

            return {...state, items: _newItems};
        }

        default:
            return state;
    }
}