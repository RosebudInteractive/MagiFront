import React from 'react'
import 'styles/blocks/_course-module.sass'

export default class Wrapper extends React.Component {
    render() {
        return <div className="course-module _small">
            <div className="course-module__info-block">
                <div className="course-module__header">
                    <h1 className="course-module__title">
                        <span className="favourites">В закладки</span>
                        <a href="#">
                            <p className="course-module__label">Лекция:</p> <span>Иоанн Креститель. <br>Рождество и Крещение.</span>
                        </a>
                    </h1>
                    <div className="course-module__info">
                        <div className="course-module__stats">
                            <b className="category">История</b>
                            /
                            <span className="author-name">Олег Воскобойников</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="course-module__description-block">
                <p>Иоанн Креститель — ключевая фигура для интерпретации евангельских событий и оценки достоверности
                    всего повествования. Александр Ткаченко показывает сходства и различия в рассказах о нем на
                    материале канонических текстов, ранних апокрифов и трудов Иосифа Флавия. В этой лекции также
                    затрагиваются проблемы хронологии евангельских событий.</p>
            </div>
        </div>
    }
}