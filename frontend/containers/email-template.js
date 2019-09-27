import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {getCourse} from '../actions/courses-page-actions';

class EmailTemplate extends React.Component {

    constructor(props) {
        super(props)

        this.props.getCourses(this.props.courseUrl)
    }

    render() {
        return null
    }
}

const mapStateToProps = (state, ownProps) => ({
    courseUrl: ownProps.match.params.url,
    course: state.singleCourse.object,
})

const mapDispatchToProps = dispatch => bindActionCreators({
    getCourse,
}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(EmailTemplate);