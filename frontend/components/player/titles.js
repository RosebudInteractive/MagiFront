import React from 'react';
import {connect} from 'react-redux';

class Titles extends React.Component {

    render() {
        return !this.props.paused ?
            <div className="player-frame__poster-text">
                <h2 className="player-frame__poster-title">{this.props.title}</h2>
                <p className="player-frame__poster-subtitle">{this.props.subTitle}</p>
            </div>
            :
            null

    }
}

function mapStateToProps(state) {
    return {
        paused: state.player.paused,
        title: state.player.title,
        subTitle: state.player.subTitle,
    }
}

export default connect(mapStateToProps)(Titles);