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
        urlCreated: PropTypes.bool,
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

    doBeforeSetUrl(button) {
        for (let prop in button) {
            if (button.hasOwnProperty(prop) && prop.startsWith("__reactEventHandlers")) {
                this.clickFunk = button[prop].onClick;
                break
            }
        }
    }

    componentDidUpdate(prevProps,) {
        if (this.props.urlCreated && !prevProps.urlCreated) {
            if (this.clickFunk) {

                let _mouseEvent = null
                //This is true only for IE,firefox
                if(document.createEvent){
                    _mouseEvent = document.createEvent("MouseEvent");
                    _mouseEvent.initMouseEvent("click", true,true,window,0,0,0,0,0,false,false,false,false,0,null);
                }
                else{
                    _mouseEvent = new MouseEvent('click', {});
                }

                if (_mouseEvent) {
                    this.clickFunk(_mouseEvent);
                }
                this.clickFunk = null
            }
        }
    }

    render() {
        let {title, counter, shareUrl, urlCreated} = this.props,
            _shareUrl = shareUrl ? shareUrl : window.location.href

        const _tw = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#tw"/>',
            _fb = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#fb"/>',
            _vk = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#vk"/>',
            _ok = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#ok"/>';

        return (
            <div className="social-block social-block--dark">
                <div className='social-button-wrapper' ref={this.setFbRef}>
                    <FacebookShareButton url={_shareUrl} quote={title} className="social-btn _active"
                                         beforeOnClick={!urlCreated ? () => this._beforeOnClick(this.fbButton) : null}>
                        <div className="social-btn__icon">
                            <svg width="24" height="24" dangerouslySetInnerHTML={{__html: _fb}}/>
                        </div>
                        <span
                            className="social-btn__actions font-universal__body-medium">{counter && counter.facebook ? counter.facebook : 0}</span>
                    </FacebookShareButton>
                </div>
                <div className='social-button-wrapper' ref={this.setVkRef}>
                    <VKShareButton url={_shareUrl} className="social-btn _active"
                                   beforeOnClick={!urlCreated ? () => this._beforeOnClick(this.vkButton) : null}>
                        <div className="social-btn__icon">
                            <svg width="26" height="15" dangerouslySetInnerHTML={{__html: _vk}}/>
                        </div>
                        <span
                            className="social-btn__actions font-universal__body-medium">{counter && counter.vkontakte ? counter.vkontakte : 0}</span>
                    </VKShareButton>
                </div>
                <div className='social-button-wrapper' ref={this.setOkRef}>
                    <OKShareButton url={_shareUrl} className="social-btn _active"
                                   beforeOnClick={!urlCreated ? () => this._beforeOnClick(this.okButton) : null}>
                        <div className="social-btn__icon">
                            <svg width="14" height="24" dangerouslySetInnerHTML={{__html: _ok}}/>
                        </div>
                        <span
                            className="social-btn__actions font-universal__body-medium">{counter && counter.odnoklassniki ? counter.odnoklassniki : 0}</span>
                    </OKShareButton>
                </div>
                <div className='social-button-wrapper' ref={this.setTwRef}>
                    <TwitterShareButton url={_shareUrl} title={title} className="social-btn"
                                        beforeOnClick={!urlCreated ? () => this._beforeOnClick(this.twButton) : null}>
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