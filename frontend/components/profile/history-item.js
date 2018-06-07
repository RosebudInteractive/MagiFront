import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';

export default class Item extends React.Component {

    static propTypes = {
        item: PropTypes.object,
    }

    render() {
        const _ep = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#ep"/>',
            _playSmall = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#play-small"/>';

        let {item} = this.props;

        return (
            <div className="history-item">
                <div className="history-item__date-block">
                    <p className="history-item__date">{item.lastVisitDay}<br/>{item.lastVisitTime}</p>
                    {
                        item.isSublesson ?
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
                    <p className="history-item__author">{item.authorName}</p>
                </div>
                <div className="history-item__play-block">
                    <div className="play-block-small">
                        <span className="play-block-small__duration">{item.DurationFmt}</span>
                        <button type="button" className="play-btn-small">
                            <svg width="12" height="11" dangerouslySetInnerHTML={{__html: _playSmall}}/>
                            <span>Воспроизвести</span>
                        </button>
                    </div>
                </div>
            </div>
        )
    }
}