import React from 'react'
import PropTypes from 'prop-types';
import FixControl from '../common/fix-course-lesson'
import {fixedLessonIdSelector, fixedObjDescrSelector, parametersFetchingSelector} from "adm-ducks/params";
import connect from "react-redux/es/connect/connect";

class Wrapper extends React.Component {

    static propTypes = {
        lesson: PropTypes.object,
    }

    render() {
        let {lesson, fixedLessonId, descr, fetching,} = this.props,
            _fixed = (lesson && (lesson.id === fixedLessonId)),
            _descr = _fixed ? descr : '';

        return <div className="fix-course-wrapper">
            {
                fetching ?
                    null
                    :
                    <FixControl label={'Зафиксировать лекцию'} fixed={_fixed} descr={_descr}/>
            }
        </div>
    }
}

function mapStateToProps(state) {
    return {
        fetching: parametersFetchingSelector(state),
        fixedLessonId: fixedLessonIdSelector(state),
        descr: fixedObjDescrSelector(state),
    }
}

export default connect(mapStateToProps)(Wrapper);