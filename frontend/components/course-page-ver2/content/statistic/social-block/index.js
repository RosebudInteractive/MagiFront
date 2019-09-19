import React from "react";
import {FacebookShareButton, OKShareButton, TwitterShareButton, VKShareButton} from "react-share";
import PropTypes from "prop-types";
import './social-block.sass'

export class SocialBlock extends React.Component {

    static propTypes = {
        course: PropTypes.object,
        shareUrl: PropTypes.string
    }

    render() {
        let {shareUrl, title, counter} = this.props;

        const _tw = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#tw"/>',
            _fb = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#fb"/>',
            _vk = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#vk"/>',
            _ok = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#ok"/>';

        return (
            <div className="social-block social-block--dark">
                <div className='social-button-wrapper'>
                    <FacebookShareButton url={shareUrl} quote={title} className="social-btn _active">
                        <div className="social-btn__icon">
                            <svg width="24" height="24" dangerouslySetInnerHTML={{__html: _fb}}/>
                        </div>
                        <span
                            className="social-btn__actions">{counter && counter.facebook ? counter.facebook : 0}</span>
                    </FacebookShareButton>
                </div>
                <div className='social-button-wrapper'>
                    <VKShareButton url={shareUrl} className="social-btn _active">
                        <div className="social-btn__icon">
                            <svg width="26" height="15" dangerouslySetInnerHTML={{__html: _vk}}/>
                        </div>
                        <span
                            className="social-btn__actions">{counter && counter.vkontakte ? counter.vkontakte : 0}</span>
                    </VKShareButton>
                </div>
                <div className='social-button-wrapper'>
                    <OKShareButton url={shareUrl} className="social-btn _active">
                        <div className="social-btn__icon">
                            <svg width="14" height="24" dangerouslySetInnerHTML={{__html: _ok}}/>
                        </div>
                        <span
                            className="social-btn__actions">{counter && counter.odnoklassniki ? counter.odnoklassniki : 0}</span>
                    </OKShareButton>
                </div>
                <div className='social-button-wrapper'>
                    <TwitterShareButton url={shareUrl} title={title} className="social-btn">
                        <div className="social-btn__icon">
                            <svg width="27" height="22" dangerouslySetInnerHTML={{__html: _tw}}/>
                        </div>
                    </TwitterShareButton>
                </div>
            </div>
        )
    }
}