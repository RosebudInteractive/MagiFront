import React from 'react';
import {connect} from 'react-redux';

import Info from '../course/course-module-info';
import * as svg from '../../tools/svg-paths';
import {ImageSize, getCoverPath} from '../../tools/page-tools'

class Cover extends React.Component {

    render() {
        if (!this.props.course) {
            return null
        }

        let {course} = this.props,
            _authors = course.Authors ? course.Authors : [],
            _categories = course.Categories ? course.Categories : [],
            _coverPath = getCoverPath(course, ImageSize.medium),
            _cover = _coverPath ? '/data/' + _coverPath : null;

        return (
            <div className="course-module__info-block">
                <Header
                    authors={_authors}
                    categories={_categories}
                />
                <Body cover={_cover}/>
            </div>
        );
    }
}

class Header extends React.Component {
    render() {
        return (
            <div className="course-module__header">
                <Info authors={this.props.authors} categories={this.props.categories} showPhoto={true}/>
            </div>
        )
    }
}

class Body extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            maskNumber : svg.getRandomInt(1, 12).toString().padStart(2, '0')
        }
    }

    render() {
        const _image = '<image preserveAspectRatio="xMaxYMax slice" xlink:href="' +  this.props.cover + '" width="724" height="503"/>';

        return (
            <div className="course-module__body">
                <div className={"course-module__image-block _mask" + this.state.maskNumber}>
                    <svg viewBox="0 0 574 503" width="574" height="503" dangerouslySetInnerHTML={{__html: _image}}/>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        course: state.singleCourse.object,
    }
}

export default connect(mapStateToProps)(Cover);