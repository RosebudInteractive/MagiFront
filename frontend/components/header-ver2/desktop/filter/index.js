import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {pages} from "tools/page-tools";
import {clear, filtersSelector, loadingSelector, switchFilter} from "ducks/filters";
import './filter.sass'
import $ from "jquery";

class FiltersRow extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            showShadow : false
        }

        this._handleResize = function() {
            let _filter = $('.filters-list'),
                _row = $('.filters-row__inner')

            if (_row && _filter) {
                const _needShowShadow = _filter.width() > _row.width()

                if (this.state.showShadow !== _needShowShadow) {
                    this.setState({showShadow: _needShowShadow})
                }
            }

        }.bind(this)

        this._addEventListeners();
    }

    componentDidMount() {
        this._handleResize();
    }

    componentDidUpdate(prevProps) {
        if (!this.props.loading && prevProps.loading) {
            this._handleResize();
        }
    }

    componentWillUnmount() {
        this._removeEventListeners();
    }

    render() {
        const _isCoursesPage = this.props.currentPage.name === pages.courses.name;

        return _isCoursesPage && !this.props.loading &&
            <div className={'page-header__row filters-row' + (this.props.showFiltersForm ? ' opened' : '')}>
                <div className="page-header__wrapper filters-row__wrapper">
                    <div className="filters-row__inner">
                        <ul className="filters-list">
                            {this._getFilters()}
                        </ul>
                    </div>
                    <div className={"ext-block_wrapper" + (this.state.showShadow ? " _shadow" : "")}>
                        <div className="ext-block__button ext-block__item">+ Практика</div>
                        <div className="ext-block__selector ext-block__item">
                            <span className="selector__courses">Курсы</span>
                            <span className="selector__separator"> / </span>
                            <span className="selector__lessons">Лекции</span>
                        </div>
                    </div>
                </div>
            </div>
    }

    _getFilters() {
        let _array = []

        this.props.filters.forEach((item, key) => {
            _array.push(<React.Fragment>
                <li key={key} className={"filter-item" + (item.get('selected') ? ' active' : "")}>
                    <div className="filter-btn" key={key} onClick={() => {::this._onItemClick(item.get('URL'))}}>
                        <span className="filter-btn__title">
                            {item.get('name') + ' '}
                            <span className="filter-btn__index">
                                {item.get('count')}
                            </span>
                        </span>
                    </div>
                </li>
            </React.Fragment>
            )
        })

        return _array
    }

    _onItemClick(url) {
        if (url === '/') {
            this.props.clearFilter();
        } else {
            this.props.switchFilter(url)
        }
    }

    _addEventListeners() {
        $(window).bind('resize', this._handleResize)
    }

    _removeEventListeners() {
        $(window).unbind('resize', this._handleResize)
    }
}

function mapStateToProps(state) {
    return {
        showFiltersForm: state.pageHeader.showFiltersForm,
        currentPage: state.pageHeader.currentPage,
        filters: filtersSelector(state),
        loading: loadingSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        switchFilter: bindActionCreators(switchFilter, dispatch),
        clearFilter: bindActionCreators(clear, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(FiltersRow);