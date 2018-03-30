import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import * as playerStartActions from '../../actions/player-start-actions'

// import $ from 'jquery'
// import 'script-lib/jquery.mCustomScrollbar.concat.min.js';

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

    componentDidMount() {
        // let that = this;
        // let tooltips = $('.js-contents');
        //
        // $(document).mouseup((e) => {
        //     let _needHide = false;
        //     if (tooltips.has(e.target).length === 0) {
        //         _needHide = _needHide || tooltips.hasClass('opened');
        //         if (_needHide) {
        //             tooltips.removeClass('opened');
        //         }
        //     }
        //
        //     that._hideAllTooltips = _needHide;
        //     if (_needHide) {
        //         that.setState({
        //             showContent: false,
        //             showRate: false,
        //         })
        //     }
        // });
    }

    componentDidUpdate(prevProps) {
        let _contentHasChanged = this.props.content.length && (prevProps.content.length !== this.props.content.length),
            _scrollWasUnmounted = this.props.content.length && !this._scrollMounted;

        if (_contentHasChanged || _scrollWasUnmounted) {
            this._mountCustomScroll();
        }
    }

    componentWillUnmount() {
        this._unmountCustomScroll();
    }

    _mountCustomScroll() {
        // $("#content" + this.props.id).mCustomScrollbar();
        this._scrollMounted = true;
    }

    _unmountCustomScroll() {
        if (this._scrollMounted) {
            // $("#content" + this.props.id).mCustomScrollbar('destroy');
            this._scrollMounted = false
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
            <div className={"contents-tooltip js-player-tooltip js-contents scrollable" + (this.props.visible ? ' opened' : '')}
                 id={'content' + this.props.id}>
                <header className="contents-tooltip__header">
                    <p className="contents-tooltip__title">Оглавление</p>
                </header>
                <ol className="contents-tooltip__body scrollable">
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