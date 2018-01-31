import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import './desktop-filters.css';
import * as pageHeaderActions from "../../actions/page-header-actions";

class FiltersRow extends React.Component {

    _hideForm() {
        this.props.pageHeaderActions.hideFiltersForm();
    }

    render() {
        // let that = this;
        // let _className = 'search-block' + (this.props.showSearchForm ? ' opened' : '');

        return (
            <div className="page-header__row filters-row opened">
                <div className="page-header__wrapper filters-row__wrapper">
                    <div className="filters-row__inner">
                        <p className="filters-row__label">Сбросить фильтры</p>
                        <ul className="filters-list">
                            <li>
                                <a href="#" className="filter-btn">
                                    <span className="filter-btn__title">Литература <span className="filter-btn__index">12</span></span>
                                </a>
                            </li>
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
    }
}

function mapDispatchToProps(dispatch) {
    return {
        pageHeaderActions: bindActionCreators(pageHeaderActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(FiltersRow);