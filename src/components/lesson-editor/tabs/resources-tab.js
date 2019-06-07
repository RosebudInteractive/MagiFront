import React from 'react'
import ResourcesGrid from '../grids/resources'
import PropTypes from 'prop-types'
import {Field} from "redux-form";

export default class ReferencesTab extends React.Component{

    static propTypes = {
        editMode : PropTypes.bool,
        visible: PropTypes.bool,
        resources: PropTypes.array,
    }

    constructor(props) {
        super(props)

        this._resizeHandler = () => {
            let _resources = window.$$('lesson-resources'),
                _width = $('.editor__main-area').width() - 2,
                _height = $('.editor__main-area').height() - $('.lesson-resources .action-bar').height() - 14

            if (_resources) {
                _resources.$setSize(_width, _height);
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
        return <div className={"tab-wrapper tab-wrapper__authors-and-categories" + (this.props.visible ? '' : ' hidden')}>
            <Field component={ResourcesGrid} name="resources" editMode={this.props.editMode}/>
        </div>
    }
}