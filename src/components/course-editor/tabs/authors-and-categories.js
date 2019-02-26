import React from 'react'
import CourseAuthors from '../details/course-authors'
import CourseCategories from '../details/course-categories'
import PropTypes from 'prop-types'

export default class AuthorsTab extends React.Component{

    static propTypes = {
        editMode : PropTypes.bool,
        visible: PropTypes.bool,
    }

    constructor(props) {
        super(props)

        this._resizeHandler = () => {
            let _authors = window.$$('course-authors'),
                _categories = window.$$('course-categories'),
                _width = $('.editor__main-area').width() - 20

            if (_authors) {
                _authors.$setSize(_width, _authors.height);
            }

            if (_categories) {
                _categories.$setSize(_width, _categories.height);
            }

        }
    }

    componentDidMount(){
        $(window).bind('resize', this._resizeHandler)

        this._resizeHandler();
    }

    componentWillUnmount() {
        $(window).unbind('resize', this._resizeHandler)
    }

    render() {
        return <div className={"tab-wrapper tab-wrapper__authors-and-categories" + (this.props.visible ? '' : ' hidden')}>
             <CourseAuthors editMode={this.props.editMode}/>
             <CourseCategories editMode={this.props.editMode}/>
        </div>
    }
}