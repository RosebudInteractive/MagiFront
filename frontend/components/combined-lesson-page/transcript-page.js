import React from 'react';
import PropTypes from 'prop-types';
import TextBlock from './transcript/text-block';
import GallerySlides from '../transcript-page/gallery-slides';

export default class TranscriptPage extends React.Component {
    static propTypes = {
        transcriptData: PropTypes.object,
        course: PropTypes.object,
        lesson: PropTypes.object,

        isPaidCourse: PropTypes.bool,
        isNeedHideGallery: PropTypes.bool,

        courseUrl: PropTypes.string,
        lessonUrl: PropTypes.string,
    };

    render() {
        const {isNeedHideGallery, transcriptData, course, lesson, isPaidCourse, courseUrl, lessonUrl} = this.props;

        return <React.Fragment>
            <TextBlock transcriptData={transcriptData}
                       course={course}
                       lesson={lesson}
                       isPaidCourse={isPaidCourse}
                       courseUrl={courseUrl}
                       lessonUrl={lessonUrl}/>
            {
                isNeedHideGallery && !window.prerenderEnable
                    ?
                    null
                    :
                    <GallerySlides gallery={transcriptData.gallery}/>
            }
        </React.Fragment>
    }
}