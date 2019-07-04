import React from "react";
import PropTypes from "prop-types";
import {Link} from 'react-router-dom';
import PlayBlock from '../play-block'
import {getCoverPath, ImageSize} from "../../../tools/page-tools";
import {notifyLessonLinkClicked} from "ducks/google-analytics";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";

class SingleLecture extends React.Component {

    static propTypes = {
        lesson: PropTypes.object.isRequired,
        course: PropTypes.object,
        isAdmin: PropTypes.bool,
    }

    constructor(props) {
        super(props)

        this._onLessonLinkClickHandler = () => {
            const {lesson, course,} = this.props;

            this.props.notifyLessonLinkClicked({
                Id: course.Id,
                Name: course.Name,
                author: course.AuthorsObj[0].FirstName + " " + course.AuthorsObj[0].LastName,
                category: course.CategoriesObj[0].Name,
                lessonName: lesson.Name,
                price: course.IsPaid ? (course.DPrice ? course.DPrice : course.Price) : 0
            })
        }
    }

    componentDidMount() {
        const {lesson} = this.props

        $(`#lesson-link${lesson.Id}`).bind("click", this._onLessonLinkClickHandler)
    }

    componentWillUnmount() {
        const {lesson} = this.props

        $(`#lesson-link${lesson.Id}`).unbind("click", this._onLessonLinkClickHandler)
    }

    render() {
        let {lesson, course, isAdmin} = this.props;
        if (lesson.State === 'D') {
            return null
        }

        let _cover = '/data/' + getCoverPath(lesson, ImageSize.icon)

        return (
            <section className="lecture">
                <PlayBlock lesson={lesson} course={course} cover={_cover} isAdmin={isAdmin}/>
                <div className='lecture__descr'>
                    <Link to={'/' + course.URL + '/' + lesson.URL} id={`lesson-link${lesson.Id}`}>
                        <h3>
                            <span className='number'>{lesson.Number + '. '}</span>
                            <span className='title'>{lesson.Name + ' '}</span>
                        </h3>
                    </Link>
                    <span className="text">{lesson.ShortDescription}</span>
                </div>
            </section>
        )
    }
}

function mapDispatchToProps(dispatch) {
    return {
        notifyLessonLinkClicked: bindActionCreators(notifyLessonLinkClicked, dispatch),
    }
}

export default connect(null, mapDispatchToProps)(SingleLecture)