import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import FavoritesButton from "./favorites-button";
import {notifyLessonLinkClicked} from "ducks/google-analytics";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";

class SingleLessonTextBlock extends React.Component {

    static propTypes = {
        course: PropTypes.object,
        lesson: PropTypes.object,
        needShowAuthors: PropTypes.bool,
    };

    constructor(props) {
        super(props)

        this._onLessonLinkClickHandler = () => {
            const {lesson, course,} = this.props;

            let _author = course.AuthorsObj ?
                course.AuthorsObj[0].FirstName + " " + course.AuthorsObj[0].LastName
                :
                course.author ?
                    course.author
                    :
                    'unknown'

            this.props.notifyLessonLinkClicked({
                Id: course.Id,
                Name: course.Name,
                author: _author,
                category: course.CategoriesObj[0].Name,
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
        let {lesson, course, needShowAuthors} = this.props,
            _linkUrl = '/' + course.URL + '/' + lesson.URL,
            _title = lesson.Name.match(/[-.?!)(,:]$/g) ? lesson.Name : (lesson.Name + '.'),

            _authorName = needShowAuthors ? (lesson.author.FirstName + ' ' + lesson.author.LastName) : null,
            _authorUrl = needShowAuthors ? ('/autor/' + lesson.author.URL) : null,
            _category = needShowAuthors ? lesson.category.Name : null

        return (
            <div className="lecture-full__text-block">
                <FavoritesButton className={"lecture-full__fav"} courseUrl={course.URL} lessonUrl={lesson.URL}/>
                <h2 className="lecture-full__title">
                    <span className="label">Лекция:</span>
                    <Link to={_linkUrl} id={`lesson-link${lesson.Id}`}>
                        <span>{_title}</span>
                    </Link>
                </h2>
                <p className="lecture-full__descr">
                    {' ' + lesson.ShortDescription + ' '}
                    {
                        needShowAuthors ?
                            <span className="lecture-full_stats">
                                <span className="cathegory">{_category}</span> /
                                <span className="author">
                                    <Link to={_authorUrl}>{_authorName}</Link>
                                </span>
                            </span>
                            :
                            null

                    }

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

export default connect(null, mapDispatchToProps)(SingleLessonTextBlock)