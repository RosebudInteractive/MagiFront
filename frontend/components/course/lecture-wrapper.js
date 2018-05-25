import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import PlayBlock from './play-block'
import {ImageSize, getImagePath} from '../../tools/page-tools'

export default class Wrapper extends React.Component {

    static propTypes = {
        courseUrl: PropTypes.string.isRequired,
        lessons: PropTypes.array.isRequired,
        isMobile: PropTypes.bool.isRequired,
    };

    render() {
        let {lessons, isMobile} = this.props;

        return (
            <div className='lectures-wrapper'>
                {
                    isMobile ?
                        <LecturesList lessons={lessons} courseUrl={this.props.courseUrl}/>
                        :
                        <SingleLecture lesson={lessons[0]} courseUrl={this.props.courseUrl}/>
                }
            </div>
        )
    }
}

class SingleLecture extends React.Component {

    static propTypes = {
        lesson: PropTypes.object.isRequired,
        courseUrl: PropTypes.string.isRequired,
    }

    render() {
        let {lesson} = this.props;
        if (lesson.State === 'D') {
            return null
        }

        let _cover = lesson.CoverMeta ?
            (
                lesson.CoverMeta.icon ?
                    lesson.CoverMeta.icon :
                    (
                        lesson.CoverMeta.content ?
                            lesson.CoverMeta.content :
                            null
                    )

            ) : null;

        _cover = '/data/' + (_cover ? (lesson.CoverMeta.path + _cover) : lesson.Cover);

        return (
            <section className="lecture">
                <PlayBlock cover={_cover} duration={lesson.DurationFmt} lessonUrl={lesson.URL}
                           courseUrl={this.props.courseUrl} audios={lesson.Audios} id={lesson.Id}
                           totalDuration={lesson.Duration} isAuthRequired={lesson.IsAuthRequired}/>
                <div className='lecture__descr'>
                    <Link to={this.props.courseUrl + '/' + lesson.URL}><h3><span
                        className='number'>{lesson.Number + '.'}</span>{' ' + lesson.Name + ' '}</h3></Link>
                    <p>{lesson.ShortDescription}</p>
                </div>
            </section>
        )
    }
}

class LecturesList extends React.Component {

    static propTypes = {
        lessons: PropTypes.array.isRequired,
        courseUrl: PropTypes.string.isRequired,
    }

    render() {
        return this.props.lessons.map((item, index) => {
            return <SingleLecture lesson={item} key={index} courseUrl={this.props.courseUrl}/>
        })
    }
}

Wrapper.propTypes = {
    lessons: PropTypes.array.isRequired,
};