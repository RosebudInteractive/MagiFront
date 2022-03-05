import React from 'react'
import CourseTests from '../details/tests'
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
            let _grid = window.$$('course-tests');

            if (_grid) {
                let _width = $('.editor__main-area').width() - 2

                let _actionBarHeight = $('.tab-wrapper__course-tests .action-bar').height()

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
        return <div className={"tab-wrapper tab-wrapper__course-tests" + (this.props.visible ? '' : ' hidden')}>
            <CourseTests editMode={this.props.editMode} courseId={this.props.courseId}/>
        </div>
    }
}