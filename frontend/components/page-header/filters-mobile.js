import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import * as pageHeaderActions from "../../actions/page-header-actions";
import * as filtersActions from '../../actions/filters-actions';

import * as svg from '../../tools/svg-paths';


class FiltersRow extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            showForm: false
        }
    }

    _switchFilterForm() {
        let _newState = !this.state.showForm;
        this.setState({showForm: _newState})
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

    _onClick(e) {
        this.props.filtersActions.switchFilter(e.target.dataset.id)
    }

    _clearFilter() {
        this.props.filtersActions.clear()
    }

    // render() {
    //     return (
    //         <div className="page-header__row filters-row opened">
    //             <div className="page-header__wrapper filters-row__wrapper">
    //                 <div className="filters-row__inner">
    //                     <p className="filters-row__label" onClick={::this._clearFilter}>Сбросить фильтры</p>
    //                     <ul className="filters-list">
    //                         {this._getFilters()}
    //                     </ul>
    //                 </div>
    //             </div>
    //         </div>
    //     )
    // }

    render() {
        return (
            <div className={'filters-mobile' + (this.state.showForm ? ' opened' : '')}
                 onClick={::this._switchFilterForm}>
                <div className="filters-mobile__trigger">
                    <svg className="filters-mobile__icon" width="22" height="21">
                        {svg.filter}
                    </svg>
                    <span className="filters-mobile__label">Фильтры</span>
                </div>
                {
                    this.state.showForm ?
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