import React from 'react';
import PropTypes from "prop-types";
import {
    FacebookShareButton,
    TwitterShareButton,
    VKShareButton,
    OKShareButton,
} from 'react-share';
import Sources from "./sources";

export default class Content extends React.Component {

    static propTypes = {
        shareUrl: PropTypes.string,
        course: PropTypes.object,
        counter: PropTypes.number,
    }

    constructor(props) {
        super(props)
        this.state = {
            expanded: true
        }
    }

    render() {
        if (!this.props.course) {
            return null
        }

        let _descr = this.props.course.Description ? this.props.course.Description : null;

        return (
            <div className="course-module__info-block">
                <SocialBlock shareUrl={this.props.shareUrl} counter={this.props.counter}/>
                <Description descr={_descr} isFull={this.state.expanded} extLinks={this.props.course.ExtLinks}/>
                <Sources course={this.props.course}/>
            </div>
        );
    }
}

class SocialBlock extends React.Component {
    render() {
        let {shareUrl, title, counter} = this.props;

        const _tw = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#tw"/>',
            _fb = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#fb"/>',
            _vk = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#vk"/>',
            _ok = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#ok"/>';

        return (
            <div className="social-block social-block--dark">
                <div className='social-button-wrapper'>
                    <TwitterShareButton url={shareUrl} title={title} className="social-btn">
                        <div className="social-btn__icon">
                            <svg width="27" height="22" dangerouslySetInnerHTML={{__html: _tw}}/>
                        </div>
                    </TwitterShareButton>
                </div>
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
            </div>
        )
    }
}

class Description extends React.Component {
    createMarkup() {
        return {__html: this.props.descr};
    }

    render() {
        return (
            <div className={"course-module__course-descr" + (this.props.isFull ? ' full' : '')}>
                <p dangerouslySetInnerHTML={this.createMarkup()}/>
            </div>
        )
    }
}