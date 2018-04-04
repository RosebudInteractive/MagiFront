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
        content: PropTypes.array.isRequired,
        visible: PropTypes.bool.isRequired,
        onGoToContent: PropTypes.func
    };

    static defaultProps = {
        content: [],
        visible: false,
    };

    componentDidMount() {}

    componentWillReceiveProps(nextProps){
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
        let that = this;

        return this.props.contentArray.map((item, index) => {
            let _currContentId = this.props.currentContent ? this.props.currentContent.id : 0;

            return <li className={(_currContentId === item.id) ? 'active' : ''} key={index}
                       onClick={() => that._goToContent(item.begin)}>
                <a href='#'>{item.title}</a>
            </li>
        })
    }

    _goToContent(begin) {
        this.props.playerStartActions.startSetCurrentTime(begin)
    }

    render() {
        return (
            <div className={"contents-tooltip js-player-tooltip js-contents" + (this.props.visible ? ' opened' : '')}>
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
    }
}

function mapDispatchToProps(dispatch) {
    return {
        playerStartActions: bindActionCreators(playerStartActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ContentTooltip);