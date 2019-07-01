import React from "react";
import {connect} from "react-redux";

import {authorSelector} from '../../ducks/author'
import Courses from "./courses-list";
import Lessons from "./lessons-list";

class CoursesBlock extends React.Component {

    componentDidMount() {
        if (this.props.author) {
            this.props.author.Courses.forEach((item) => {
                item.author = this.props.author.FirstName + ' ' + this.props.author.LastName
            })
        }
    }

    render() {
        let {author} = this.props

        return (
            <div className="author-block">
                <Courses courses={author.Courses}/>
                <Lessons courses={author.Courses} lessons={author.Lessons}/>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        author: authorSelector(state),
    }
}

export default connect(mapStateToProps)(CoursesBlock);