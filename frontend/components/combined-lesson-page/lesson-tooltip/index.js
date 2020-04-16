import React from "react"
import PropTypes from 'prop-types'
import {connect} from "react-redux";
import {bindActionCreators} from "redux";

import "./lesson-tooltip.sass"

class LessonTooltip extends React.Component {
    static propTypes = {
        lessonId: PropTypes.number,
    }

    render() {
        let _tests = this._getTests()

        return _tests && (_tests.length > 0) &&
            <div className="test-buttons-block">

            </div>
    }

}

const mapStateToProps = (state) => {
    return {
        // lessonList: lessonsSelector(state),
    }
}

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(LessonTooltip);