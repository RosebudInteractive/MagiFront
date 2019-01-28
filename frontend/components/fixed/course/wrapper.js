import React from 'react'
import {connect} from 'react-redux';
import PlayerBlock from "../poster";
import {getCoverPath} from "../../../tools/page-tools";
import PropTypes from 'prop-types'
import {Link} from "react-router-dom";
import {fixedObjDescrSelector} from 'ducks/params'
import {addCourseToBookmarks, getUserBookmarks, removeCourseFromBookmarks, userBookmarksSelector} from "ducks/profile";
import {bindActionCreators} from "redux";
import * as userActions from "actions/user-actions";

class Wrapper extends React.Component {

    static propTypes = {
        course: PropTypes.object,
    }

    render() {
        let {course} = this.props,
            _coverPath = '/data/' + getCoverPath(course);

        let _authors = course.AuthorsObj.map((author, index, array) => {
            let _authorName = author.FirstName + ' ' + author.LastName;
            _authorName += (index !== array.length - 1) ? ',' : '';
            return (<Link to={'/autor/' + author.URL} key={index}>{_authorName}</Link>);
        });

        const _categories = course.CategoriesObj.map((category) => {
            return category.Name
        }).join(', ');

        return [
            <div className="course-module _small">
                <div className="course-module__info-block">
                    <div className="course-module__header">
                        <h1 className="course-module__title">

                            <span className={"favourites" + (this._isCourseInBookmarks() ? ' active' : '')} onClick={::this._favoritesClick}>В закладки</span>
                            <Link to={'/category/' + course.URL}>
                                <p className="course-module__label">Курс:</p> <span>{course.Name}</span>
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
                    <p dangerouslySetInnerHTML={this.createMarkup()}/>
                </div>
            </div>,
            <PlayerBlock poster={_coverPath} visibleButton={false} />

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
    }
}

function mapDispatchToProps(dispatch) {
    return {
        getUserBookmarks: bindActionCreators(getUserBookmarks, dispatch),
        addCourseToBookmarks: bindActionCreators(addCourseToBookmarks, dispatch),
        removeCourseFromBookmarks: bindActionCreators(removeCourseFromBookmarks, dispatch),
        userActions: bindActionCreators(userActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Wrapper);