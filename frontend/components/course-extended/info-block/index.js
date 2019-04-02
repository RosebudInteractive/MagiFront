import React from 'react';
import {connect} from 'react-redux';
import Header from './header';
import Body from './body';
import {ImageSize, getCoverPath} from '../../../tools/page-tools'

class InfoBlock extends React.Component {

    render() {
        if (!this.props.course) {
            return null
        }

        let {course} = this.props,
            _authors = course.Authors ? course.Authors : [],
            _categories = course.Categories ? course.Categories : [],
            _coverPath = getCoverPath(course, ImageSize.medium),
            _cover = _coverPath ? '/data/' + _coverPath : null,
            _mask = course.Mask;

        return (
            <div className="course-module__info-block">
                <Header
                    authors={_authors}
                    categories={_categories}
                    course={course}
                />
                <Body cover={_cover} mask={_mask}/>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        course: state.singleCourse.object,
    }
}

export default connect(mapStateToProps)(InfoBlock);