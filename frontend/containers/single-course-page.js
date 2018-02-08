import React from 'react';
import Cover from '../components/course-extended/cover-extended';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import * as coursesActions from '../actions/courses-page-actions';

// import * as svg from '../../tools/svg-paths';

class Main extends React.Component {
    constructor(props) {
        super(props);
        // this.props.coursesActions.getCourses();
        console.log('Main')
    }


    render() {
        return (
            <main className="courses" style="padding-top: 64px;">
                <CourseModuleExt/>
            </main>
        )
    }
}

class CourseModuleExt extends React.Component {
    render () {
        return (
            <div className="course-module course-module--extended">
                <TitleWrapper title={'Довоенная советская литература'}/>
                <Inner/>
            </div>
        )
    }
}

class TitleWrapper extends React.Component {
    render() {
        return (
            <div className="course-module__title-wrapper">
                <h1 className="course-module__title"><p className="course-module__label">Курс:</p>{' ' + this.props.title}</h1>
            </div>
        )
    }
}

class Inner extends React.Component {
    render() {
        return (
            <div className="course-module__inner">
                <Cover/>
            </div>
        )
    }
}

function mapStateToProps(state, ownProps) {
    return {
        courseUrl: ownProps.match.params.url,
        // fetching: state.authorsList.fetching,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        coursesActions: bindActionCreators(coursesActions, dispatch),
        // courseAuthorsActions: bindActionCreators(courseAuthorsActions, dispatch),
        // courseCategoriesActions: bindActionCreators(courseCategoriesActions, dispatch),
        // courseLessonsActions: bindActionCreators(courseLessonsActions, dispatch),
        //
        // authorsActions: bindActionCreators(authorsActions, dispatch),
        // categoriesActions: bindActionCreators(categoriesActions, dispatch),
        // languagesActions: bindActionCreators(languagesActions, dispatch),
        // coursesActions: bindActionCreators(coursesActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Main);