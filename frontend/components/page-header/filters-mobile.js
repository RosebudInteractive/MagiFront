import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import './desktop-filters.css';
import * as pageHeaderActions from "../../actions/page-header-actions";
import * as filtersActions from '../../actions/filters-actions';


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
            <div className='filters-mobile'>
                <div className="filters-mobile__trigger js-filters-mobile-trigger">
                    <svg className="filters-mobile__icon" width="22" height="21">
                        <svg id="filter" viewBox="0 0 22 21" width="100%" height="100%"><title>Group</title>
                            <desc>Created using Figma</desc>
                            <g transform="translate(1 3)">
                                <path id="filter-a" d="M0 0h12v2H0V0z"/>
                            </g>
                            <g transform="translate(17 3)">
                                <path id="filter-b" d="M0 0h4v2H0V0z"/>
                            </g>
                            <g transform="translate(9 10)">
                                <path id="filter-a" d="M0 0h12v2H0V0z"/>
                            </g>
                            <g transform="translate(1 17)">
                                <path id="filter-a" d="M0 0h12v2H0V0z"/>
                            </g>
                            <g transform="translate(13 1)">
                                <path id="filter-c" d="M0 0h2v6H0V0z"/>
                            </g>
                            <g transform="translate(17 17)">
                                <path id="filter-b" d="M0 0h4v2H0V0z"/>
                            </g>
                            <g transform="translate(1 10)">
                                <path id="filter-b" d="M0 0h4v2H0V0z"/>
                            </g>
                            <g transform="translate(13 15)">
                                <path id="filter-c" d="M0 0h2v6H0V0z"/>
                            </g>
                            <g transform="translate(5 8)">
                                <path id="filter-c" d="M0 0h2v6H0V0z"/>
                            </g>
                        </svg>
                    </svg>
                    <span className="filters-mobile__label">Фильтры</span>
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