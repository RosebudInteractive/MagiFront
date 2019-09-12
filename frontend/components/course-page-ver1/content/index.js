import React from "react";
import PropTypes from "prop-types";
import {getCrownForCourse} from "tools/svg-paths";
import InfoBlock from "./info-block";
import Content from "../../course-extended/content-extended";

export default class ContentWrapper extends React.Component {

    static propTypes = {
        isFavorite: PropTypes.func,
        onFavoritesClick: PropTypes.func,
        shareUrl: PropTypes.string,
        course: PropTypes.object,
    }

    render() {
        const {course, shareUrl} = this.props

        return (
            <div className="course-module course-module--extended">
                <TitleWrapper {...this.props}/>
                <Inner shareUrl={shareUrl} counter={course.ShareCounters} course={course}/>
            </div>
        )
    }
}

class TitleWrapper extends React.Component {
    static propTypes = {
        isFavorite: PropTypes.func,
        onFavoritesClick: PropTypes.func,
        course: PropTypes.object,
    }

    render() {
        let {isFavorite, onFavoritesClick, course} = this.props;

        return (
            <div className="course-module__title-wrapper">
                <h1 className="course-module__title no_underline">
                    <span className={"favourites" + (isFavorite ? ' active' : '')}
                          onClick={onFavoritesClick}>В закладки</span>
                    <p className="course-module__label">
                        { getCrownForCourse(course) }
                        Курс:
                    </p>
                    <span>{course.Name}</span>
                </h1>
            </div>
        )
    }
}

class Inner extends React.Component {
    render() {
        return (
            <div className="course-module__inner">
                <InfoBlock course={this.props.course}/>
                <Content {...this.props}/>
            </div>
        )
    }
}