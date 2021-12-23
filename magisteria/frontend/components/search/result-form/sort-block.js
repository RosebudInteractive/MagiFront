import React from "react"
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import {countSelector, sortTypeSelector, setSortType} from "ducks/search"

import "./result-form.sass"
import {SEARCH_SORT_TYPE} from "../../../constants/common-consts";

class SortBlock extends React.Component {

    render() {
        const {count, sort} = this.props

        return <div className={"sort-type__block" + (!count ? " _disabled" : "")}>
                    <span className="font-universal__body-medium">Сортировать:</span>
                    <span className={"font-universal__body-medium sort-type__item" + ((sort.name === SEARCH_SORT_TYPE.BY_RELEVANCY.name) ? " _active" : "")} onClick={() => this._setSort(SEARCH_SORT_TYPE.BY_RELEVANCY)}>По релевантности</span>
                    <span className={"font-universal__body-medium sort-type__item" + ((sort.name === SEARCH_SORT_TYPE.BY_DATE.name) ? " _active" : "")} onClick={() => this._setSort(SEARCH_SORT_TYPE.BY_DATE)}>По дате</span>
                </div>
        }

    _setSort(value) {
        if ((this.props.sort.name !== value.name) && this.props.count) {
            this.props.actions.setSortType(value)
        }
    }
}

const mapStateToProps = (state) => {
    return {
        count: countSelector(state),
        sort: sortTypeSelector(state)
    }
}

const mapStateToDispatch = (dispatch) => {
    return {
        actions: bindActionCreators({setSortType}, dispatch)
    }
}

export default connect(mapStateToProps, mapStateToDispatch)(SortBlock)
