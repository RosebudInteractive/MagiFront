import React from 'react'
import PropTypes from 'prop-types';
import FixControl from '../common/fix-course-lesson'
import { fixedCourseIdSelector, fixedObjDescrSelector, } from "adm-ducks/app"
import {connect} from "react-redux";

class Wrapper extends React.Component {

    static propTypes = {
        course: PropTypes.object,
    }

    render() {
        let {course, fixedCourseId, descr,} = this.props,
            _fixed = (course && (course.id === fixedCourseId)),
            _descr = _fixed ? descr : '';

        return <div className="fix-course-wrapper">
            <FixControl label={'Зафиксировать курс'} fixed={_fixed} descr={_descr}/>
        </div>
    }
}

function mapStateToProps(state) {
    return {
        fixedCourseId: fixedCourseIdSelector(state),
        descr: fixedObjDescrSelector(state),
    }
}

export default connect(mapStateToProps)(Wrapper);
