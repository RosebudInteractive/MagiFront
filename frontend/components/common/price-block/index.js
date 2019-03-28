import React from 'react';
import PropTypes from 'prop-types';


export default class PriceBlock extends React.Component {

    static propTypes = {
        course: PropTypes.object,
    }


    render() {
        const {course} = this.props

        if (!(course && course.IsPaid)) {
            return null
        }

        return <div className="course-module__price-block">
            <div className="course-module__price-block-wrapper">
                <a href="#" className="btn btn--brown course-module__price-btn">Купить</a>
                <div className="course-module__price-block-section">
                    <p className="course-module__price">550₽ <span className="discount">-80%</span></p>
                    <p className="course-module__old-price">5580₽</p>
                </div>
            </div>
            <div className="course-module__price-block-wrapper">
                <p className="course-module__price-block-info"><span className="label">Персональная скидка.</span> Мы
                    думаем что вам понравится потому что вы посмотрели курс «Иоанн Креститель».</p>
            </div>
        </div>
    }
}