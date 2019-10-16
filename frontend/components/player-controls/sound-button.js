import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import * as playerStartActions from '../../actions/player-start-actions'
import {isMobileAppleDevice} from "tools/page-tools";

class SoundButton extends React.Component {

    render() {
        const _sound = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#sound"/>',
            _mute = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#mute"/>';

        let _isIOS = isMobileAppleDevice()

        return (
            <button type="button" className="sound-button"
                    style={_isIOS ? {display: 'none'} : null}
                    onClick={::this.props.playerStartActions.toggleMute}>
                {
                    this.props.muted ?
                        <svg className="off" width="18" height="18" dangerouslySetInnerHTML={{__html: _mute}}/>
                        :
                        <svg className="on" width="18" height="18" dangerouslySetInnerHTML={{__html: _sound}}/>
                }
            </button>
        );
    }
}

function mapStateToProps(state) {
    return {
        muted: state.player.muted,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        playerStartActions: bindActionCreators(playerStartActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SoundButton);