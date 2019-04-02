import React from 'react'
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {CourseAuthors,} from './course-grids'
import PropTypes from 'prop-types'
import * as courseAuthorsActions from "../../../actions/course/courseAuthorsActions";

class CourseAuthorsWrapper extends React.Component {

    static propTypes = {
        editMode: PropTypes.bool,
    }

    render() {
        return <div className="course-authors">
            <label className="grid-label">Авторы курса</label>
            <CourseAuthors addAction={::this.props.courseAuthorsActions.showAddDialog}
                           removeAction={::this.props.courseAuthorsActions.remove}
                           selectAction={::this.props.courseAuthorsActions.select}
                           selected={this.props.selectedAuthor}
                           editMode={this.props.editMode}
                           data={::this._getCourseAuthors()}/>
        </div>
    }

    _getCourseAuthors() {
        const {
            authors,
            courseAuthors
        } = this.props;

        let _courseAuthors = [];

        courseAuthors.map((item) => {
            let _author = authors.find((author) => {
                return author.id === item
            });

            if (_author) {
                _courseAuthors.push(_author);
            }
        });

        return _courseAuthors;
    }
}

function mapStateToProps(state) {
    return {
        courseAuthors: state.courseAuthors.current,
        authors: state.authorsList.authors,
        selectedAuthor: state.courseAuthors.selected,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        courseAuthorsActions: bindActionCreators(courseAuthorsActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CourseAuthorsWrapper);