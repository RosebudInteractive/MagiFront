import React, {useEffect, useState} from 'react';
import '../../components/common/modal-editor.sass'
import '../../components/transcript-editor/transcript-editor.sass'
import PropTypes from "prop-types";
import PlayerBlockWrapper from "../../../common/player-block";
import TextBlockWrapper from "../../../common/text-block";
import {bindActionCreators} from "redux";
import {connect} from 'react-redux';
import {
    loadTranscript,
    loadingSelector,
    hasErrorSelector,
    refsSelector,
    textSelector,
    lessonSelector, assetsSelector, paragraphsSelector, timeStampsSelector, episodesTimesSelector
} from "adm-ducks/transcript"
import LoadingPage from "../../components/common/loading-page";
import SplitterLayout from 'react-splitter-layout';
import 'react-splitter-layout/lib/index.css';
import PlayerController from "../../components/transcript-editor/player-controller";
import {attachPlayerController, detachPlayerController} from "../../tools/player-notifier";
import SwitchButtons from "../../components/transcript-editor/switch-buttons";
import {get as getCourse} from "../../actions/course/courseActions";
import {get as getLesson} from "../../actions/lesson/lesson-actions";

let ratio = 1.78,
    _calcGuard = false

function TranscriptEditor(props) {
    const {loading, lesson, playInfo, paragraphs} = props

    const playerController = new PlayerController()

    useEffect(() => {
        const _requestData = {
            courseUrl: props.courseUrl,
            lessonUrl: props.lessonUrl,
            requestAssets: true,
            courseId: props.courseId,
            lessonId: props.lessonId
        }

        props.actions.getCourse(props.courseId)
            .then(props.actions.getLesson(props.lessonId, props.courseId))
            .then(props.actions.loadTranscript(_requestData))

        $(window).bind("resize", _onResize)
        $('body').addClass("_without-panels")

        return () => {
            playerController.requestStop()
            detachPlayerController()
            $(window).unbind("resize", _onResize)
            $('body').removeClass("_without-panels")
        }
    }, [])

    useEffect(() => {
        playerController.setLesson(lesson)
        playerController.setPlayInfo(playInfo)

        attachPlayerController(playerController)
    }, [loading])

    const doResize = () => {
        _calcGuard = false
        $(window).trigger('resize');
    }

    const _doResizeWithoutCalc = () => {
        _calcGuard = true
        $(window).trigger('resize');
    }

    const _onResize = () => {
        if (!_calcGuard) calcTranscriptSize()
    }

    const calcTranscriptSize = () => {
        const _panel = $(".left-panel"),
            _width = _panel.width(),
            _height = _panel.height()

        const _transcriptHeight = _height - (_width / ratio)
        let _transcript = $(".vertical-block .layout-pane:not(.pane-primary)")
        if (_transcript && _transcript.length) {
            _transcript.height(_transcriptHeight)
        }
    }

    const changeRatio = () => {
        const _player = $(".player-block_wrapper"),
            _width = _player.width(),
            _height = _player.height()

        ratio = _width / _height
    }

    return loading ?
        <LoadingPage/>
        :
        !props.hasError && <div className="editor transcript-editor">
            <SplitterLayout primaryIndex={0} percentage secondaryInitialSize={35} onSecondaryPaneSizeChange={doResize}>
                <div className="left-panel">
                    <SplitterLayout vertical
                                    secondaryInitialSize={300}
                                    onDragEnd={changeRatio}
                                    onSecondaryPaneSizeChange={_doResizeWithoutCalc}
                                    customClassName={"vertical-block"}>
                    <div className="player-block_wrapper">
                        <PlayerBlockWrapper lesson={lesson}
                                            playerController={playerController}
                                            />
                    </div>
                    <div className="transcript-block_wrapper">
                        <TextBlockWrapper refs={props.refs}
                                          text={props.text}
                                          lesson={props.lessonOld}
                                          timeStamps={props.timeStamps}
                                          lessonPlayInfo={props.playInfo}
                                          episodesTimes={props.episodesTimes}
                                          showAssets={true}
                        />
                    </div>
                    </SplitterLayout>
                    <SwitchButtons playerController={playerController} lesson={lesson} paragraphs={paragraphs}/>
                </div>
                <div className="right-panel">
                    Right pane
                </div>
            </SplitterLayout>
        </div>

}

const mapStateToProps = (state, ownProps) => {
    return {
        courseId: Number(ownProps.match.params.courseId),
        lessonId: Number(ownProps.match.params.lessonId),
        loading: loadingSelector(state) || state.singleCourse.fetching || state.singleLesson.fetching,
        hasError: hasErrorSelector(state),
        refs: refsSelector(state),
        text: textSelector(state),
        course: state.singleCourse.current,
        lessonOld: state.singleLesson.current,
        lesson: lessonSelector(state),
        playInfo: assetsSelector(state),
        paragraphs: paragraphsSelector(state),
        timeStamps: timeStampsSelector(state),
        episodesTimes: episodesTimesSelector(state),
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        actions: bindActionCreators({getCourse, getLesson, loadTranscript,}, dispatch)
    }
}

TranscriptEditor.propTypes = {
    courseUrl: PropTypes.string,
    lessonUrl: PropTypes.string,
    lessonId: PropTypes.number,
}

export default connect(mapStateToProps, mapDispatchToProps)(TranscriptEditor)