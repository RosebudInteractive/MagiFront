import {LessonEditor} from './lesson-editor';
import { connect } from 'react-redux';
import * as singleLessonActions from "../actions/lesson/lesson-actions";
import * as lessonMainEpisodesActions from '../actions/lesson/lessonMainEpisodesActions'
import * as lessonCommonRefsActions from '../actions/lesson/lessonCommonRefsActions'
import * as lessonRecommendedRefsActions from '../actions/lesson/lessonRecommendedRefsActions'

import * as singleCourseActions from "../actions/course/courseActions";
import * as referenceActions from '../actions/references-actions';
import * as resourcesActions from '../actions/resources-actions';
import * as subLessonsActions from '../actions/subLessonsActions';
import * as lessonResourcesActions from '../actions/lesson/lesson-resources-actions';
import * as parentLessonActions from '../actions/lesson/parent-lesson-actions';

import {labelWidth,} from './object-editor';

import {bindActionCreators} from 'redux';
import {disableButtons, enableButtons} from "adm-ducks/app";
import {getParameters, setFixedLesson} from "adm-ducks/params";

class SubLessonEditor extends LessonEditor{
    _getEditRout() {
        return '/sub-lessons/edit/';
    }

    _getInsertRout() {
        return '/sub-lessons/new';
    }

    get objectIdPropName() {
        return 'subLessonId'
    }

    get parentId() {
        return this.props.lessonId
    }

    componentDidMount() {
        super.componentDidMount()

        if (!this.props.parentLesson.id) {
            this.props.parentLessonActions.loadParentLessonInfo(this.props.lessonId, this.props.courseId)
        }
    }

    _getAdditionalTab(){
        return ''
    }

    _getInitStateOfNewObject(props) {
        return {
            CourseId: props.courseId,
            CourseName: props.course.Name,
            Number: props.course.Lessons.length + 1,
            LessonType: 'L',
            CurrParentName: props.parentLesson.name,
            CurrParentId: props.parentLesson.id,
        }
    }

    _clearObjectInStorage() {
        // this.props.parentLessonActions.clear();
    }

    componentWillUnmount() {
        this.props.parentLessonActions.clear();
    }

    _getExtElements() {
        let _result = super._getExtElements();
        _result.splice(1, 0, {
            view: "text",
            id: 'current-parent-name',
            name: "CurrParentName",
            label: "Основная лекция",
            readonly: true,
            labelWidth: labelWidth,
            disabled: true
        });

        return _result;
    }
}

function mapStateToProps(state, ownProps) {
    return {
        authors: state.courseAuthorsList.authors,
        lesson: state.singleLesson.current,
        ogImageResourceId: state.singleLesson.ogImageResourceId,
        twitterImageResourceId: state.singleLesson.twitterImageResourceId,
        ogImageId: state.singleLesson.ogImageId,
        twitterImageId: state.singleLesson.twitterImageId,
        hasOgImage: state.singleLesson.hasOgImage,
        hasTwitterImage: state.singleLesson.hasTwitterImage,

        mainEpisodes: state.lessonMainEpisodes.current,
        recommendedRef: state.lessonRecommendedRefs.current,
        commonRef: state.lessonCommonRefs.current,
        subLessons: state.subLessons.current,
        resources: state.lessonResources.current,
        parentLesson: state.parentLesson,

        selectedMainEpisode: state.lessonMainEpisodes.selected,
        selectedCommonRef: state.lessonCommonRefs.selected,
        selectedRecommendedRef: state.lessonRecommendedRefs.selected,
        selectedSubLesson: state.subLessons.selected,
        selectedResource: state.lessonResources.selected,

        showReferenceEditor: state.references.showEditor,
        reference: state.references.reference,
        referenceEditMode: state.references.editMode,
        course: state.singleCourse.current,

        showSnImageSelectDialogEditor: state.resources.showSnImageSelectDialogEditor,
        showResourceEditor: state.resources.showEditor,
        showMultiUploadResourcesEditor: state.resources.showMultiUploadEditor,
        resource: state.resources.object,
        resourceEditMode: state.resources.editMode,

        hasChanges: state.singleLesson.hasChanges ||
        state.subLessons.hasChanges ||
        state.lessonResources.hasChanges ||
        state.lessonMainEpisodes.hasChanges ||
        state.lessonCommonRefs.hasChanges ||
        state.lessonRecommendedRefs.hasChanges,

        hasError: state.commonDlg.hasError,
        message: state.commonDlg.message,
        errorDlgShown: state.commonDlg.errorDlgShown,

        lessonId: Number(ownProps.match.params.id),
        courseId: Number(ownProps.match.params.courseId),
        subLessonId: Number(ownProps.match.params.subLessonId),
        fetching: state.courseAuthors.fetching || state.singleLesson.fetching || state.singleCourse.fetching,

        ownProps: ownProps,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        lessonActions: bindActionCreators(singleLessonActions, dispatch),
        lessonMainEpisodesActions: bindActionCreators(lessonMainEpisodesActions, dispatch),
        lessonCommonRefsActions: bindActionCreators(lessonCommonRefsActions, dispatch),
        lessonRecommendedRefsActions: bindActionCreators(lessonRecommendedRefsActions, dispatch),
        singleCourseActions: bindActionCreators(singleCourseActions, dispatch),
        referenceActions: bindActionCreators(referenceActions, dispatch),
        subLessonsActions: bindActionCreators(subLessonsActions, dispatch),
        lessonResourcesActions: bindActionCreators(lessonResourcesActions, dispatch),
        resourcesActions: bindActionCreators(resourcesActions, dispatch),
        parentLessonActions: bindActionCreators(parentLessonActions, dispatch),
        disableButtons: bindActionCreators(disableButtons, dispatch),
        enableButtons: bindActionCreators(enableButtons, dispatch),
        getParameters: bindActionCreators(getParameters, dispatch),
        setFixedLesson: bindActionCreators(setFixedLesson, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SubLessonEditor);
