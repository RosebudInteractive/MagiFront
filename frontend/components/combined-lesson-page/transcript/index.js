import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import TextBlock from './text-block';
import GallerySlides from '../../transcript-page/gallery-slides';
import {loadingSelector, transcriptSelector, assetsSelector, loadTranscript} from "ducks/transcript";
import LoadingFrame from "../../loading-frame";

export class Current {
    static propTypes = {
        courseUrl: PropTypes.string,
        lessonUrl: PropTypes.string,
    }
}

class Transcript extends React.Component {
    static propTypes = {
        course: PropTypes.object,
        lesson: PropTypes.object,

        isPaidCourse: PropTypes.bool,
        isNeedHideGallery: PropTypes.bool,

        current: PropTypes.instanceOf(Current)
    };

    constructor(props) {
        super(props)

        const {course, lesson} = this.props

        this._hideAssets = !course.IsPaid
    }

    componentWillMount(){
        this.props.actions.loadTranscript({
            ...this.props.current,
            requestAssets: !this._needLockLessonAsPaid(),
            lessonId: this.props.lesson.Id
        })
    }


    render() {
        const {loading, isNeedHideGallery, transcript, hasAssets, course, lesson, isPaidCourse, current: {courseUrl, lessonUrl}} = this.props;

        return loading ?
            <LoadingFrame/>
            :
            transcript && <React.Fragment>
                <TextBlock course={course}
                           lesson={lesson}
                           isPaidCourse={isPaidCourse}
                           courseUrl={courseUrl}
                           lessonUrl={lessonUrl}
                           showAssets={true && hasAssets}/>
                {
                    isNeedHideGallery && !window.prerenderEnable
                        ?
                        null
                        :
                        <GallerySlides gallery={transcript.Gallery}/>
                }
            </React.Fragment>
    }

    _needLockLessonAsPaid() {
        const {lesson, isPaidCourse, isAdmin} = this.props

        return isPaidCourse && !(lesson.IsFreeInPaidCourse || isAdmin)
    }
}

const mapState2Props = (state) => {
    return {
        loading: loadingSelector(state),
        transcript: transcriptSelector(state),
        hasAssets: !!assetsSelector(state),
        authorized: !!state.user.user,
        isAdmin: !!state.user.user && state.user.user.isAdmin,
    }
}

const mapDispatch2Props = (dispatch) => {
    return {
        actions: bindActionCreators({loadTranscript}, dispatch)
    }
}

export default connect(mapState2Props, mapDispatch2Props)(Transcript)