import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import * as pageHeaderActions from "../../actions/page-header-actions";

import * as svg from '../../tools/svg-paths';
import {filtersSelector, switchFilter, clear} from "../../ducks/filters";

class FiltersRow extends React.Component {

    constructor(props) {
        super(props);
    }

    _switchFilterForm(e) {
        let _isFilterItem = e.target.closest('.filters-list');

        if (!_isFilterItem) {
            this.props.showFiltersForm ?
                this.props.pageHeaderActions.hideFiltersForm()
                :
                this.props.pageHeaderActions.showFiltersForm()
        }
    }

    _getFilters() {
        let _filterElems = [];

        this.props.filters.forEach((item, key) => {
            _filterElems.push(
                <li key={key} className={item.get('selected') ? 'active' : null}>
                    <div className="filter-btn" key={key} onClick={::this._onClick} data-url={item.get('URL')}>
                        <span className="filter-btn__title" data-url={item.get('URL')}>{item.get('name') + ' '}
                            <span className="filter-btn__index" data-url={item.get('URL')}>{item.get('count')}</span>
                        </span>
                    </div>
                </li>
            )
        })

        return _filterElems
    }

    _onClick(e) {
        this.props.switchFilter(e.target.dataset.url)
    }

    _clearFilter() {
        this.props.clearFilter()
    }

    render() {
        return (
            <div className={'filters-mobile' + (this.props.showFiltersForm ? ' opened' : '')}
                 onClick={::this._switchFilterForm}>
                <div className="filters-mobile__trigger">
                    <svg className="filters-mobile__icon" width="22" height="21">
                        {svg.filter}
                    </svg>
                    <span className="filters-mobile__label">Фильтры</span>
                </div>
                {
                    this.props.showFiltersForm ?
                        <ul className="filters-list">
                            {this._getFilters()}
                        </ul>
                        :
                        null
                }
            </div>

        )
    }
}

function mapStateToProps(state) {
    return {
        showSearchForm: state.pageHeader.showSearchForm,
        showFiltersForm: state.pageHeader.showFiltersForm,
        filters: filtersSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        pageHeaderActions: bindActionCreators(pageHeaderActions, dispatch),
        switchFilter: bindActionCreators(switchFilter, dispatch),
        clearFilter: bindActionCreators(clear, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(FiltersRow);