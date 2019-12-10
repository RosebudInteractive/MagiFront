import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {testSelector, loadingSelector as fetchingTest, loadedSelector as testLoaded} from "ducks/test"
import {testResultSelector, loadingSelector as fetchingResult, loadedSelector as resultLoaded, getTestResult} from "ducks/test-result"
import ResultPreview from "../components/test-result-preview";
import LoadingFrame from "../components/loading-frame";
import NotFoundPage from "../components/not-found";

import "../components/test-result-preview/test-result-preview.sass"

class TestResultPreview extends React.Component{

    constructor(props) {
        super(props)

        this.props.getTestResult(this.props.instanceId)

        $(body).addClass("result-preview")
    }

    componentWillUnmount(){
        $(body).removeClass("result-preview")
    }

    render() {
        let {fetching, loaded, notFound, result, test} = this.props

        return fetching || !loaded ?
            <LoadingFrame extClass={"test-page"}/>
            :
            notFound ?
                <NotFoundPage/>
                :
                <div className="test-result-preview">
                    <ResultPreview test={test} result={result}/>
                </div>
    }

}

const mapStateToProps = (state, ownProps) => {
    return {
        instanceId: ownProps.match.params.instanceId,
        test: testSelector(state),
        result: testResultSelector(state),
        fetching: fetchingTest(state) || fetchingResult(state),
        loaded: testLoaded(state) || resultLoaded(state),
    }
}

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({getTestResult}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(TestResultPreview)