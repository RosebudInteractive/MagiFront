import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import './desktop-filters.css';
import * as pageHeaderActions from "../../actions/page-header-actions";
import * as filtersActions from '../../actions/filters-actions';
import filters from "../../reducers/filters";

class FiltersRow extends React.Component {

    _hideForm() {
        this.props.pageHeaderActions.hideFiltersForm();
    }

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
        this.props.filtersActions.clear()
    }

    render() {
        // let that = this;
        // let _className = 'search-block' + (this.props.showSearchForm ? ' opened' : '');

        return (
            <div className="page-header__row filters-row opened">
                <div className="page-header__wrapper filters-row__wrapper">
                    <div className="filters-row__inner">
                        <p className="filters-row__label" onClick={::this._clearFilter}>Сбросить фильтры</p>
                        <ul className="filters-list">
                            {/*<li>*/}
                            {/*<div className="filter-btn">*/}
                            {/*<span className="filter-btn__title">Литература <span className="filter-btn__index">12</span></span>*/}
                            {/*</div>*/}

                            {/*</li>*/}
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
        showSearchForm: state.pageHeader.showSearchForm,
        pageHeader: state.pageHeader,
        filters: state.filters.items,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        pageHeaderActions: bindActionCreators(pageHeaderActions, dispatch),
        filtersActions: bindActionCreators(filtersActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(FiltersRow);