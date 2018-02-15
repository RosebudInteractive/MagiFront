import React from 'react';
import {connect} from 'react-redux';
import * as svg from '../../tools/svg-paths';

class Content extends React.Component {

    render() {
        if (!this.props.course) {
            return null
        }

        let _descr = this.props.course.Description ? this.props.course.Description : null;

        return (
            <div className="course-module__info-block">
                <SocialBlock/>
                <Description descr={_descr}/>
                <BookCard/>
            </div>
        );
    }
}

class SocialBlock extends React.Component {
    render() {
        return (
            <div className="social-block social-block--dark">
                <SocialButton href={'tw'} icoWidth={27} icoHeght={22}/>
                <SocialButton href={'fb'} icoWidth={24} icoHeght={24} count={64}/>
                <SocialButton href={'vk'} icoWidth={26} icoHeght={15} count={91}/>
                <SocialButton href={'ok'} icoWidth={14} icoHeght={24} count={4}/>
            </div>
        )

    }
}

class SocialButton extends React.Component {
    render() {
        let {href, count, icoWidth, icoHeight} = this.props;

        return (
            <a className={"social-btn" + (count ? ' _active' : '')}>
                <div className="social-btn__icon">
                    <svg width={icoWidth} height={icoHeight}>
                        {svg.social[href]}
                    </svg>
                </div>
                <span className="social-btn__actions">{count ? count : null}</span>
            </a>
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