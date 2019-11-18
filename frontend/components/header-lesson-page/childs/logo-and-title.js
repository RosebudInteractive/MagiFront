import React from "react";
import PropTypes from "prop-types";
import {Link} from "react-router-dom";
import {bindActionCreators} from "redux";
import {notifyCourseLinkClicked} from "ducks/google-analytics";
import {connect} from "react-redux";

class LogoAndTitle extends React.Component {

    static propTypes = {
        course: PropTypes.object,
        lesson: PropTypes.object,
        test: PropTypes.object,
    };

    render() {
        const MOBILE_LOGO = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#logo-mob"/>',
            BACK = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#link-back"/>';

        const {course, lesson,} = this.props,
            _analyticsInfo = {
                Id: course.Id,
                Name: course.Name,
                // category: course.Categories[0].Name,
                author: lesson ? lesson.Author.FirstName + ' ' + lesson.Author.LastName : null,
                price: course.IsPaid ? (course.DPrice ? course.DPrice : course.Price) : 0
            }

        return (
            <div className="lectures-menu__section">
                <Link to={'/'} className="logo-min">
                    <svg width="75" height="40" dangerouslySetInnerHTML={{__html: MOBILE_LOGO}}/>
                </Link>
                <Link to={'/category/' + course.URL} className="lectures-menu__link-back"
                      onClick={() => { this.props.notifyCourseLinkClicked(_analyticsInfo) }}>
                    <div className="icon">
                        <svg width="18" height="18" dangerouslySetInnerHTML={{__html: BACK}}/>
                    </div>
                    <span><span className="label">Курс:</span>{' ' + course.Name}</span>
                </Link>
            </div>
        )
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({notifyCourseLinkClicked}, dispatch)
}

export default connect(null, mapDispatchToProps)(LogoAndTitle)