import React from 'react';
import PropTypes from 'prop-types';

export default class ReadingBlock extends React.Component {

    static propTypes = {};

    static defaultProps = {};

    _getList(){
        return <li className="reading-list__item">
            <div className="reading-list__img">
                <img src="assets/images/book01.png" width="145" height="207" alt=""/>
            </div>
            <div className="reading-list__item-info">
                <h4 className="reading-list__title">Обними меня крепче </h4>
                <h4 className="reading-list__author">Сью Джонсон</h4>
                <p className="reading-list__descr">Когда люди слышат, что я соблюдаю распорядок, каждый день пишу, посвящаю время иностранному языку, работаю над крупным проектом, а через день хожу в спортзал, их изумляет моя дисциплина. Но на самом деле это всего лишь привычки, которые наделяют меня суперспособностями.</p>
            </div>
        </li>
    }


    render(){
        return(
            <section className="reading-list-block" id="recommend">
                <div className="reading-list-block__col1">
                    <h3 className="reading-list-block__label">Рекомендации</h3>
                </div>
                <div className="reading-list-block__col3">
                    <ul className="reading-list">
                        {this._getList()}
                    </ul>
                </div>
            </section>
        )
    }
}