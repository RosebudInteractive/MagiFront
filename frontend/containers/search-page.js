import React, {Component} from 'react'
import {resultSelector, isEmptySelector, fetchingSelector, search} from "adm-ducks/search";
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
    }


    render() {
        const {fetching, result, } = this.props

        return fetching ?
            <LoadingFrame visible={fetching} title={"Идет поиск..."}/>
            :
            <ResultForm result={result}/>
    }
}

const mapState2Props = (state) => {
    return {
        isEmpty: isEmptySelector(state),
        result: resultSelector(state),
        fetching: fetchingSelector(state),
        // errorDlgShown: state.commonDlg.errorDlgShown,
        // errorMessage: state.commonDlg.message
    }
}

const mapDispatch2Props = (dispatch) => {
    return {
        actions: bindActionCreators({search, whoAmI, setCurrentPage}, dispatch)
    }
}

export default connect(mapState2Props, mapDispatch2Props)(SearchPage)
