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

    _getCoursesBundles() {
        let {filters} = this.props;

        let _cleanFilter = filters.every((filter) => {
            return !filter.selected;
        });

        return this.props.courses.map((course, index) => {
            let _inFilter = false;

            if (_cleanFilter) {
                _inFilter = true
            } else {
                _inFilter = course.Categories.some((categoryId) => {
                    let _filter = filters.find((item) => {
                        return item.id === categoryId
                    });

                    return _filter ? _filter.selected : false;
                });
            }

            return (_inFilter ? <CourseModule index={index} key={index}/> : null)
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
        filters: state.filters.items,

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
