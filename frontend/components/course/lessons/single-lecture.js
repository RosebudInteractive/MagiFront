import React from "react";
import PropTypes from "prop-types";
import {Link} from 'react-router-dom';
import PlayBlock from '../play-block'

export default class SingleLecture extends React.Component {

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
                    <Link to={'/' + this.props.courseUrl + '/' + lesson.URL}>
                        <h3>
                            <span className='number'>{lesson.Number + '. '}</span>
                            <span className='title'>{lesson.Name + ' '}</span>
                        </h3>
                    </Link>
                    <p>{lesson.ShortDescription}</p>
                </div>
            </section>
        )
    }
}