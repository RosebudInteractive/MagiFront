import React from 'react'
import QuestionsGrid from '../grids/questions'
import PropTypes from 'prop-types'
import {Field} from "redux-form";

export default class QuestionsTab extends React.Component{

    static propTypes = {
        editMode : PropTypes.bool,
        visible: PropTypes.bool,
    }

    constructor(props) {
        super(props)

        this._resizeHandler = () => {
            let _questions = window.$$('test-questions'),
                _width = $('.editor__main-area').width() - 2,
                _actionBarHeight = $('.test-questions .action-bar').height(),
                _height = $('.editor__main-area').height() - _actionBarHeight - 14

            if (_questions) {
                _questions.$setSize(_width, _height);
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
        return <div className={"tab-wrapper tab-wrapper__test-questions" + (this.props.visible ? '' : ' hidden')}>
            <Field component={QuestionsGrid} name="questions" editMode={this.props.editMode}/>
        </div>
    }
}