import React from "react"
import {bindActionCreators} from 'redux';
import {connect} from "react-redux";
import PropTypes from 'prop-types'

import "./start-button.sass"
import {testSelector} from "ducks/test";
import {createNewTestInstance} from "ducks/test-instance";


class StartButton extends React.Component {

    static propTypes = {
        test: PropTypes.object,
    }

    render() {
        return <div className="start-button__wrapper">
            <div className="button btn--brown" onClick={::this._createInstance}>
                Начать тест
            </div>
        </div>
    }

    _createInstance() {
        this.props.createNewTestInstance(this.props.test.URL)
    }
}

const mapStateToProps = (state) => {
    return {test: testSelector(state)}
}

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({createNewTestInstance}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(StartButton)