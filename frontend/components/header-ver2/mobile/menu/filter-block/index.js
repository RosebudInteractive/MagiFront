import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {
    filterCourseTypeSelector,
    rootSelector,
    filtersSelector,
    isEmptyFilterSelector,
    loadingSelector,
    switchFilter,
    toggleCourseTypeToFilter,
    clear,
} from "ducks/filters";
import {FILTER_COURSE_TYPE} from "../../../../../constants/filters";
import './fiter-block.sass'

class FiltersRow extends React.Component {

    render() {
        return <div className='mobile-menu__section filter-block'>
                <ul className="filters-list">
                    {this._getFilters()}
                </ul>
            </div>
    }

    _getFilters() {
        const {isEmptyFilter, rootItem, filters,} = this.props

        let _array = []

        _array.push(<li className={"filter-item menu-item" + (isEmptyFilter ? ' active' : "")} onClick={::this.props.clearFilter}>
                        <span className="filter-btn__title underlined-item">
                            {rootItem.name}
                            <span className="filter-btn__index">
                                {this._getCount(rootItem)}
                            </span>
                        </span>
        </li>)

        filters.forEach((item, key) => {
            _array.push(<React.Fragment>
                    <li key={key} className={"filter-item menu-item" + (item.get('selected') ? ' active' : "")} onClick={() => {::this._onItemClick(item.get('URL'))}}>
                        <span className="filter-btn__title underlined-item">
                            {item.get('name') + ' '}
                            <span className="filter-btn__index">
                                {this._getCount(item.toJS())}
                            </span>
                        </span>
                    </li>
                </React.Fragment>
            )
        })

        return _array
    }

    _getCount(item) {
        const {filterCourseType} = this.props

        let result = 0
        for (let type in FILTER_COURSE_TYPE) {
            result = filterCourseType.has(FILTER_COURSE_TYPE[type]) ? result + item.count[type.toLowerCase()] : result
        }

        return result
    }

    _onItemClick(url) {
        this.props.switchFilter(url)
    }
}

function mapStateToProps(state) {
    return {
        currentPage: state.pageHeader.currentPage,
        filters: filtersSelector(state),
        loading: loadingSelector(state),
        filterCourseType: filterCourseTypeSelector(state),
        rootItem: rootSelector(state),
        isEmptyFilter: isEmptyFilterSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({switchFilter, toggleCourseTypeToFilter, clearFilter: clear}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(FiltersRow);