import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import LessonPlayBlockSmall from './small-play-block'

export default class Item extends React.Component {

    static propTypes = {
        item: PropTypes.object,
    }

    _favoritesClick() {
        if (this.props.onRemoveItem) {
            this.props.onRemoveItem(this.props.item.courseUrl, this.props.item.URL)
        }
    }

    render() {
        const _ep = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#ep"/>',
            _redFlag = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#flag-red"/>';

        let {item} = this.props;

        return (
            <div className="history-item">
                <div className="history-item__date-block">
                    <span className="favorites active" onClick={::this._favoritesClick}>
                        <svg width="14" height="23" dangerouslySetInnerHTML={{__html: _redFlag}}/>
                    </span>
                    {
                        item.isSubLesson ?
                            <span className="history-item__icon">
                                <svg width="18" height="18" dangerouslySetInnerHTML={{__html: _ep}}/>
                            </span>
                            :
                            null
                    }
                </div>
                <div className="history-item__info-block">
                    <h3 className="history-item__title">
                        <Link to={'category/' + item.courseUrl}>
                            <span className="history-item__title-text"><span
                                className="label">Курс:</span>{' ' + item.courseName}</span>
                        </Link>
                    </h3>
                    <h4 className="history-item__lecture">
                        <Link to={item.courseUrl + '/' + item.URL}>
                            <span className="num">{item.Number + '.'}</span>
                            <span className="text">{' ' + item.Name}</span>
                        </Link>
                    </h4>
                    <Link to={'autor/' + item.authorUrl}>
                        <p className="history-item__author">{item.authorName}</p>
                    </Link>
                </div>
                <LessonPlayBlockSmall duration={item.DurationFmt} lessonUrl={item.URL}
                                      courseUrl={item.courseUrl} audios={item.Audios} id={item.Id}
                                      totalDuration={item.Duration}/>
            </div>
        )
    }
}