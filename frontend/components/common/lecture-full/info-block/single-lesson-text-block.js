import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import FavoritesButton from "./favorites-button";

export default class SingleLessonTextBlock extends React.Component {

    static propTypes = {
        courseUrl: PropTypes.string,
        lesson: PropTypes.object,
        needShowAuthors: PropTypes.bool,
    };

    render() {
        let {lesson, courseUrl, needShowAuthors} = this.props,
            _linkUrl = '/' + courseUrl + '/' + lesson.URL,
            _title = lesson.Name.match(/[-.?!)(,:]$/g) ? lesson.Name : (lesson.Name + '.'),

            _authorName = needShowAuthors ? (lesson.author.FirstName + ' ' + lesson.author.LastName) : null,
            _authorUrl = needShowAuthors ? ('/autor/' + lesson.author.URL) : null,
            _category = needShowAuthors ? lesson.category.Name : null

        return (
            <div className="lecture-full__text-block">
                <FavoritesButton className={"lecture-full__fav"} courseUrl={courseUrl} lessonUrl={lesson.URL}/>
                <h3 className="lecture-full__title">
                    <span className="label">Лекция:</span>
                    <Link to={_linkUrl}>
                        <span>{_title}</span>
                    </Link>
                </h3>
                <p className="lecture-full__descr">
                    {' ' + lesson.ShortDescription + ' '}
                    {
                        needShowAuthors ?
                            <span className="lecture-full_stats">
                                <span className="cathegory">{_category}</span> /
                                <span className="author">
                                    <Link to={_authorUrl}>{_authorName}</Link>
                                </span>
                            </span>
                            :
                            null

                    }

                </p>
            </div>
        )
    }
}