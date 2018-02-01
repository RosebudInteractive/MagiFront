import React  from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as coursesActions from '../actions/courses-page-actions';

import CourseModule from '../components/course/course-module'


class CoursesPage extends React.Component {
    constructor(props) {
        super(props);
        this.props.coursesActions.getCourses();
    }

    componentDidUpdate() {
        // let _newObjectId = this.props[this.objectName] ? this.props[this.objectName].id : null;
        // let _isNeedSwitchMode = (this.editMode === EDIT_MODE_INSERT) && (!!+_newObjectId);
        //
        // if (_isNeedSwitchMode) {
        //     this._switchToEditObject(_newObjectId)
        // }
    }

    componentWillUnmount() {
        // this._clearObjectInStorage()
    }

    _getCoursesBundles() {
        return this.props.courses.map((course, index) => {
            return <CourseModule index={index} key={index}/>
        })
    }

    render() {
        const {
            fetching,
            // message,
            // errorDlgShown,
            // hasChanges
        } = this.props;
        return (
            <div>
                {
                    fetching ?
                        <p>Загрузка...</p>
                        :
                        <main className="courses">
                             {/*<Prompt when={hasChanges} message='Есть несохраненные данные. Перейти без сохранения?'/>*/}
                             {this._getCoursesBundles()}
                         </main>
                }

            </div>
        )
    }
}


function mapStateToProps(state) {
    return {
        fetching: state.courses.fetching,
        courses: state.courses.items,

        // selected: state.courses.selected,
        // editDlgShown: state.courses.editDlgShown,
        // editMode: state.courses.editMode,
        //
        // hasError: state.commonDlg.hasError,
        // message: state.commonDlg.message,
        // deleteDlgShown: state.commonDlg.deleteDlgShown,
        // errorDlgShown: state.commonDlg.errorDlgShown,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        coursesActions: bindActionCreators(coursesActions, dispatch),
        // commonDlgActions: bindActionCreators(commonDlgActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CoursesPage);
