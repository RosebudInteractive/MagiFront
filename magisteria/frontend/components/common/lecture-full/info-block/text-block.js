import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import FavoritesButton from "./favorites-button";
import {notifyLessonLinkClicked} from "ducks/google-analytics";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";

class TextBlock extends React.Component {

    static propTypes = {
        course: PropTypes.object,
        lesson: PropTypes.object,
        needShowAuthors: PropTypes.bool,
    };

    constructor(props) {
        super(props)

        this._onLessonLinkClickHandler = () => {
            const {lesson, course,} = this.props;

            this.props.notifyLessonLinkClicked({
                Id: course.Id,
                Name: course.Name,
                author: course.Authors[0].FirstName + course.Authors[0].LastName,
                category: course.Categories[0].Name,
                lessonName: lesson.Name,
                price: course.IsPaid ? (course.DPrice ? course.DPrice : course.Price) : 0
            })
        }
    }

    componentDidMount() {
        $(`#lesson-link${this.props.lesson.Id}`).bind("click", this._onLessonLinkClickHandler)
    }

    componentWillUnmount() {
        $(`#lesson-link${this.props.lesson.Id}`).unbind("click", this._onLessonLinkClickHandler)
    }

    render() {
        const {course, lesson, needShowAuthors} = this.props;

        let _title = lesson.Name,
            _authorName = lesson.authorName,
            _descr = lesson.ShortDescription,
            _lessonUrl = lesson.URL,
            _courseUrl = course.URL,
            _linkUrl = '/' + _courseUrl + '/' + _lessonUrl;

        _title = _title.match(/[-.?!)(,:]$/g) ? _title : (_title + '.');

        return (
            <div className="lecture-full__text-block">
                <FavoritesButton className={"lecture-full__fav"} courseUrl={_courseUrl} lessonUrl={_lessonUrl}/>
                <h2 className="lecture-full__title">
                    <Link to={_linkUrl} id={`lesson-link${lesson.Id}`}>{_title}</Link>
                </h2>
                <p className="lecture-full__descr">
                    {' ' + _descr + ' '}
                    {needShowAuthors ? <p className="lecture-full__author">{_authorName}</p> : null}
                </p>
            </div>
        )
    }
}

function mapDispatchToProps(dispatch) {
    return {
        notifyLessonLinkClicked: bindActionCreators(notifyLessonLinkClicked, dispatch),
    }
}

export default connect(null, mapDispatchToProps)(TextBlock)