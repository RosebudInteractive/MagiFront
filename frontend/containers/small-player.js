import React from 'react';
import PropTypes from 'prop-types';
import * as Player from '../components/player/nested-player';

export default class SmallPlayer extends React.Component {

    static propTypes = {
        visible: PropTypes.bool.isRequired,
        lesson: PropTypes.object,
    };

    static defaultProps = {
        visible: false
    };

    componentDidUpdate(prevProps) {
        if (Player.getInstance() && (this.props.visible !== prevProps.visible)) {
            if (this.props.visible) {
                Player.getInstance().switchToSmall()
            } else {
                Player.getInstance().switchToFull()
            }
        }
    }

    render() {
        return (
            <div className='small-player-frame' style={this.props.visible ? null : {display: 'none'}}>
                <div className='small-player__poster'>
                    <div className='ws-container-mini' id='small-player'/>
                </div>
                <div className='player-frame__poster-text'>

                </div>
                <div className='small-player_block'>

                </div>
            </div>
        );
    }
}


