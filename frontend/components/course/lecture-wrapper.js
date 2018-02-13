import React from 'react';
import PropTypes from 'prop-types';
import * as svg from '../../tools/svg-paths';

export default class Wrapper extends React.Component {
    render() {
        let {lessons, isMobile} = this.props;

        return (
            <div className='lectures-wrapper'>
                {
                    isMobile ?
                        <LecturesList lessons={lessons}/>
                        :
                        <SingleLecture lesson={lessons[0]}/>
                }
            </div>
        )
    }
}

Wrapper.propTypes = {
    lessons: PropTypes.array.isRequired,
    isMobile: PropTypes.bool.isRequired,
};



class SingleLecture extends React.Component {


    render() {
        let {lesson} = this.props;

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

        _cover = '/data/' +  (_cover ? (lesson.CoverMeta.path + _cover) : lesson.Cover);

        return (
            <section className="lecture">
                <PlayBlock cover={_cover} duration={lesson.DurationFmt}/>
                <div className='lecture__descr'>
                    <h3><span className='number'>{lesson.Number + '.'}</span>{' ' + lesson.Name + ' '}</h3>
                    <p>{lesson.ShortDescription}</p>
                </div>
            </section>
        )
    }
}

class LecturesList extends React.Component {

    render() {
        return this.props.lessons.map((item, index) => {
            return <SingleLecture lesson={item} key={index}/>
        })
    }
}

class PlayBlock extends React.Component {

    constructor(props) {
        super(props);
        this.state = { flipped: null };
    }

    _mouseEnter() {
        this.setState({flipped: true});
    }

    _mouseLeave() {
        this.setState({flipped: false});
    }

    render() {
        return (
            <div className='lecture__play-block' onMouseEnter={::this._mouseEnter} onMouseLeave={::this._mouseLeave}>

                    <div className="lecture__image-wrapper">
                        <img src={this.props.cover} width="126" height="126" alt=""/>
                        {/*{this.state.flipped ? <div className={'image-hover'}/> : null}*/}
                    </div>
                    <div className="lecture__loader" id="cont" data-pct="100">
                        <svg className="svg-loader" id="svg" width="200" height="200" viewBox="0 0 200 200" version="1.1" xmlns="http://www.w3.org/2000/svg">
                            <circle r="98.25" cx="100" cy="100" fill="transparent" strokeDasharray="620" strokeDashoffset="0"/>
                            <circle className="bar" id="bar" r="98.25" cx="100" cy="100" fill="transparent" strokeDasharray="383.274" strokeDashoffset="157.142"/>
                        </svg>
                    </div>
                    <input className="loader-field" id="percent" name="percent" value="75"/>
                    <a className="lecture__btn">
                        <svg width="41" height="36">
                            {svg.play}
                        </svg>
                    </a>
                    <div className="lecture__tooltip">Смотреть</div>
                    <div className='duration'>{this.props.duration}</div>
                    <div className="lecture__action">
                        <div className="lecture__action-loader"/>
                        <div className="lecture__action-btn">
                            <svg className="lecture__action-btn" width="14" height="14">
                                {svg.reloadSmall}
                            </svg>
                        </div>
                    <div className="lecture__action-tooltip">С начала</div>
                </div>

            </div>
        )
    }
}

Wrapper.propTypes = {
    lessons: PropTypes.array.isRequired,
};