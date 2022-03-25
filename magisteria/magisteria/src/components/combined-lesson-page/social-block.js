import React from 'react';
import {
    FacebookShareButton,
    TwitterShareButton,
    VKShareButton,
    OKShareButton,
} from 'react-share';

export default class SocialBlock extends React.Component {

    render() {
        let {shareUrl, title, counter} = this.props;

        const _tw = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#tw"/>',
            // _fb = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#fb"/>',
            _vk = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#vk"/>',
            _ok = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#ok"/>';

        const _style = {top: 0, bottom: 'auto'}

        return (
            <div className="social-block-vertical _left js-social" style={_style}>
                <div className='social-button-wrapper'>
                    <TwitterShareButton url={shareUrl} title={title} className="social-btn-dark">
                        <div className="social-btn-dark__icon">
                            <svg width="27" height="22" dangerouslySetInnerHTML={{__html: _tw}}/>
                        </div>
                    </TwitterShareButton>
                </div>
                {/*<div className='social-button-wrapper'>*/}
                {/*    <FacebookShareButton url={shareUrl} quote={title} className="social-btn-dark">*/}
                {/*        <div className="social-btn-dark__icon">*/}
                {/*            <svg width="24" height="24" dangerouslySetInnerHTML={{__html: _fb}}/>*/}
                {/*        </div>*/}
                {/*        <span className="social-btn-dark__actions">{counter && counter.facebook ? counter.facebook : 0}</span>*/}
                {/*    </FacebookShareButton>*/}
                {/*</div>*/}
                <div className='social-button-wrapper'>
                    <VKShareButton url={shareUrl} className="social-btn-dark">
                        <div className="social-btn-dark__icon">
                            <svg width="26" height="15" dangerouslySetInnerHTML={{__html: _vk}}/>
                        </div>
                        <span className="social-btn-dark__actions">{counter && counter.vkontakte ? counter.vkontakte : 0}</span>
                    </VKShareButton>
                </div>
                <div className='social-button-wrapper'>
                    <OKShareButton url={shareUrl} className="social-btn-dark">
                        <div className="social-btn-dark__icon">
                            <svg width="14" height="24" dangerouslySetInnerHTML={{__html: _ok}}/>
                        </div>
                        <span className="social-btn-dark__actions">{counter && counter.odnoklassniki ? counter.odnoklassniki : 0}</span>
                    </OKShareButton>
                </div>
            </div>
        )
    }
}