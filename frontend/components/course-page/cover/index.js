import React from 'react'
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import PropTypes from 'prop-types'
import './cover.sass'
import {Link} from "react-router-dom";
import {userBookmarksSelector} from "ducks/profile";
import PageHeader from "../../page-header/page-header";

const COURSE_PAGE_INFO_SEPARATOR = <span className="course-page__info-separator">•</span>

class Cover extends React.Component {

    static propTypes = {
        course: PropTypes.object
    }

    constructor(props) {
        super(props)
    }

    render() {
        const _flag = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#flag-white"/>',
            _redFlag = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#flag-red"/>',
            _smallCrown = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#crown-small"/>'

        const {course} = this.props,
            _coverStyle = {backgroundImage : "url(" + '/data/' + course.Cover + ")"},
            _inFavorites = this._isLessonInBookmarks();

        return <div className="course-page__cover" style={_coverStyle}>
            <PageHeader visible={true}/>
            <div className="course-page__info-wrapper">
                <button type="button" className="lecture-frame__fav" onClick={::this._favoritesClick}>
                    <svg width="14" height="23" dangerouslySetInnerHTML={{__html: _inFavorites ? _redFlag : _flag}}/>
                </button>
                <div className="course-page__info">
                    <h1 className="info__title">
                        <span className="title__course-pay-status">
                            <svg width="18" height="18" dangerouslySetInnerHTML={{__html: _smallCrown}}/>
                        </span>
                        <p className="title__label">Курс:</p>
                        <span>{course.Name}</span>
                    </h1>
                    <div className="info__authors-and-category">
                        <div className="info__authors">{this._getAuthorBlock()}</div>
                        <div className="info__categories">{this._getCategoriesBlock()}</div>
                    </div>
                </div>
            </div>
        </div>
    }

    _getAuthorBlock(){
        return this.props.course.Authors.map((author, index) => {
            let _authorName = author.FirstName + ' ' + author.LastName;

            return (<React.Fragment>
                <Link to={'/autor/' + author.URL} className="author-item" key={index}>{_authorName}</Link>
                {COURSE_PAGE_INFO_SEPARATOR}
            </React.Fragment>);
        });
    }

    _getCategoriesBlock() {
        return this.props.course.Categories.map((item, index, array) => {
            let _isLast = (index === array.length - 1);
            return (<React.Fragment>
                <span className="category-item" key={index}>{item.Name.toUpperCase()}</span>
                {_isLast ? null : COURSE_PAGE_INFO_SEPARATOR}
            </React.Fragment>);
        });
    }

    _isLessonInBookmarks() {
        let {courseUrl, lessonUrl} = this.props;

        return this.props.bookmarks && this.props.bookmarks.find((item) => {
            return item === courseUrl + '/' + lessonUrl
        })
    }

    _favoritesClick() {

    }
}

function mapStateToProps(state) {
    return {
        bookmarks: userBookmarksSelector(state),
        lessonInfoStorage: state.lessonInfoStorage,
        authorized: !!state.user.user,
    }
}

function mapDispatchToProps(dispatch) {
    return {}
}



export default connect(mapStateToProps, mapDispatchToProps)(Cover);