import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import LessonPlayBlockSmall from '../common/small-play-block'

export default class Item extends React.Component {

    static propTypes = {
        item: PropTypes.object,
        isFavorite: PropTypes.bool,
        isPaidCourse: PropTypes.bool,
    }

    _favoritesClick() {
        if (this.props.onRemoveItem) {
            this.props.onRemoveItem(this.props.item)
        }
    }

    render() {
        const _ep = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#ep"/>',
            _redFlag = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#flag-red"/>',
            _flag = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#flag"/>';

        let {item, isFavorite, isPaidCourse} = this.props;

        return (
            <div className={"bookmarks__lesson-item" + (item.singleLessonInCourse ? ' _single' : '')}>
                <div className="bookmarks__lesson-item__icons-block">
                    <span className={"favorites" + (isFavorite ? " active" : "")} onClick={::this._favoritesClick}>
                        <svg width="14" height="23" dangerouslySetInnerHTML={{__html: isFavorite ?_redFlag : _flag}}/>
                    </span>
                    {
                        item.isSubLesson ?
                            <span className="icons-block__sublesson_icon">
                                <svg width="18" height="18" dangerouslySetInnerHTML={{__html: _ep}}/>
                            </span>
                            :
                            null
                    }
                </div>
                <div className="bookmarks__lesson-item__info-block">
                    <h3 className="history-item__title">
                        <Link to={'/category/' + item.courseUrl}>
                            <span className="history-item__title-text">
                                <span className="label">{'Курс: '}</span>
                                <span className="history-item__title-text__text">{item.courseName}</span>
                            </span>
                        </Link>
                    </h3>
                    <h4 className="history-item__lecture">
                        <Link to={'/' + item.courseUrl + '/' + item.URL}>
                            <span className="history-item__lecture__num">{item.Number + '. '}</span>
                            <span className="history-item__lecture__text">{item.Name}</span>
                        </Link>
                    </h4>
                    <Link to={'/autor/' + item.authorUrl}>
                        <p className="history-item__author">{item.authorName}</p>
                    </Link>
                </div>
                <LessonPlayBlockSmall lesson={item} wrapperClass={'bookmarks__lesson-item__play-block'} isPaidCourse={isPaidCourse}/>
            </div>
        )
    }
}