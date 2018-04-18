import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import $ from 'jquery'
import {Redirect} from 'react-router';

import * as svg from '../../tools/svg-paths';

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
                           courseUrl={this.props.courseUrl}/>
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

class PlayBlock extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            redirect: false,
        }
    }

    static propTypes = {
        lessonUrl: PropTypes.string.isRequired,
        courseUrl: PropTypes.string.isRequired
    }

    _play() {
        alert('mega play')
        let _audio = $('#myAudio')[0];
        _audio.src = '/data/2016/09/Listov_Pushkin_02_Biography_Stereo_128Kbps_Feb_02_2016.mp3';
        _audio.play()
            .then(() => {
                _audio.pause();
                this.setState({redirect: true});
            });
    }

    render() {
        const _play = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#play"/>';

        if (this.state.redirect) {
            this.setState({redirect: false})
            return <Redirect push to={'/' + this.props.courseUrl + '/' + this.props.lessonUrl + '?play'}/>;
        }

        return (
            <div className='lecture__play-block'>

                <div className="lecture__image-wrapper">
                    <img src={this.props.cover} width="126" height="126" alt=""/>
                </div>
                <div className="lecture__loader" id="cont" data-pct="100">
                    <svg className="svg-loader" id="svg" width="200" height="200" viewBox="0 0 200 200" version="1.1"
                         xmlns="http://www.w3.org/2000/svg">
                        <circle r="98.25" cx="100" cy="100" fill="transparent" strokeDasharray="620"
                                strokeDashoffset="0"/>
                        <circle className="bar" id="bar" r="98.25" cx="100" cy="100" fill="transparent"
                                strokeDasharray="383.274" strokeDashoffset="157.142"/>
                    </svg>
                </div>
                <input className="loader-field" id="percent" name="percent" value="75" readOnly={true}/>
                <button type="button" className="lecture__btn" onClick={::this._play}>
                    <svg width="41" height="36" dangerouslySetInnerHTML={{__html: _play}}/>
                </button>
                <div className="lecture__tooltip">Смотреть</div>
                <div className='duration'>{this.props.duration}</div>
            </div>
        )
    }
}

//Link to={'/' + this.props.courseUrl + '/' + this.props.lessonUrl + '?play'}

Wrapper.propTypes = {
    lessons: PropTypes.array.isRequired,
};