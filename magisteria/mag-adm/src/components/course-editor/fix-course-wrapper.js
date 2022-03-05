import React from 'react'
import PropTypes from 'prop-types';
import FixControl from '../common/fix-course-lesson'
import {fixedCourseIdSelector, fixedObjDescrSelector, parametersFetchingSelector,} from "adm-ducks/params"
import {connect} from "react-redux";

class Wrapper extends React.Component {

    static propTypes = {
        course: PropTypes.object,
        canFix: PropTypes.bool,
    }

    render() {
        let {course, fixedCourseId, descr, fetching, canFix} = this.props,
            _fixed = (course && (course.id === fixedCourseId)),
            _descr = _fixed ? descr : '';

        return <div className="fix-course-wrapper">
            {
                fetching ?
                    null
                    :
                    <FixControl label={'Зафиксировать курс'} fixed={canFix && _fixed} descr={_descr} canFix={canFix}/>
            }
        </div>
    }
}

function mapStateToProps(state) {
    return {
        fetching: parametersFetchingSelector(state),
        fixedCourseId: fixedCourseIdSelector(state),
        descr: fixedObjDescrSelector(state),
    }
}

export default connect(mapStateToProps)(Wrapper);
