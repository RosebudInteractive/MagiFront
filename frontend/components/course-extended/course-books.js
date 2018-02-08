import React from 'react';
import {connect} from 'react-redux';

class CourseBooks extends React.Component {

    _getList() {
    }

    render() {
        if (!this.props.course) {
            return null
        }

        return (
            <ol className="lectures-tab">

            </ol>
        );
    }
}

function mapStateToProps(state) {
    return {
        course: state.singleCourse.object,
    }
}

export default connect(mapStateToProps)(CourseBooks);