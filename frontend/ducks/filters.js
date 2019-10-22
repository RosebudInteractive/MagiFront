import {appName} from '../config'
import {createSelector} from 'reselect'
import Immutable, {Record, Map,} from 'immutable'
import {GET_COURSES_REQUEST, GET_COURSES_SUCCESS} from "../constants/courses";

/**
 * Constants
 * */
export const moduleName = 'filters'
const prefix = `${appName}/${moduleName}`

export const CLEAR_FILTERS = `${prefix}/CLEAR_FILTERS`
export const SWITCH_FILTERS = `${prefix}/SWITCH_FILTERS`
export const APPLY_EXTERNAL_FILTER = `${prefix}/APPLY_EXTERNAL_FILTER`


/**
 * Reducer
 * */
export const ReducerRecord = Record({
    filters: new Map(),
    loading: false,
})

export default function reducer(state = new ReducerRecord(), action) {
    const {type, payload} = action

    switch (type) {
        case GET_COURSES_REQUEST:
            return state
                .set('loading', true)
                .update('filters', filters => filters.clear())

        case GET_COURSES_SUCCESS: {
            let _map = _getFilters(payload)

            return state
                .update('filters', filters => filters.merge(_map))
                .set('loading', false)
        }


        case CLEAR_FILTERS:
            return state
                .update('filters', filters => {
                    return filters.map((item) => {
                        return item.set('selected', false)
                    });
                })

        case SWITCH_FILTERS:
            return state
                .setIn(['filters', payload, 'selected'], !state.getIn(['filters', payload, 'selected']))

        case APPLY_EXTERNAL_FILTER: {
            if (payload) {
                let _map = state.get('filters');

                payload.forEach((item) => {
                    if (_map.has(item)) {
                        _map = _map.setIn([item, 'selected'], true)
                    }
                })

                return state
                    .set('filters', _map)
            } else {
                return state
            }

        }

        default:
            return state
    }
}

const _getFilters = (data) => {

    let _obj = {}

    if (data.Categories) {
        data.Categories.map((item) => {
            let _value = {
                id: item.Id,
                name: item.Name,
                count: item.Counter,
                URL: item.URL,
                selected: false,
            }

            return _obj[item.URL]= _value
        })

        _obj['0'] = {
            id: 0,
            name: "Все темы",
            count: data.Categories.reduce((acc, item) => {
                return acc + item.Counter
            }, 0),
            URL: "/",
            selected: false,
        }
    }

    return Immutable.fromJS(_obj)
}

/**
 * Selectors
 * */

export const stateSelector = state => state[moduleName]
export const filtersSelector = createSelector(stateSelector, state => state.filters)
export const loadingSelector = createSelector(stateSelector, state => state.loading)
export const isEmptyFilterSelector = createSelector(filtersSelector, filter => filter.every(item => !item.get('selected')))
export const selectedFilterSelector = createSelector(filtersSelector, filter => filter.filter(item => item.get('selected')))

/**
 * Action Creators
 * */

export const clear = () => {
    return {type: CLEAR_FILTERS}
};

export const switchFilter = (id) => {
    return {
        type: SWITCH_FILTERS,
        payload: id
    }
}

export const applyExternalFilter = (value) => {
    let _array = value.split('+');

    return {
        type: APPLY_EXTERNAL_FILTER,
        payload: _array
    }
}