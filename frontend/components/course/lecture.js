import BaseComponent, {Size,} from '../base-component';
import React from 'react';
// import './lecture.css';
import PropTypes from 'prop-types';
import * as svg from '../../tools/svg-paths';

export class Counter extends BaseComponent {
    render() {
        const {current, total} = this.props;

        return (
            <div className={this._getClassName("lectures-counter", 'counter')}>
                <p>Лекции
                    <span className={this._getClassName('current')}>{current}</span>
                    <span className={this._getClassName('total')}>/{total}</span>
                </p>
            </div>
        )
    }
}

export class Wrapper extends BaseComponent {
    render() {
        let {lessons, size} = this.props;

        return (
            this._narrowerThan(Size.xxs) ?
                <div className='lectures-wrapper-xxs-size lectures-wrapper-s-size'>
                    <ExtraSmallLectures lessons={lessons} size={size}/>
                </div>
                :
                this._widthBetween(Size.xxs, Size.s) ?
                    <div className='lectures-wrapper-xxs-size lectures-wrapper-s-size'>
                        <SmallLectures lessons={lessons} size={size}/>
                    </div>
                    :
                    <div className='lectures-wrapper'>
                        <LargeLecture lesson={lessons[0]} size={size}/>
                    </div>
        )
    }
}

class LargeLecture extends BaseComponent {

    render() {
        let _className = this._getClassName('lecture');

        let {lesson, size} = this.props;
        return (
            <div className={_className}>
                <PlayBlock cover={'/data/'+lesson.Cover} duration={lesson.DurationFmt} size={size}/>
                <div className={this._getClassName("lecture__descr")}>
                    <h3><span className='number'>{lesson.Number + '.'}</span>{' ' + lesson.Name + ' '}</h3>
                    <p>{lesson.ShortDescription}</p>
                </div>
            </div>
        )
    }
}

class SmallLectures extends BaseComponent {

    _getLectures() {
        // const _lectures = [
        //     {
        //         number: 1,
        //         header: 'Индия. Царство Маурья и ненасилие.',
        //         text: 'История трех имперских образований Древней Индии – причины их возникновения, успехи, неудачи и гибкая религиозная политика.'
        //     },
        //     {
        //         number: 2,
        //         header: 'Монашество и образование в буддизме.',
        //         text: 'Цель буддийского монашества и средства ее достижения. Система буддийского образования на базе монастырей.'
        //     },
        // ];



        return this.props.lessons.map((item, index) => {
            let _className = this._getClassName('lecture');

            return (
                <section className={_className} key={index}>
                    <PlayBlock cover={'/data/'+item.Cover} duration={item.DurationFmt} size={this.props.size}/>
                    <div className={this._getClassName("lecture__descr")}>
                        <h3><span className="number">{item.Number}.</span>{' ' + item.Name + ' '}</h3>
                        <p>{item.ShortDescription}</p>
                    </div>
                </section>
            );
        })
    }

    render() {
        return this._getLectures()
    }
}

class ExtraSmallLectures extends BaseComponent {

    _getLectures() {
        // const _lectures = [
        //     {
        //         number: 1,
        //         header: 'Индия. Царство Маурья и ненасилие.',
        //         text: 'История трех имперских образований Древней Индии – причины их возникновения, успехи, неудачи и гибкая религиозная политика.'
        //     },
        //     {
        //         number: 2,
        //         header: 'Монашество и образование в буддизме.',
        //         text: 'Цель буддийского монашества и средства ее достижения. Система буддийского образования на базе монастырей.'
        //     },
        // ];

        return this.props.lessons.map((item, index) => {
            let _className = this._getClassName('lecture');

            return (
                <section className={_className} key={index}>
                    <PlayBlock cover={'/data/'+item.Cover} duration={item.DurationFmt} size={this.props.size}/>
                    <div className={this._getClassName("lecture__descr")}>
                        <h3><span className="number">{item.Number}.</span>{' ' + item.Name + ' '}</h3>
                        <p>{item.ShortDescription}</p>
                    </div>
                </section>
            );
        })
    }

    render() {
        return this._getLectures()
    }
}


class PlayBlock extends BaseComponent {

    constructor(props) {
        super(props);
        this.state = { flipped: null };
    }

    _mouseEnter() {
        this.setState({flipped: true});
    }

    _mouseLeave() {
        this.setState({flipped: false});
    }

    render() {
        let _className = this._getClassName("lecture__play-block", 'play-block');

        return (
            <div className={_className} onMouseEnter={::this._mouseEnter} onMouseLeave={::this._mouseLeave}>
                <div className="lecture__btn">
                    <svg width="41" height="36" opacity={0.8}>
                        {svg.play}
                    </svg>
                </div>
                <div className="lecture__loader" id="cont" data-pct="50">
                    <svg className="svg-loader" id="svg" width="200" height="200" viewBox="0 0 200 200" version="1.1" xmlns="http://www.w3.org/2000/svg">
                        <circle r="98.25" cx="100" cy="100" fill="transparent" strokeDasharray="620" strokeDashoffset="0"/>
                        <circle className="bar" id="bar" r="98.25" cx="100" cy="100" fill="transparent" strokeDasharray="383.274" strokeDashoffset="157.142"/>
                    </svg>
                </div>
                <img src={this.props.cover} width="126" height="126" alt=""/>
                {this.state.flipped ? <div className={'image-hover'}/> : null}
                <div className='duration'>{this.props.duration}</div>
            </div>
        )
    }
}

Wrapper.propTypes = {
    lessons: PropTypes.array.isRequired,
};