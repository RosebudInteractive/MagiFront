import React from 'react';

import {get as getCourse, getCourseAuthors} from "../actions/course/courseActions";
import {create as createLesson, get as getLesson} from "../actions/lesson/lesson-actions";
import {getParameters,} from "adm-ducks/params";

import LoadingPage from "../components/books/editor";
import ErrorDialog from '../components/dialog/error-dialog'
import EditorForm from '../components/lesson-editor/editor-form'

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
// import {
//     LessonEpisodes,
//     LessonReferences,
//     LessonSubLessons,
//     LessonResources
// } from '../components/lessonGrids';
// import ReferenceForm from '../components/reference-form';
// import {EDIT_MODE_INSERT, EDIT_MODE_EDIT} from '../constants/Common'

// import {Tabs, TabLink, TabContent} from 'react-tabs-redux';
// import ObjectEditor, {labelWidth,} from './object-editor';
// import ResourceForm from "../components/resource-form";
// import MultiResourceForm from "../components/multi-resource-form";
// import SnImageSelectForm from "../components/lesson-sn-image-form";
// import $ from 'jquery';
// import {checkExtLinks, getExtLinks} from "../tools/link-tools";
// import * as appActions from "../actions/app-actions";
// import {disableButtons, enableButtons,} from "adm-ducks/app";


// import {Prompt} from "react-router-dom";
// import FixControl from "../components/lesson-editor/fix-lesson-wrapper";
// import {getFormValues, isDirty, isValid, reset} from "redux-form";
// import {closeEditor, insertBook, updateBook} from "adm-ducks/books";
// import {showErrorDialog} from "../actions/app-actions";



export class LessonEditor extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            editMode: this.props.lessonId > 0,
        }
    }

    componentDidMount() {
        const {courseId, course, lessonId} = this.props;

        let _needLoadCourse = (!course) || (course.id !== courseId)

        if (_needLoadCourse) {
            this.props.getCourse(courseId);
        }

        this.props.getCourseAuthors(courseId)
        this.props.getParameters()

        if (this.state.editMode) {
            this.props.getLesson(lessonId, courseId)
        } else {
            this.props.courseActions.create()
        }
    }

    componentDidUpdate(prevProps, prevState) {
        let _needRefreshAfterSave = prevProps.savingLesson && !this.props.savingLesson && !this.props.lessonError,
            _needSwitchToEditMode = !prevState.editMode && _needRefreshAfterSave

        if (_needSwitchToEditMode) {
            let _newRout = `/adm/courses/edit/${this.props.courseId}/lessons/edit/${this.props.lesson.id}`;
            this.props.history.push(_newRout);
            this.setState({editMode: true})
        }

        if (_needRefreshAfterSave) {
            this.props.getLesson(this.props.lesson.id, this.props.courseId)
        }
    }

    render() {
        let {fetching,} = this.props

        return fetching ?
            <LoadingPage/>
            :
            <div className="editor lesson_editor">
                <EditorForm editMode={this.state.editMode}/>
                <ErrorDialog/>
            </div>
    }

    // componentDidMount() {
    //     super.componentDidMount();
    //
    //     this.props.getParameters()
    //
    //     let _editor = $('.webix_view .webix_layout_line');
    //
    //     _editor.on('paste', (e) => {
    //         // Prevent the default pasting event and stop bubbling
    //         e.preventDefault();
    //         e.stopPropagation();
    //
    //         // Get the clipboard data
    //         let paste = (e.clipboardData || window.clipboardData).getData('text');
    //
    //         // Do something with paste like remove non-UTF-8 characters
    //         paste = paste.replace(/[^\x20-\xFF]/gi, '');
    //
    //         // Find the cursor location or highlighted area
    //         const selection = window.getSelection();
    //
    //         // Cancel the paste operation if the cursor or highlighted area isn't found
    //         if (!selection.rangeCount) return false;
    //
    //         // Paste the modified clipboard content where it was intended to go
    //         selection.getRangeAt(0).insertNode(document.createTextNode(paste));
    //     });
    //
    //     let _description = window.$$('descrition');
    //
    //     if (_description) {
    //         _description.$view.addEventListener("onPaste", function (text) {
    //             window.webix.message("Custom paste behavior: " + text);
    //         });
    //     }
    // }

    // componentWillReceiveProps(next) {
    //     const {
    //         lesson,
    //         course,
    //     } = next;
    //
    //     if (this.editMode === EDIT_MODE_INSERT) {
    //         if ((course) && (!lesson)) {
    //             this.objectActions.create(this._getInitStateOfNewObject(next));
    //         }
    //     }
    //
    //     this.cover = lesson ? lesson.Cover : null;
    //     this.coverMeta = lesson ? lesson.CoverMeta : null;
    // }

    // componentDidUpdate(prevProps) {
    //     super.componentDidUpdate(prevProps)
    //
    //     if (prevProps.ogImageResourceId && !this.props.ogImageResourceId) {
    //         if (window.$$('og-image-file')) {
    //             window.$$('og-image-file').setValue('');
    //         }
    //     }
    //
    //     if (prevProps.twitterImageResourceId && !this.props.twitterImageResourceId) {
    //         if (window.$$('twitter-image-file')) {
    //             window.$$('twitter-image-file').setValue('');
    //         }
    //     }
    //
    //     if (this.props.ogImageResourceId) {
    //         let _resource = this.props.resources.find((item) => {
    //             return item.Id === this.props.ogImageResourceId
    //         })
    //
    //         if (_resource) {
    //             window.$$('og-image-file').setValue(_resource.Name);
    //         } else {
    //             if (!this.props.resourcesFetching) {
    //                 this.props.lessonActions.setOgImage(null)
    //             }
    //         }
    //     }
    //
    //     if (this.props.twitterImageResourceId) {
    //         let _resource = this.props.resources.find((item) => {
    //             return item.Id === this.props.twitterImageResourceId
    //         })
    //
    //         if (_resource) {
    //             window.$$('twitter-image-file').setValue(_resource.Name);
    //         } else {
    //             if (!this.props.resourcesFetching) {
    //                 this.props.lessonActions.setTwitterImage(null)
    //             }
    //         }
    //     }
    // }
}

function mapStateToProps(state, ownProps) {
    return {
        lessonId: Number(ownProps.match.params.id),
        courseId: Number(ownProps.match.params.courseId),
        subLessonId: Number(ownProps.match.params.subLessonId),

        savingLesson: state.singleLesson.saving,
        lessonError: state.singleLesson.error,

        fetching: state.courseAuthors.fetching || state.singleLesson.fetching || state.singleCourse.fetching,

        // authors: state.courseAuthorsList.authors,
        // lesson: state.singleLesson.current,
        // ogImageResourceId: state.singleLesson.ogImageResourceId,
        // twitterImageResourceId: state.singleLesson.twitterImageResourceId,
        // ogImageId: state.singleLesson.ogImageId,
        // twitterImageId: state.singleLesson.twitterImageId,
        // hasOgImage: state.singleLesson.hasOgImage,
        // hasTwitterImage: state.singleLesson.hasTwitterImage,
        //
        // mainEpisodes: state.lessonMainEpisodes.current,
        // recommendedRef: state.lessonRecommendedRefs.current,
        // commonRef: state.lessonCommonRefs.current,
        // subLessons: state.subLessons.current,
        // resources: state.lessonResources.current,
        // resourcesLoaded: state.lessonResources.loaded,
        // resourcesFetching: state.lessonResources.fetching,
        // // parentLesson: state.parentLesson,
        //
        // selectedMainEpisode: state.lessonMainEpisodes.selected,
        // selectedCommonRef: state.lessonCommonRefs.selected,
        // selectedRecommendedRef: state.lessonRecommendedRefs.selected,
        // selectedSubLesson: state.subLessons.selected,
        // selectedResource: state.lessonResources.selected,
        //
        // showReferenceEditor: state.references.showEditor,
        // reference: state.references.reference,
        // referenceEditMode: state.references.editMode,
        // course: state.singleCourse.current,
        //
        // showSnImageSelectDialogEditor: state.resources.showSnImageSelectDialogEditor,
        // showResourceEditor: state.resources.showEditor,
        // showMultiUploadResourcesEditor: state.resources.showMultiUploadEditor,
        // resource: state.resources.object,
        // resourceEditMode: state.resources.editMode,
        //
        // hasChanges: state.singleLesson.hasChanges ||
        //     state.subLessons.hasChanges ||
        //     state.lessonResources.hasChanges ||
        //     state.lessonMainEpisodes.hasChanges ||
        //     state.lessonCommonRefs.hasChanges ||
        //     state.lessonRecommendedRefs.hasChanges ||
        //     isDirty('FixingBlock')(state),
        //
        //

        //
        // fixFormValues: getFormValues('FixingBlock')(state),
        // fixFormValid: isValid('FixingBlock')(state),

        ownProps: ownProps,
    }
}

// function mapDispatchToProps(dispatch) {
//     return {
//         appActions: bindActionCreators(appActions, dispatch),
//         lessonActions: bindActionCreators(singleLessonActions, dispatch),
//         lessonMainEpisodesActions: bindActionCreators(lessonMainEpisodesActions, dispatch),
//         lessonCommonRefsActions: bindActionCreators(lessonCommonRefsActions, dispatch),
//         lessonRecommendedRefsActions: bindActionCreators(lessonRecommendedRefsActions, dispatch),
//         singleCourseActions: bindActionCreators(singleCourseActions, dispatch),
//         referenceActions: bindActionCreators(referenceActions, dispatch),
//         subLessonsActions: bindActionCreators(subLessonsActions, dispatch),
//         lessonResourcesActions: bindActionCreators(lessonResourcesActions, dispatch),
//         resourcesActions: bindActionCreators(resourcesActions, dispatch),
//         parentLessonActions: bindActionCreators(parentLessonActions, dispatch),
//         disableButtons: bindActionCreators(disableButtons, dispatch),
//         enableButtons: bindActionCreators(enableButtons, dispatch),
//         getParameters: bindActionCreators(getParameters, dispatch),
//         setFixedLesson: bindActionCreators(setFixedLesson, dispatch),
//         resetReduxForm: bindActionCreators(reset, dispatch),
//     }
// }

function mapDispatchToProps(dispatch) {
    return bindActionCreators({getCourse, getCourseAuthors, createLesson, getLesson, getParameters}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(LessonEditor);