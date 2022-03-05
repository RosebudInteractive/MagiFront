import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import * as pageHeaderActions from "../../actions/page-header-actions";
import {clear, filtersSelector, switchFilter} from "ducks/filters";

class FiltersRow extends React.Component {

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

    _onClick(e){
        this.props.switchFilter(e.target.dataset.url)
    }

    _clearFilter() {
        this.props.clearFilter();
        this.props.pageHeaderActions.hideFiltersForm();
    }

    render() {
        return (
            <div className={'page-header__row filters-row' + (this.props.showFiltersForm ? ' opened' : '')}>
                <div className="page-header__wrapper filters-row__wrapper">
                    <div className="filters-row__inner">
                        <p className="filters-row__label" onClick={::this._clearFilter}>Сбросить фильтры</p>
                        <ul className="filters-list">
                            {this._getFilters()}
                        </ul>
                    </div>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        showFiltersForm: state.pageHeader.showFiltersForm,
        filters: filtersSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        switchFilter: bindActionCreators(switchFilter, dispatch),
        clearFilter: bindActionCreators(clear, dispatch),
        pageHeaderActions: bindActionCreators(pageHeaderActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(FiltersRow);