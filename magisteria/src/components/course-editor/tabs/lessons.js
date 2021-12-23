import React from 'react'
import CourseLessons from '../details/course-lessons'
import PropTypes from 'prop-types'

export default class AuthorsTab extends React.Component {

    static propTypes = {
        courseId: PropTypes.number,
        editMode: PropTypes.bool,
        visible: PropTypes.bool,
    }

    constructor(props) {
        super(props)

        this._resizeHandler = () => {
            let _grid = window.$$('course-lessons');

            if (_grid) {
                let _width = $('.editor__main-area').width() - 2

                let _actionBarHeight = $('.tab-wrapper__lessons .action-bar').height()

                let _height = $('.editor__main-area').height() - _actionBarHeight - 14

                _grid.$setSize(_width, _height);
            }
        }
    }

    componentDidMount(){
        $(window).bind('resize', this._resizeHandler)

        this._resizeHandler();
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.visible && this.props.visible) {
            this._resizeHandler();
        }
    }

    componentWillUnmount() {
        $(window).unbind('resize', this._resizeHandler)
    }

    render() {
        return <div className={"tab-wrapper tab-wrapper__lessons" + (this.props.visible ? '' : ' hidden')}>
            <CourseLessons editMode={this.props.editMode} courseId={this.props.courseId}/>
        </div>
    }
}