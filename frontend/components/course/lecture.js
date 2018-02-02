import BaseComponent, {Size,} from '../base-component';
import React from 'react';
import './lecture.css';
// import img from '../../assets/images/lecture01.png';
import PropTypes from 'prop-types';

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
        let {lesson, size} = this.props;
        return (
            <div className='lecture'>
                <PlayBlock cover={'/data/'+lesson.Cover} size={size}/>
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
            return (
                <section className='lecture lecture-s-size' key={index}>
                    <PlayBlock cover={'/data/'+item.Cover} size={this.props.size}/>
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
            return (
                <section className='lecture lecture-s-size lecture-xs-size lecture-xs-size' key={index}>
                    <PlayBlock cover={'/data/'+item.Cover} size={this.props.size}/>
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


    render() {
        let _className = this._getClassName("lecture__play-block", 'play-block');

        return (
            <div className={_className}>
                <img src={this.props.cover} width="126" height="126" alt=""/>
            </div>
        )
    }
}

Wrapper.propTypes = {
    lessons: PropTypes.array.isRequired,
};