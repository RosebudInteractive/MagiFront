import React from "react";
import PropTypes from "prop-types";
import ContentBlock from "./content-block";
import "../styles/fonts.sass"
import "../styles/system.sass"
import AssetBlock from "./asset-viewer";

export default function TextBlockWrapper(props) {

    let {course, lesson, isPaidCourse, courseUrl, lessonUrl, showAssets} = props,
        _singleLesson = course && course.OneLesson

    let _transcriptClassName = "transcript-page _nested" + (_singleLesson ? ' _single' : '')

    return <div className={_transcriptClassName} id="transcript">
        <section className={"text-block js-text-block-start" + (showAssets ? " _with-assets" : " _only-text")}>
            <p className="text-block__label font-universal__title-medium _main-dark">Транскрипт</p>
            <div className="content-block">
                <ContentBlock course={course} lesson={lesson} courseUrl={courseUrl} lessonUrl={lessonUrl}
                              isPaidCourse={isPaidCourse}
                              refs={props.refs} text={props.text}/>
                <div className="right-block white-block">
                    <div className="fixed-container js-play _fixed">
                        {
                            showAssets &&
                            <AssetBlock episodesTimes={props.episodesTimes} lessonPlayInfo={props.lessonPlayInfo}
                                        timeStamps={props.timeStamps}/>
                        }
                    </div>
                </div>
            </div>
        </section>
    </div>
}

TextBlockWrapper.propTypes = {
    course: PropTypes.object,
    lesson: PropTypes.object,
    isPaidCourse: PropTypes.bool,
    courseUrl: PropTypes.string,
    lessonUrl: PropTypes.string,
    showAssets: PropTypes.bool,
    refs: PropTypes.array,
    text: PropTypes.string,
    // PlayBlock: PropTypes.elementType,
    // AssetBlock: PropTypes.elementType,
    // SocialBlock: PropTypes.elementType,
    episodesTimes: PropTypes.object,
    timeStamps: PropTypes.array,
    lessonPlayInfo: PropTypes.object
}
