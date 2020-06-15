import React, {Component} from 'react'
import {querySelector, resultSelector, fetchingSelector, countSelector, search, clear, pagesSelector} from "ducks/search";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import ResultForm from "../components/search/result-form";
import LoadingFrame from "../components/loading-frame";
import {pages as PAGES} from "tools/page-tools";
import {whoAmI} from "actions/user-actions";
import {setCurrentPage} from "actions/page-header-actions";
import {SEARCH_SORT_TYPE} from "../constants/common-consts";
import NotFoundPage from "../components/not-found";

class SearchPage extends Component {

    constructor(props) {
        super(props)

        this._onBackHandler = () => {
            this._execQueryFromUrl()
        }
    }

    componentWillMount() {
        window.scrollTo(0, 0)
        this.props.actions.whoAmI()
        this.props.actions.setCurrentPage(PAGES.search);

        if (window.prerenderEnable) return

        if (!this.props.query) {
            this._execQueryFromUrl()
        }

        window.addEventListener("popstate", this._onBackHandler);
    }



    componentWillUnmount() {
        this.props.actions.clear()
        window.removeEventListener("popstate", this._onBackHandler);
    }

    componentDidUpdate(prevProps) {
        if ((prevProps.query !== this.props.query) || (prevProps.pages.currentPage !== this.props.pages.currentPage)) {
            window.scrollTo(0, 0)
        }
    }

    render() {
        if (window.prerenderEnable) { return <NotFoundPage/> }

        const {fetching, result, count} = this.props

        return fetching ?
            <LoadingFrame visible={fetching} title={"Идет поиск..."}/>
            :
            <ResultForm result={result} count={count}/>
    }

    _execQueryFromUrl() {
        const _params = new URLSearchParams(this.props.location.search),
            _query = _params.get('q'),
            _page = _params.get('p') ? +_params.get('p') : null,
            _sort = _params.get('s') ? _params.get('s').toUpperCase() : null

        if (_query) {
            const _searchQuery = {query: _query, page: _page ? _page : 1}

            if (_sort && SEARCH_SORT_TYPE[_sort]) {
                _searchQuery.sort = SEARCH_SORT_TYPE[_sort]
            }

            this.props.actions.search(_searchQuery)
        }
    }
}

const mapState2Props = (state) => {
    return {
        query: querySelector(state),
        result: resultSelector(state),
        fetching: fetchingSelector(state),
        count: countSelector(state),
        pages: pagesSelector(state),
    }
}

const mapDispatch2Props = (dispatch) => {
    return {
        actions: bindActionCreators({search, whoAmI, setCurrentPage, clear}, dispatch)
    }
}

export default connect(mapState2Props, mapDispatch2Props)(SearchPage)
