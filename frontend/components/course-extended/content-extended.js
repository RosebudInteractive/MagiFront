import React from 'react';
import {connect} from 'react-redux';
import * as svg from '../../tools/svg-paths';
import {
    FacebookShareButton,
    TwitterShareButton,
    VKShareButton,
    OKShareButton,
} from 'react-share';

class Content extends React.Component {

    render() {
        if (!this.props.course) {
            return null
        }

        let _descr = this.props.course.Description ? this.props.course.Description : null;

        return (
            <div className="course-module__info-block">
                <SocialBlock shareUrl={this.props.shareUrl} counter={this.props.counter}/>
                <Description descr={_descr}/>
                <BookCard/>
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
                        <span className="social-btn__actions">{counter && counter.facebook ? counter.facebook : 0}</span>
                    </FacebookShareButton>
                </div>
                <div className='social-button-wrapper'>
                    <VKShareButton url={shareUrl} className="social-btn _active">
                        <div className="social-btn__icon">
                            <svg width="26" height="15" dangerouslySetInnerHTML={{__html: _vk}}/>
                        </div>
                        <span className="social-btn__actions">{counter && counter.vkontakte ? counter.vkontakte : 0}</span>
                    </VKShareButton>
                </div>
                <div className='social-button-wrapper'>
                    <OKShareButton url={shareUrl} className="social-btn _active">
                        <div className="social-btn__icon">
                            <svg width="14" height="24" dangerouslySetInnerHTML={{__html: _ok}}/>
                        </div>
                        <span className="social-btn__actions">{counter && counter.odnoklassniki ? counter.odnoklassniki : 0}</span>
                    </OKShareButton>
                </div>
            </div>
        )
    }
}

class Description extends React.Component {
    createMarkup() { return {__html: this.props.descr}; }

    render() {
        return (
            <div className="course-module__course-descr">
                <p dangerouslySetInnerHTML={this.createMarkup()}/>
            </div>
        )
    }
}

class BookCard extends React.Component {
    // todo : Пока скрыто, но надо сделать с разбитем на desktop и mobile версии

    render() {
        return (
            <div className="book-card _desktop hidden">
                <div className="book-card__inner">
                    <div className="book-card__image" style={{visibility:'hidden'}}>
                        <img src="/assets/images/book02.png" width={145} height={222} alt=""/>
                    </div>
                    <div className="book-card__info"  hidden={true}>
                        <h3 className="book-card__title">Обними меня крепче </h3>
                        <p className="book-card__author">Сью Джонсон</p>
                        <a href="#" className="btn btn--gray book-card__btn">
                            <span>Купить книгу <span className="price">350p.</span></span>
                        </a>
                        <p className="book-card__descr">Когда люди слышат, что я соблюдаю распорядок, каждый день пишу, посвящаю время иностранному языку, работаю над крупным проектом, а через день хожу в спортзал, их изумляет моя дисциплина. Но на самом деле это всего лишь привычки, которые наделяют меня суперспособностями.</p>
                    </div>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        course: state.singleCourse.object,
    }
}

export default connect(mapStateToProps)(Content);