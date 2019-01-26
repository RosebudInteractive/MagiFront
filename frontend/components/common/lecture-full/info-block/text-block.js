import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import FavoritesButton from "./favorites-button";

export default class TextBlock extends React.Component {

    static propTypes = {
        lessonUrl: PropTypes.string,
        courseUrl: PropTypes.string,
        title: PropTypes.string,
        descr: PropTypes.string,
        authorName: PropTypes.string,
        needShowAuthors: PropTypes.bool,
    };

    render() {
        let {title, descr, authorName, lessonUrl, courseUrl, needShowAuthors,} = this.props,
            _linkUrl = '/' + courseUrl + '/' + lessonUrl;

        let _title = title.match(/[-.?!)(,:]$/g) ? title : (title + '.');

        return (
            <div className="lecture-full__text-block">
                <FavoritesButton className={"lecture-full__fav"} courseUrl={courseUrl} lessonUrl={lessonUrl}/>
                <h3 className="lecture-full__title"><Link to={_linkUrl}>{_title}</Link></h3>
                <p className="lecture-full__descr">
                    {' ' + descr + ' '}
                    {needShowAuthors ? <p className="lecture-full__author">{authorName}</p> : null}
                </p>
            </div>
        )
    }
}