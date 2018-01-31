import BaseComponent, {Size,} from '../base-component';
import React from 'react';
import './lecture.css';
import img from '../../assets/images/lecture01.png';

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

        return (
            this._narrowerThan(Size.xxs) ?
                <div className='lectures-wrapper-xxs-size lectures-wrapper-s-size'>
                    <ExtraSmallLectures/>
                </div>
                :
                this._widthBetween(Size.xxs, Size.s) ?
                    <div className='lectures-wrapper-xxs-size lectures-wrapper-s-size'>
                        <SmallLectures/>
                    </div>
                    :
                    <div className='lectures-wrapper'>
                        <LargeLecture/>
                    </div>
        )
    }
}

class LargeLecture extends BaseComponent {
    render() {
        return (
            <div className='lecture'>
                <PlayBlock/>
                <div className='lecture__descr'>
                    <h3><span className='number'>10.</span> Индия. Царство Маурья и ненасилие. </h3>
                    <p>История трех имперских образований Древней Индии – причины их возникновения, успехи, неудачи и
                        гибкая религиозная политика.</p>
                </div>
            </div>
        )
    }
}

class SmallLectures extends BaseComponent {

    _getLectures() {
        const _lectures = [
            {
                number: 1,
                header: 'Индия. Царство Маурья и ненасилие.',
                text: 'История трех имперских образований Древней Индии – причины их возникновения, успехи, неудачи и гибкая религиозная политика.'
            },
            {
                number: 2,
                header: 'Монашество и образование в буддизме.',
                text: 'Цель буддийского монашества и средства ее достижения. Система буддийского образования на базе монастырей.'
            },
        ];

        return _lectures.map((item, index) => {
            return (
                <section className='lecture lecture-s-size' key={index}>
                    <PlayBlock/>
                    <div className="lecture__descr">
                        <h3><span className="number">{item.number}.</span>{' ' + item.header + ' '}</h3>
                        <p>{item.text}</p>
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
        const _lectures = [
            {
                number: 1,
                header: 'Индия. Царство Маурья и ненасилие.',
                text: 'История трех имперских образований Древней Индии – причины их возникновения, успехи, неудачи и гибкая религиозная политика.'
            },
            {
                number: 2,
                header: 'Монашество и образование в буддизме.',
                text: 'Цель буддийского монашества и средства ее достижения. Система буддийского образования на базе монастырей.'
            },
        ];

        return _lectures.map((item, index) => {
            return (
                <section className='lecture lecture-s-size lecture-xs-size lecture-xs-size' key={index}>
                    <PlayBlock/>
                    <div className="lecture__descr">
                        <h3><span className="number">{item.number}.</span>{' ' + item.header + ' '}</h3>
                        <p>{item.text}</p>
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
        return (
            <div className="lecture__play-block">
                <img src={img} width="126" height="126" alt=""/>
            </div>
        )
    }
}