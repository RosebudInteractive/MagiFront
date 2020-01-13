import React from "react";
import {FacebookShareButton, OKShareButton, TwitterShareButton, VKShareButton} from "react-share";
import PropTypes from "prop-types";
import './social-block.sass'
import ReactDOM from "react-dom";

export class SocialBlock extends React.Component {

    static propTypes = {
        counter: PropTypes.object,
        shareUrl: PropTypes.string,
        beforeOnClick: PropTypes.func,
    }

    constructor(props) {
        super(props)

        this.setFbRef = element => {this.fbButton = element && element.children[0]};
        this.setVkRef = element => {this.vkButton = element && element.children[0]};
        this.setOkRef = element => {this.okButton = element && element.children[0]};
        this.setTwRef = element => {this.twButton = element && element.children[0]};

        this.state = {
            urlCreated : false,
            shareUrl: window.location.href
        }
    }

    setUrl(url, button) {
        for (let prop in button) {
            if (button.hasOwnProperty(prop) && prop.startsWith("__reactEventHandlers")) {
                this.clickFunk = button[prop].onClick;
                break
            }
        }

        this.setState({urlCreated: true, shareUrl: url})
    }

    componentDidUpdate(props, prevState) {
        if (this.state.urlCreated && !prevState.urlCreated) {
            if (this.clickFunk) {
                this.clickFunk(new MouseEvent("click", {}));
                this.clickFunk = null
            }
        }
    }

    render() {
        let {title, counter} = this.props;

        const _tw = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#tw"/>',
            _fb = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#fb"/>',
            _vk = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#vk"/>',
            _ok = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#ok"/>';

        return (
            <div className="social-block social-block--dark">
                <div className='social-button-wrapper' ref={this.setFbRef}>
                    <FacebookShareButton url={this.state.shareUrl} quote={title} className="social-btn _active"
                                         beforeOnClick={!this.state.urlCreated ? () => this._beforeOnClick(this.fbButton) : null}>
                        <div className="social-btn__icon">
                            <svg width="24" height="24" dangerouslySetInnerHTML={{__html: _fb}}/>
                        </div>
                        <span
                            className="social-btn__actions">{counter && counter.facebook ? counter.facebook : ""}</span>
                    </FacebookShareButton>
                </div>
                <div className='social-button-wrapper' ref={this.setVkRef}>
                    <VKShareButton url={this.state.shareUrl} className="social-btn _active"
                                   beforeOnClick={!this.state.urlCreated ? () => this._beforeOnClick(this.vkButton) : null}>
                        <div className="social-btn__icon">
                            <svg width="26" height="15" dangerouslySetInnerHTML={{__html: _vk}}/>
                        </div>
                        <span
                            className="social-btn__actions">{counter && counter.vkontakte ? counter.vkontakte : ""}</span>
                    </VKShareButton>
                </div>
                <div className='social-button-wrapper' ref={this.setOkRef}>
                    <OKShareButton url={this.state.shareUrl} className="social-btn _active"
                                   beforeOnClick={!this.state.urlCreated ? () => this._beforeOnClick(this.okButton) : null}>
                        <div className="social-btn__icon">
                            <svg width="14" height="24" dangerouslySetInnerHTML={{__html: _ok}}/>
                        </div>
                        <span
                            className="social-btn__actions">{counter && counter.odnoklassniki ? counter.odnoklassniki : ""}</span>
                    </OKShareButton>
                </div>
                <div className='social-button-wrapper' ref={this.setTwRef}>
                    <TwitterShareButton url={this.state.shareUrl} title={title} className="social-btn"
                                        beforeOnClick={!this.state.urlCreated ? () => this._beforeOnClick(this.twButton) : null}>
                        <div className="social-btn__icon">
                            <svg width="27" height="22" dangerouslySetInnerHTML={{__html: _tw}}/>
                        </div>
                    </TwitterShareButton>
                </div>
            </div>
        )
    }

    _beforeOnClick(button) {
        if (this.props.beforeOnClick)
            return this.props.beforeOnClick(this, button)
    }
}