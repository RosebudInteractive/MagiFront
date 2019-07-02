import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import LessonPlayBlockSmall from '../../common/small-play-block'
import {notifyCourseLinkClicked, notifyLessonLinkClicked} from "ducks/google-analytics";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";

class Item extends React.Component {

    static propTypes = {
        item: PropTypes.object,
        isPaidCourse: PropTypes.bool,
    }

    constructor(props) {
        super(props)
    }

    render() {
        const _ep = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#ep"/>';

        let {item,} = this.props,
            _courseInfo = Object.assign({}, item.courseBillingInfo)

        return (
            <div className="history-item">
                <div className="history-item__date-block">
                    <p className="history-item__date">{item.lastVisitDay}<br/>{item.lastVisitTime}</p>
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
                        <Link to={'/category/' + item.courseUrl} onClick={() => {
                            this.props.notifyCourseLinkClicked(this.props.item.analyticsInfo)
                        }}>
                            <span className="history-item__title-text">
                                <span className="label">{'Курс: '}</span>
                                <span className="history-item__title-text__text">{item.courseName}</span>
                            </span>
                        </Link>
                    </h3>
                    <h4 className="history-item__lecture">
                        <Link to={'/' + item.courseUrl + '/' + item.URL} onClick={() => {
                            this.props.notifyLessonLinkClicked(this.props.item.analyticsInfo)
                        }}>
                            <span className="history-item__lecture__num">{item.Number + '. '}</span>
                            <span className="history-item__lecture__text">{item.Name}</span>
                        </Link>
                    </h4>
                    <Link to={'/autor/' + item.authorUrl}>
                        <p className="history-item__author">{item.authorName}</p>
                    </Link>
                </div>
                <LessonPlayBlockSmall lesson={item} course={_courseInfo} showRestTime={true}/>
            </div>
        )
    }
}

function mapDispatchToProps(dispatch) {
    return {
        notifyCourseLinkClicked: bindActionCreators(notifyCourseLinkClicked, dispatch),
        notifyLessonLinkClicked: bindActionCreators(notifyLessonLinkClicked, dispatch),
    }
}

export default connect(null, mapDispatchToProps)(Item)