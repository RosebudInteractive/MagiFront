import React from 'react'
import ResourcesGrid from '../grids/resources'
import PropTypes from 'prop-types'

export default class ReferencesTab extends React.Component{

    static propTypes = {
        editMode : PropTypes.bool,
        visible: PropTypes.bool,
    }

    constructor(props) {
        super(props)

        this._resizeHandler = () => {
            let _resources = window.$$('lesson-resources'),
                _width = $('.editor__main-area').width() - 20,
                _height = $('.editor__main-area').height() - $('.action-bar').height() - 14

            if (_resources) {
                _resources.$setSize(_width, _height);
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
            <ResourcesGrid editMode={this.props.editMode}/>
        </div>
    }
}