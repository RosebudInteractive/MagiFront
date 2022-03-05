import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import * as playerStartActions from '../../actions/player-start-actions'

import $ from 'jquery'
import 'script-lib/jquery.mCustomScrollbar.concat.min.js';

class ContentTooltip extends Component {

    constructor(props) {
        super(props)

        this._scrollMounted = false;
    }

    static propTypes = {
        id: PropTypes.number,
    };

    static defaultProps = {
    };

    componentDidMount() {
        this._mountCustomScroll()

        let _id = this.props.currentContent ? this.props.currentContent.id : 0

        if (_id) {
            let _selector = `#toc-${_id}`,
                _position = $(_selector).parent().position()

            _position.top -= 8
            $("#mcs_container").mCustomScrollbar("scrollTo", Object.values(_position), { scrollInertia : 0, timeout : 0 });
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps){
        let _contentHasChanged = (nextProps.contentArray.length !== this.props.contentArray.length);
        if (_contentHasChanged) {
            this._unmountCustomScroll();
        }
    }

    componentDidUpdate() {
        let _scrollWasUnmounted = this.props.contentArray.length && !this._scrollMounted;
        if (_scrollWasUnmounted) {
            this._mountCustomScroll()
        }
    }

    componentWillUnmount() {
        this._unmountCustomScroll();
    }

    _mountCustomScroll() {
        let _div = $('#contents' + this.props.id);
        if (_div.length && _div[0].childElementCount) {
            _div.mCustomScrollbar();
            this._scrollMounted = true;
        }
    }

    _unmountCustomScroll() {
        if (this._scrollMounted) {
            let _div = $('#contents' + this.props.id);
            if (_div.length) {
                _div.mCustomScrollbar('destroy');
                this._scrollMounted = false
            }
        }
    }

    _getContent() {
        return this.props.contentArray.map((item, index) => {
            let _currContentId = this.props.currentContent ? this.props.currentContent.id : 0,
                _isActive = _currContentId === item.id;

            return <li className={_isActive ? 'active' : ''} key={index}
                       onClick={() => {
                           this._goToContent(item.begin)
                       }}>
                <div className='contents-tooltip_item' id={`toc-${item.id}`}>{item.title}</div>
                {
                    _isActive ?
                        <div className={"equalizer" + (this.props.paused ? " paused" : "")}>
                            <div className='eq-1'/>
                            <div className='eq-2'/>
                            <div className='eq-3'/>
                            <div className='eq-4'/>
                            <div className='eq-5'/>
                        </div>
                        :
                        null
                }

            </li>
        })
    }

    _goToContent(begin) {
        this.props.playerStartActions.startSetCurrentTime(begin)
    }

    render() {
        return (
            <div className={"contents-tooltip js-player-tooltip js-contents opened"}>
                <header className="contents-tooltip__header">
                    <p className="contents-tooltip__title">Оглавление</p>
                </header>
                <ol className="contents-tooltip__body scrollable" id={'contents' + this.props.id}>
                    {this._getContent()}
                </ol>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        contentArray: state.player.contentArray,
        currentContent: state.player.currentContent,
        paused: state.player.paused,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        playerStartActions: bindActionCreators(playerStartActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ContentTooltip);