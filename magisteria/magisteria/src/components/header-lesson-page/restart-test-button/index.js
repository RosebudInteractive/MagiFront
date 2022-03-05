import React from 'react';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';

import './restart-test-button.sass'
import {createNewTestInstance} from "ducks/test-instance";
import {connect} from "react-redux";

class RestartButton extends React.Component {

    static propTypes = {
        test: PropTypes.object
    }

    render() {
        const RESTART = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#reload"/>';

        return <div className="restart-test-button" onClick={::this._createInstance}>
            <svg width="15" height="15" dangerouslySetInnerHTML={{__html: RESTART}}/>
        </div>
    }

    _createInstance() {
        this.props.createNewTestInstance(this.props.test.URL)
    }
}

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({createNewTestInstance}, dispatch)
}

export default connect(null, mapDispatchToProps)(RestartButton)