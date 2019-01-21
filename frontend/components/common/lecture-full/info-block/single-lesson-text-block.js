import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import FavoritesButton from "./favorites-button";

export default class SingleLessonTextBlock extends React.Component {

    static propTypes = {
        courseUrl: PropTypes.string,
        lesson: PropTypes.object,
    };

    render() {
        let {lesson, courseUrl, } = this.props,
            _linkUrl = '/' + courseUrl + '/' + lesson.URL,
            _title = lesson.Name.match(/[-.?!)(,:]$/g) ? lesson.Name : (lesson.Name + '.'),
            _authorName = lesson.author.FirstName + ' ' + lesson.author.LastName,
            _authorUrl = '/autor/' + lesson.author.URL,
            _category = lesson.category.Name;

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
                    <span className="lecture-full_stats">
                        <span className="cathegory">{_category}</span> /<span className="author"><Link to={_authorUrl}>{_authorName}</Link></span>
                    </span>
                </p>
            </div>
        )
    }
}