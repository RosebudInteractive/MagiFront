import React from "react";
import PropTypes from "prop-types";
import {getCoverPath, ImageSize} from "../../tools/page-tools";
import {Link} from "react-router-dom";
import {notifyCourseLinkClicked} from "ducks/google-analytics";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";

class ImageBlock extends React.Component {

    static propTypes = {
        course: PropTypes.object,
    };

    constructor(props) {
        super(props)

        this._onLinkClickHandler = () => {
            const {course} = this.props

            this.props.notifyCourseLinkClicked({
                ...course,
                author: course.AuthorsObj[0].FirstName + " " + course.AuthorsObj[0].LastName,
                category: course.CategoriesObj[0].Name,
                price: course.IsPaid ? (course.DPrice && course.Discount ? course.DPrice : course.Price) : 0
            })
        }
    }

    componentDidMount() {
        $(`#img-course-link${this.props.course.Id}`).bind("click", this._onLinkClickHandler)
    }

    componentWillUnmount() {
        $(`#img-course-link${this.props.course.Id}`).unbind("click", this._onLinkClickHandler)
    }

    render() {
        const {course} = this.props,
            _cover = getCoverPath(course, ImageSize.medium),
            _mask = course.Mask;

        const _image = '<image preserveAspectRatio="xMidYMid slice" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="/data/' + _cover + '" x="0" width="574" height="503"/>';

        return (
            <Link to={'/category/' + course.URL} id={`img-course-link${this.props.course.Id}`}>
                <div className={'course-module__image-block ' + _mask}>
                    <svg viewBox="0 0 574 503" width="574" height="503" dangerouslySetInnerHTML={{__html: _image}}/>
                </div>
            </Link>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({notifyCourseLinkClicked}, dispatch)
}

export default connect(null, mapDispatchToProps)(ImageBlock)