import React from 'react'
import EpisodesGrid from '../grids/episodes'
import SublessonsGrid from '../grids/subLessons'
import PropTypes from 'prop-types'
import {Field} from "redux-form";

export default class EpisodesTab extends React.Component{

    static propTypes = {
        editMode : PropTypes.bool,
        visible: PropTypes.bool,
        isSublesson : PropTypes.bool,
    }

    constructor(props) {
        super(props)

        this._resizeHandler = () => {
            let _main = $('.main-area__container'),
                _rightPadding = 20;

            if (_main) {
                const _hasScrollBar = _main.get(0).scrollHeight > _main.height()
                _rightPadding = _hasScrollBar ? 20 : 2
            }

            let _episodes = window.$$('lesson-episodes'),
                _subs = window.$$('lesson-subs'),
                _width = $('.editor__main-area').width() - _rightPadding

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
            {
                !this.props.isSublesson ?
                    <Field component={SublessonsGrid} name="subLessons" editMode={this.props.editMode}/>
                    // <SublessonsGrid editMode={this.props.editMode}/>
                    :
                    null
            }

        </div>
    }
}

