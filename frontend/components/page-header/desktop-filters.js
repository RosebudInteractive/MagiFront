import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import * as filtersActions from '../../actions/filters-actions';
import * as pageHeaderActions from "../../actions/page-header-actions";

class FiltersRow extends React.Component {

    _getFilters() {
        return this.props.filters.map((item, index) => {
            return (
                <li key={index} className={item.selected ? 'active' : null}>
                    <div className="filter-btn" key={index} onClick={::this._onClick} data-id={item.id}>
                        <span className="filter-btn__title" data-id={item.id}>{item.name + ' '}
                            <span className="filter-btn__index" data-id={item.id}>{item.count}</span>
                        </span>
                    </div>
                </li>
            )
        })
    }

    _onClick(e){
        this.props.filtersActions.switchFilter(e.target.dataset.id)
    }

    _clearFilter() {
        this.props.filtersActions.clear();
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
        filters: state.filters.items,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        filtersActions: bindActionCreators(filtersActions, dispatch),
        pageHeaderActions: bindActionCreators(pageHeaderActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(FiltersRow);