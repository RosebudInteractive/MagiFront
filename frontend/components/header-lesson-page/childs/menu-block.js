import React from "react";
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import PropTypes from "prop-types";
import {getLessonNumber} from "tools/page-tools";
import {hideLessonMenu, showLessonMenu} from 'actions/app-actions';

class MenuBlock extends React.Component {

    static propTypes = {
        lesson: PropTypes.object
    };

    componentWillUnmount() {
        this.props.hideLessonMenu()
    }

    _switchMenu() {
        if (this.props.isLessonMenuOpened) {
            this.props.hideLessonMenu()
        } else {
            this.props.showLessonMenu()
        }
    }

    render() {
        let {lesson, lessonList} = this.props,
            _total = lessonList.object.length,
            _number = getLessonNumber(lesson)

        return (
            <div className="lectures-menu__section lectures-list-block">
                <button type="button" className="lectures-list-trigger js-lectures-list-trigger"
                        onClick={::this._switchMenu}><span className='caption'>Лекция </span>
                    <span className="num"><span
                        className="current">{_number}</span>{'/' + _total}</span></button>
                <LessonsListWrapper {...this.props}/>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        course: state.singleLesson.course,
        lessonList: state.lessons,
    }
}

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({hideLessonMenu, showLessonMenu}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(MenuBlock)