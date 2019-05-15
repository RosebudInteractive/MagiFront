import React from "react";
import PropTypes from "prop-types";
import {Link} from 'react-router-dom';
import PlayBlock from '../play-block'
import {getCoverPath, ImageSize} from "../../../tools/page-tools";

export default class SingleLecture extends React.Component {

    static propTypes = {
        lesson: PropTypes.object.isRequired,
        course: PropTypes.object,
        isAdmin: PropTypes.bool,
    }

    render() {
        let {lesson, course, isAdmin} = this.props;
        if (lesson.State === 'D') {
            return null
        }

        // let _cover = lesson.CoverMeta ?
        //     (
        //         lesson.CoverMeta.icon ?
        //             lesson.CoverMeta.icon :
        //             (
        //                 lesson.CoverMeta.content ?
        //                     lesson.CoverMeta.content :
        //                     null
        //             )
        //
        //     ) : null;
        //
        // _cover = '/data/' + (_cover ? (lesson.CoverMeta.path + _cover) : lesson.Cover);
        let _cover = '/data/' + getCoverPath(lesson, ImageSize.icon)

        return (
            <section className="lecture">
                <PlayBlock lesson={lesson} course={course} cover={_cover} isAdmin={isAdmin}/>
                <div className='lecture__descr'>
                    <Link to={'/' + course.URL + '/' + lesson.URL}>
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