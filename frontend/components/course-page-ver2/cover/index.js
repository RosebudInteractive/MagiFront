import React from 'react'
import PropTypes from 'prop-types'
import './cover.sass'
import {Link} from "react-router-dom";
import PageHeader from "../../header-ver2";
import {getCrownForCourse} from "tools/svg-paths";

const COURSE_PAGE_INFO_SEPARATOR = <span className="course-page__info-separator">•</span>

export default class Cover extends React.Component {

    static propTypes = {
        course: PropTypes.object,
        isFavorite: PropTypes.bool,
        onFavoritesClick: PropTypes.func,
    }

    constructor(props) {
        super(props)
    }

    render() {
        const _flag = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#flag-white"/>',
            _redFlag = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#flag-red"/>'

        const {course, isFavorite} = this.props,
            _coverUrl = course.LandCover ? course.LandCover : course.Cover,
            _backgroundPosition = course.LandCoverMeta && course.LandCoverMeta.backgroundPosition ?
                {
                    top: course.LandCoverMeta.backgroundPosition.percent.top * 100 + "%",
                    left: course.LandCoverMeta.backgroundPosition.percent.left * 100 + "%",
                }
                :
                {
                    top: "top",
                    left: "center"
                },
            _coverStyle = {
                backgroundImage : "url(" + '/data/' + _coverUrl + ")",
                backgroundPositionX: _backgroundPosition.left,
                backgroundPositionY: _backgroundPosition.top,
            }

        return <div className="course-page__cover" style={_coverStyle}>
            <PageHeader visible={true}/>
            <div className="course-page__info-wrapper">
                <button type="button" className="lecture-frame__fav" onClick={::this._favoritesClick}>
                    <svg width="14" height="23" dangerouslySetInnerHTML={{__html: isFavorite ? _redFlag : _flag}}/>
                </button>
                <div className="course-page__info">
                    <h1 className="info__title">
                        <span className="title__course-pay-status">
                            { getCrownForCourse(this.props.course) }
                        </span>
                        <p className="title__label">Курс:</p>
                        <span>{course.Name.trim()}</span>
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

    _favoritesClick() {
        if (this.props.onFavoritesClick) {
            this.props.onFavoritesClick()
        }
    }
}