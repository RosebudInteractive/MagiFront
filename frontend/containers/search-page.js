import React, {Component} from 'react'
import {querySelector, resultSelector, fetchingSelector, countSelector, search, clear, pagesSelector} from "ducks/search";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import ResultForm from "../components/search/result-form";
import LoadingFrame from "../components/loading-frame";
import {pages as PAGES} from "tools/page-tools";
import {whoAmI} from "actions/user-actions";
import {setCurrentPage} from "actions/page-header-actions";

class SearchPage extends Component {

    componentWillMount() {
        window.scrollTo(0, 0)
        this.props.actions.whoAmI()
        this.props.actions.setCurrentPage(PAGES.search);

        if (!this.props.query) {
            const _params = new URLSearchParams(this.props.location.search),
                _query = _params.get('q'),
                _page = _params.get('p') ? +_params.get('p') : null

            if (_query) {this.props.actions.search({query: _query, page: _page ? _page : 1})}
        }

    }


    componentWillUnmount() {
        this.props.actions.clear()
    }

    componentDidUpdate(prevProps) {
        if ((prevProps.query !== this.props.query) || (prevProps.pages.currentPage !== this.props.pages.currentPage)) {
            window.scrollTo(0, 0)
        }
    }

    render() {
        const {fetching, result, count} = this.props

        return fetching ?
            <LoadingFrame visible={fetching} title={"Идет поиск..."}/>
            :
            <ResultForm result={result} count={count}/>
    }
}

const mapState2Props = (state) => {
    return {
        query: querySelector(state),
        result: resultSelector(state),
        fetching: fetchingSelector(state),
        count: countSelector(state),
        pages: pagesSelector(state),
        // errorDlgShown: state.commonDlg.errorDlgShown,
        // errorMessage: state.commonDlg.message
    }
}

const mapDispatch2Props = (dispatch) => {
    return {
        actions: bindActionCreators({search, whoAmI, setCurrentPage, clear}, dispatch)
    }
}

export default connect(mapState2Props, mapDispatch2Props)(SearchPage)
