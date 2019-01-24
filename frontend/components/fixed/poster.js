import React from 'react';
import PropTypes from 'prop-types'

export default class PlayerBlock extends React.Component {

    static propTypes = {
        poster: PropTypes.string,
        visibleButton: PropTypes.bool,
    }

    render() {
        let {poster, visibleButton} = this.props;

        return (
            <div className="video-block">
                <video src="#" poster={poster}/>
                {
                    visibleButton ?
                        <button className="video-block__btn" type="button" onClick={::this._onClickPlay}/>
                        :
                        null
                }

            </div>
        )
    }

    _onClickPlay() {

    }
}