import React, {Component} from 'react'
import {resultSelector, isEmptySelector, fetchingSelector, search} from "adm-ducks/search";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import QueryForm from "./search/query-form";
import ResultForm from "./search/result-form";
import ErrorDialog from "./dialog/error-dialog";
import SavingPage from "./common/saving-page";

class Home extends Component {
    render() {
        const {fetching, isEmpty, result, actions, errorDlgShown, errorMessage, } = this.props

        return <div className='page'>
            <SavingPage visible={fetching} title={"Идет поиск..."}/>
            <QueryForm onSearch={actions.search} isEmpty={isEmpty}/>
            {!isEmpty && <ResultForm result={result}/>}
            {
                errorDlgShown ?
                    <ErrorDialog
                        message={errorMessage}
                    />
                    :
                    null
            }
        </div>
    }
}

const mapState2Props = (state) => {
    return {
        isEmpty: isEmptySelector(state),
        result: resultSelector(state),
        fetching: fetchingSelector(state),
        errorDlgShown: state.commonDlg.errorDlgShown,
        errorMessage: state.commonDlg.message
    }
}

const mapDispatch2Props = (dispatch) => {
    return {
        actions: bindActionCreators({search}, dispatch)
    }
}

export default connect(mapState2Props, mapDispatch2Props)(Home)
