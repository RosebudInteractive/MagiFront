import Titles from "./titles";
import Progress from "./progress";
import TimeInfo from "./time-info";
import ContentTooltip from "./content-tooltip";
import RateTooltip from "./rate-tooltip";
import React, {useEffect, useState} from "react";
import PropTypes from "prop-types";
import "./ext-layer.sass"
import Controls from "./controls";

const SVG = {
    SPEED: '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#speed"/>',
    CONTENTS: '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#contents"/>',
}

export function ExtLayer(props) {
    const {id, playerController} = props

    const [title, setTitle] = useState(playerController.state.title)
    const [subTitle, setSubTitle] = useState(playerController.state.subTitle)
    const [contentArray, setContentArray] = useState(playerController.state.contentArray)
    const [paused, setPaused] = useState(playerController.state.paused)
    const [showRateTooltip, setRateTooltipVisibility] = useState(playerController.state.showRateTooltip)
    const [showContentTooltip, setContentTooltipVisibility] = useState(playerController.state.showContentTooltip)

    useEffect(() => {
        playerController.subscribe(_onStateChanged)

        return () => {
            playerController.unsubscribe(_onStateChanged)
        }
    }, [])

    const _onStateChanged = (state) => {
        if (title !== state.title) setTitle(state.title)
        if (subTitle !== state.subTitle) setSubTitle(state.subTitle)
        if (contentArray !== state.contentArray) setContentArray(state.contentArray)
        if (paused !== state.paused) setPaused(state.paused)
        if (showRateTooltip !== state.showRateTooltip) setRateTooltipVisibility(state.showRateTooltip)
        if (showContentTooltip !== state.showContentTooltip) setContentTooltipVisibility(state.showContentTooltip)
    }

    const _openRate = () => {
        if (!showRateTooltip) {
            playerController.openRateTooltip()
        } else {
            playerController.closeRateTooltip()
        }

    }

    const _openContent = () => {
        if (!showContentTooltip) {
            playerController.openContentTooltip()
        } else {
            playerController.closeContentTooltip()
        }
    }

    return <div className={"player__ext-layer" + (paused ? " _paused" : "")}>
        <Titles title={title} subTitle={subTitle}/>
        <div className="player__controls-block">
            <Progress id={id} playerController={playerController}/>
            <div className="player__controls-block__buttons-row">
                <Controls id={id} playerController={playerController}/>
                <div className="player__controls-block__stats">
                    <TimeInfo playerController={playerController}/>
                    <button type="button"
                            className="speed-button js-speed-trigger player-button control-button"
                            onClick={_openRate}>
                        <svg width="18" height="18" dangerouslySetInnerHTML={{__html: SVG.SPEED}}/>
                    </button>
                    {
                        contentArray.length > 0 ?
                            <button type="button"
                                    className="content-button js-contents-trigger player-button control-button"
                                    onClick={_openContent}>
                                <svg width="18" height="12"
                                     dangerouslySetInnerHTML={{__html: SVG.CONTENTS}}/>
                            </button>
                        :
                            null
                    }
                    {/*<button type="button"*/}
                    {/*        className={"fullscreen-button js-fullscreen" + (this.state.fullScreen ? ' active' : '')}*/}
                    {/*        onClick={::this._toggleFullscreen}>*/}
                    {/*    <svg className="full" width="20" height="18"*/}
                    {/*         dangerouslySetInnerHTML={{__html: _fullscreen}}/>*/}
                    {/*    <svg className="normal" width="20" height="18"*/}
                    {/*         dangerouslySetInnerHTML={{__html: _screen}}/>*/}
                    {/*</button>*/}
                </div>
                { showContentTooltip && <ContentTooltip id={id} playerController={playerController}/> }
                { showRateTooltip && <RateTooltip playerController={playerController}/> }
            </div>
        </div>
    </div>
}

ExtLayer.propTypes = {
    id: PropTypes.number,
    contentArray: PropTypes.array,
    playerController: PropTypes.object
}
