import React from 'react'
import {connect} from 'react-redux';
import PlayerBlock from "../poster";
import {getCoverPath} from "../../../tools/page-tools";
import PropTypes from 'prop-types'
import {Link} from "react-router-dom";
import {fixedObjDescrSelector} from 'ducks/params'
import {addCourseToBookmarks, getUserBookmarks, removeCourseFromBookmarks, userBookmarksSelector} from "ducks/profile";
import {notifyCourseLinkClicked, } from "ducks/google-analytics";
import {bindActionCreators} from "redux";
import * as userActions from "actions/user-actions";
import PriceBlock from "../../common/price-block";
import {enabledPaidCoursesSelector} from "ducks/app";
import {getCrownForCourse} from "../../../tools/svg-paths";
import '../fixed-block.sass'
import '../../course/courses-page.sass'

class Wrapper extends React.Component {

    static propTypes = {
        course: PropTypes.object,
    }

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
        $(`#course-link${this.props.course.Id}`).bind("click", this._onLinkClickHandler)
    }

    componentWillUnmount() {
        $(`#course-link${this.props.course.Id}`).unbind("click", this._onLinkClickHandler)
    }

    render() {
        let {course, enabledPaidCourse} = this.props;

        if (course && course.IsPaid && !enabledPaidCourse) {
            return null
        }

        const _coverPath = '/data/' + getCoverPath(course);

        let _authors = course.AuthorsObj.map((author, index, array) => {
            let _authorName = author.FirstName + ' ' + author.LastName;
            _authorName += (index !== array.length - 1) ? ',' : '';
            return (<Link to={'/autor/' + author.URL} key={index}>{_authorName}</Link>);
        });

        const _categories = course.CategoriesObj.map((category) => {
            return category.Name
        }).join(', ');

        const _analytics = {
            Name: course.Name,
            Id: course.Id,
            author: course.AuthorsObj[0].FirstName + " " + course.AuthorsObj[0].LastName,
            category: course.CategoriesObj[0].Name,
            price: course.IsPaid ? (course.DPrice && course.Discount ? course.DPrice : course.Price) : 0
        }

        return [
            <div className="course-module _small _fixed">
                <div className="course-module__info-block">
                    <div className="course-module__header">
                        <h1 className="course-module__title">

                            <span className={"favourites" + (this._isCourseInBookmarks() ? ' active' : '')} onClick={::this._favoritesClick}>В закладки</span>
                            <Link to={'/category/' + course.URL} id={`course-link${this.props.course.Id}`}>
                                <p className="course-module__label">
                                    { getCrownForCourse(this.props.course) }
                                    Курс:
                                </p>
                                <span>{course.Name}</span>
                            </Link>
                        </h1>
                        <div className="course-module__info">
                            <div className="course-module__stats">
                                <b className="category">{_categories}</b>
                                {" / "}
                                <span className="author-name">{_authors}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="course-module__description-block">
                    <p className="course-module__descr" dangerouslySetInnerHTML={this.createMarkup()}/>
                    <PriceBlock course={course}/>
                </div>
            </div>,
            <PlayerBlock poster={_coverPath} courseUrl={course.URL} visibleButton={false} analytics={_analytics}/>
        ]
    }

    createMarkup() {
        return {__html: this.props.fixedObjDescr};
    }

    _favoritesClick() {
        if (!this.props.authorized) {
            this.props.userActions.showSignInForm();
        } else {
            if (this._isCourseInBookmarks()) {
                this.props.removeCourseFromBookmarks(this.props.course.URL)
            } else {
                this.props.addCourseToBookmarks(this.props.course.URL)
            }
        }
    }

    _isCourseInBookmarks() {
        return this.props.bookmarks && this.props.bookmarks.find((item) => {
            return item === this.props.course.URL
        })
    }
}

function mapStateToProps(state) {
    return {
        fixedObjDescr: fixedObjDescrSelector(state),
        bookmarks: userBookmarksSelector(state),
        authorized: !!state.user.user,
        enabledPaidCourse: enabledPaidCoursesSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        getUserBookmarks: bindActionCreators(getUserBookmarks, dispatch),
        addCourseToBookmarks: bindActionCreators(addCourseToBookmarks, dispatch),
        removeCourseFromBookmarks: bindActionCreators(removeCourseFromBookmarks, dispatch),
        userActions: bindActionCreators(userActions, dispatch),
        notifyCourseLinkClicked: bindActionCreators(notifyCourseLinkClicked, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Wrapper);