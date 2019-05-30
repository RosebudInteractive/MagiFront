import React from 'react'
import ContentGrid from '../grids/content'
import PropTypes from 'prop-types'

export default class ReferencesTab extends React.Component{

    static propTypes = {
        editMode : PropTypes.bool,
        visible: PropTypes.bool,
        lessonId: PropTypes.number,
    }

    constructor(props) {
        super(props)

        this._resizeHandler = () => {
            let _toc = window.$$('episode-content'),
                _width = $('.editor__main-area').width() - 20,
                _height = $('.editor__main-area').height() - $('.action-bar').height() - 14

            if (_toc) {
                _toc.$setSize(_width, _height);
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

    componentDidUpdate(prevProps) {
        if (!prevProps.visible && this.props.visible) {
            this._resizeHandler()
        }
    }

    render() {
        return <div className={"tab-wrapper tab-wrapper__episode-content" + (this.props.visible ? '' : ' hidden')}>
            <ContentGrid editMode={this.props.editMode} lessonId={this.props.lessonId}/>
        </div>
    }
}