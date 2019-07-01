import React from "react";
import PropTypes from "prop-types";
import {getCoverPath, ImageSize} from "../../tools/page-tools";
import {Link} from "react-router-dom";
import {getCrownForCourse} from "../../tools/svg-paths";
import PriceBlock from "../common/price-block";
import {notifyCourseLinkClicked} from "ducks/google-analytics";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";

class Course extends React.Component {

    static propTypes = {
        course: PropTypes.object,
    };

    constructor(props) {
        super(props)

        this._onLinkClickHandler = () => {
            const {course} = this.props

            this.props.notifyCourseLinkClicked({
                Id: course.Id,
                Name: course.Name,
                author: course.author,
                category: course.CategoriesObj[0].Name,
                price: course.IsPaid ? (course.DPrice ? course.DPrice : course.Price) : 0
            })
        }
    }

    componentDidMount() {
        const {course} = this.props,
            _selector = `#img-course-link${course.Id}` + ", " +
                `#btn-course-link${course.Id}` + ", " +
                `#title-course-link${course.Id}`

        $(_selector).bind("click", this._onLinkClickHandler)
    }

    componentWillUnmount() {
        const {course} = this.props,
            _selector = `#img-course-link${course.Id}` + ", " +
                `#btn-course-link${course.Id}` + ", " +
                `#title-course-link${course.Id}`

        $(_selector).unbind("click", this._onLinkClickHandler)
    }

    render() {
        let {course} = this.props,
            _cover = getCoverPath(course, ImageSize.medium)
        const _image = '<image preserveAspectRatio="xMidYMid slice" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="/data/' + _cover + '" width="574" height="503"/>';
        const _needShowPriceButton = course && course.IsPaid && !course.IsGift && !course.IsBought

        return (
            <div className="course-announce">
                <div className="course-announce__col">
                    <Link to={'/category/' + course.URL} className={'course-announce__image ' + course.Mask} id={`img-course-link${course.Id}`}>
                        <svg viewBox="0 0 574 503" width="574" height="503" dangerouslySetInnerHTML={{__html: _image}}/>
                    </Link>
                </div>
                <div className="course-announce__col">
                    <h3 className="course-announce__title">
                        <Link to={'/category/' + course.URL} id={`title-course-link${course.Id}`}>
                            <span className="course-announce__label">
                                {getCrownForCourse(course)}
                                {"Курс: "}
                            </span>
                            <span
                                className="course-announce__caption">{course.Name}
                            </span>
                        </Link>
                    </h3>
                    <div className="course-announce__row">
                        <div className="course-announce__progress">
                            <span className="course-announce__progress-label">Вышло</span>
                            <span className="course-announce__progress-actual">{course.Ready}</span>
                            <span className="course-announce__progress-total">{'/' + course.Total}</span>
                        </div>
                        {
                            _needShowPriceButton ?
                                <PriceBlock course={course}/>
                                :
                                <Link to={'/category/' + course.URL} className="btn btn--gray course-announce__btn" id={`btn-course-link${course.Id}`}>
                                    Подробнее о курсе
                                </Link>
                        }
                    </div>
                </div>
            </div>
        )
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({notifyCourseLinkClicked}, dispatch)
}

export default connect(null, mapDispatchToProps)(Course)