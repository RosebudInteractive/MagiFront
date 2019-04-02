import React from 'react'
import EpisodesGrid from '../grids/episodes'
import SublessonsGrid from '../grids/subLessons'
import PropTypes from 'prop-types'

export default class EpisodesTab extends React.Component{

    static propTypes = {
        editMode : PropTypes.bool,
        visible: PropTypes.bool,
    }

    constructor(props) {
        super(props)

        this._resizeHandler = () => {
            let _episodes = window.$$('lesson-episodes'),
                _subs = window.$$('lesson-subs'),
                _width = $('.editor__main-area').width() - 20

            if (_episodes) {
                _episodes.$setSize(_width, _episodes.height);
            }

            if (_subs) {
                _subs.$setSize(_width, _subs.height);
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
            <EpisodesGrid editMode={this.props.editMode}/>
            <SublessonsGrid editMode={this.props.editMode}/>
        </div>
    }
}

