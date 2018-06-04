import React from "react";

class AuthorBlock extends React.Component {

    render() {
        return (
            <div className="author-block">
                <div className="author-block__inner">
                    <div className="author-block__col">
                        <div className="author-block__image">
                            <img src="assets/images/author02.jpg" width="583" height="884" alt=""/>
                        </div>
                    </div>
                    <div className="author-block__col">
                        <div className="author-block__info">
                            <h2 className="author-block__name">Лекманов Олег Андершанович</h2>
                            <p className="author-block__descr">Окончил Московский педагогический государственный
                                университет (1991). Кандидатская диссертация о книге Осипа Мандельштама «Камень» (1995),
                                докторская диссертация «Акмеизм как литературная школа (опыт структурной
                                характеристики)» (2002). Профессор факультета журналистики МГУ (2006—2013), профессор
                                факультета филологии Высшей школы экономики (с 2011).</p>
                            <div className="book-card _desktop">
                                <div className="book-card__inner">
                                    <div className="book-card__image">
                                        <img src="assets/images/book02.png" width="145" height="222" alt=""/>
                                    </div>
                                    <div className="book-card__info">
                                        <h3 className="book-card__title">Обними меня крепче </h3>
                                        <p className="book-card__author">Сью Джонсон</p>
                                        <a href="#" className="btn btn--gray book-card__btn">
                                            <span>Купить книгу <span className="price">350p.</span></span>
                                        </a>
                                        <p className="book-card__descr">Когда люди слышат, что я соблюдаю распорядок,
                                            каждый день пишу, посвящаю время иностранному языку, работаю над крупным
                                            проектом, а через день хожу в спортзал, их изумляет моя дисциплина. Но на
                                            самом деле это всего лишь привычки, которые наделяют меня
                                            суперспособностями.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="book-card book-card--full _mobile">
                                <div className="book-card__inner">
                                    <div className="book-card__image">
                                        <img src="assets/images/book02.png" width="145" height="222" alt=""/>
                                    </div>
                                    <div className="book-card__info">
                                        <h3 className="book-card__title">Обними меня крепче </h3>
                                        <p className="book-card__author">Сью Джонсон</p>
                                        <a href="#" className="btn btn--gray book-card__btn">
                                            <span>Купить книгу <span className="price">350p.</span></span>
                                        </a>
                                    </div>
                                </div>
                                <p className="book-card__descr">Когда люди слышат, что я соблюдаю распорядок, каждый
                                    день пишу, посвящаю время иностранному языку, работаю над крупным проектом, а через
                                    день хожу в спортзал, их изумляет моя дисциплина. Но на самом деле это всего лишь
                                    привычки, которые наделяют меня суперспособностями.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}