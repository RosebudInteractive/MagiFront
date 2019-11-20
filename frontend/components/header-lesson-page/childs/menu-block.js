import React from "react";
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import PropTypes from "prop-types";
import {getLessonNumber} from "tools/page-tools";
import {lessonsSelector} from "ducks/lesson-menu";
import {hideLessonMenu, showLessonMenu} from 'actions/app-actions';

import LessonsList from './menu-list'

class MenuBlock extends React.Component {

    static propTypes = {
        course: PropTypes.object,
        lesson: PropTypes.object,
        test: PropTypes.object,
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
        let {lesson, test, lessonList} = this.props,
            _object = lesson ? lesson : test,
            _total = lessonList.length,
            _number = getLessonNumber(_object),
            _title = lesson ? "Лекция " : "Тест "

        return (
            <div className="lectures-menu__section lectures-list-block">
                <button type="button" className="lectures-list-trigger js-lectures-list-trigger"
                        onClick={::this._switchMenu}><span className='caption'>{_title}</span>
                    <span className="num">
                        <span className="current">{test ? `"${test.Name}"` : _number}</span>
                        {test ? "" : ('/' + _total)}
                    </span>
                </button>
                <LessonsList {...this.props}/>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        lessonList: lessonsSelector(state),
        isLessonMenuOpened: state.app.isLessonMenuOpened,
    }
}

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({hideLessonMenu, showLessonMenu}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(MenuBlock)