import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {pages} from "tools/page-tools";
import {
    filterMainTypeSelector,
    filterCourseTypeSelector,
    rootSelector,
    filtersSelector,
    isEmptyFilterSelector,
    loadingSelector,
    switchFilter,
    toggleCourseTypeToFilter,
    clear,
} from "ducks/filters";
import './filter.sass'
import $ from "jquery";
import {FILTER_COURSE_TYPE} from "../../../../constants/filters";

class FiltersRow extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            showShadowAfter : false,
            showShadowBefore : false,
        }

        this._onScrollBinded = false

        this._handleResize = function() {
            let _filter = $('.filters-list'),
                _row = $('.filters-row__inner')

            if (!_filter || (_filter.length === 0)) {
                return
            }

            let _last = $('.filter-item').last(),
                _right = _last.offset().left + _last.innerWidth(),
                _first = $('.filter-item').first(),
                _left = _first.offset().left

            if (_row && (_row.length > 0) && _filter) {
                const _needShowShadowAfter = Math.round(_right) > Math.round(_row.offset().left + _row.innerWidth())

                if (this.state.showShadowAfter !== _needShowShadowAfter) {
                    this.setState({showShadowAfter: _needShowShadowAfter})
                }

                const _needShowShadowBefore = Math.round(_left) < Math.round(_row.offset().left)

                if (this.state.showShadowBefore !== _needShowShadowBefore) {
                    this.setState({showShadowBefore: _needShowShadowBefore})
                }
            }

        }.bind(this)

        this._wheelHandler = (e) => {
            let _last = $('.filter-item').last(),
                _right = _last.offset().left + _last.innerWidth(),
                _row = $('.filters-row__inner')

            let _first = $('.filter-item').first(),
                _left = _first.offset().left

            const _needHandle = Math.round(_right) > Math.round(_row.offset().left + _row.innerWidth()) ||
                Math.round(_left) < Math.round(_row.offset().left)

            if (!_needHandle) return

            const _delta = e.originalEvent.deltaY
            $(".filters-list").scrollLeft(_delta)
            e.preventDefault()
        }

        this._scrollHandler = () => {
            let _last = $('.filter-item').last(),
                _right = _last.offset().left + _last.innerWidth(),
                _row = $('.filters-row__inner')

            const _needShowShadowAfter = Math.round(_right - 5) > Math.round(_row.offset().left + _row.innerWidth())

            if (this.state.showShadowAfter !== _needShowShadowAfter) {
                this.setState({showShadowAfter: _needShowShadowAfter})
            }

            let _first = $('.filter-item').first(),
                _left = _first.offset().left

            const _needShowShadowBefore = Math.round(_left) < Math.round(_row.offset().left)

            if (this.state.showShadowBefore !== _needShowShadowBefore) {
                this.setState({showShadowBefore: _needShowShadowBefore})
            }
        }


    }

    componentDidMount() {
        this._handleResize();
        this._addEventListeners();

    }

    componentDidUpdate(prevProps) {
        if (!this.props.loading && prevProps.loading) {
            this._handleResize();

            if (!this._onScrollBinded) {
                $('.filters-list').bind("wheel", this._wheelHandler)

                $('.filters-list').scroll(this._scrollHandler)

                this._onScrollBinded = true
            }

        }
    }

    componentWillUnmount() {
        this._removeEventListeners();
    }

    render() {
        const {loading, filterCourseType, filterMainType} = this.props,
            _isCoursesPage = this.props.currentPage.name === pages.courses.name;

        return _isCoursesPage && !loading &&
            <div className={'page-header__row filters-row'}>
                <div className="page-header__wrapper filters-row__wrapper">
                    <div className="filters-row__inner">
                        <div className={"filter-list__shadow-element" + (this.state.showShadowBefore ? " _shadow" : "")}/>
                        <ul className="filters-list">
                            {this._getFilters()}
                        </ul>
                    </div>
                    <div className={"ext-block_wrapper" + (this.state.showShadowAfter ? " _shadow" : "")}>
                        {
                            filterMainType === FILTER_COURSE_TYPE.THEORY &&
                            <div className="ext-block__button ext-block__item">
                                <div className={"selector__item underlined-item" + (filterCourseType.has(FILTER_COURSE_TYPE.PRACTICE) ? " active" : "")}
                                     onClick={() => {this.props.toggleCourseTypeToFilter(FILTER_COURSE_TYPE.PRACTICE)}}>
                                    {filterCourseType.has(FILTER_COURSE_TYPE.PRACTICE) ? "- ????????????" : "+ ????????????"}
                                </div>
                            </div>
                        }
                        {
                            filterMainType === FILTER_COURSE_TYPE.PRACTICE &&
                            <div className="ext-block__button ext-block__item">
                                <div className={"selector__item underlined-item"  + (filterCourseType.has(FILTER_COURSE_TYPE.THEORY) ? " active" : "")}
                                     onClick={() => {this.props.toggleCourseTypeToFilter(FILTER_COURSE_TYPE.THEORY)}}>
                                    {filterCourseType.has(FILTER_COURSE_TYPE.THEORY) ? "- ????????????" : "+ ????????????"}
                                </div>
                            </div>
                        }
                        {/*<div className="ext-block__selector ext-block__item">*/}
                        {/*    <span className="selector__item underlined-item">??????????</span>*/}
                        {/*    <span className="selector__separator"> / </span>*/}
                        {/*    <span className="selector__item underlined-item">????????????</span>*/}
                        {/*</div>*/}
                    </div>
                </div>
            </div>
    }

    _getFilters() {
        const {isEmptyFilter, rootItem, filters,} = this.props

        let _array = []

        _array.push(<li className={"filter-item" + (isEmptyFilter ? ' active' : "")}>
            <div className="filter-btn" onClick={::this.props.clearFilter}>
                        <span className="filter-btn__title underlined-item">
                            {rootItem.name}
                            <span className="filter-btn__index">
                                {this._getCount(rootItem)}
                            </span>
                        </span>
            </div>
        </li>)

        filters.forEach((item, key) => {
            const _count = this._getCount(item.toJS())

            if (_count) {
                _array.push(<React.Fragment>
                    <li key={key} className={"filter-item" + (item.get('selected') ? ' active' : "")}>
                        <div className="filter-btn" key={key} onClick={() => {::this._onItemClick(item.get('URL'))}}>
                        <span className="filter-btn__title underlined-item">
                            {item.get('name') + ' '}
                            <span className="filter-btn__index">
                                {_count}
                            </span>
                        </span>
                        </div>
                    </li>
                </React.Fragment>)
            }

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

    _addEventListeners() {
        $(window).bind('resize', this._handleResize)
        $(".filters-list").bind("wheel", this._wheelHandler)
        $(".filters-list").bind("scroll", this._scrollHandler)
    }

    _removeEventListeners() {
        $(window).unbind('resize', this._handleResize)
        $(".filters-list").unbind("wheel", this._wheelHandler)
        $(".filters-list").unbind("scroll", this._scrollHandler)
    }
}

function mapStateToProps(state) {
    return {
        currentPage: state.pageHeader.currentPage,
        filters: filtersSelector(state),
        loading: loadingSelector(state),
        filterCourseType: filterCourseTypeSelector(state),
        filterMainType: filterMainTypeSelector(state),
        rootItem: rootSelector(state),
        isEmptyFilter: isEmptyFilterSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({switchFilter, toggleCourseTypeToFilter, clearFilter: clear}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(FiltersRow);