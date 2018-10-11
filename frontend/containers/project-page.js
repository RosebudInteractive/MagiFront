import React from "react";

export default class ProjectPage extends React.Component {

    render() {
        const _symbol = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#c"/>',
            _style = {paddingTop: '95px'}


        return <main className="project-page" style={_style}>
            <section className="project-info">
                <div className="project-info__wrapper">
                    <h1 className="project-info__title _mobile">От редактора</h1>
                    <div className="project-info__inner">
                        <div className="project-info__col">
                            <div className="project-info__image-block">
                                <h1 className="project-info__title">От редактора</h1>
                                <h2 className="project-info__name">Андрей Борейко</h2>
                                <p className="project-info__position">Главный редактор</p>
                                <div className="project-info__image">
                                    <img src="data/2016/08/unnamed-2-768x768.jpg" width="479" height="459" alt=""/>
                                </div>
                            </div>
                        </div>
                        <div className="project-info__col">
                            <div className="project-info__text-block">
                                <p className="project-info__text">
                                    <span className="letter">
                                        <svg width="97" height="108" dangerouslySetInnerHTML={{__html: _symbol}}/>
                                    </span>
                                    <span>
                                    <span className="sans-serif">лухи о смерти автора сильно преувеличены.</span>
                                    Стоит нам услышать живую, осмысленную речь знатока своего дела – и мы сразу выделяем его слово в белом шуме информационной эпохи. Богатство языка, эрудиция, глубина смысла – все это заставляет прислушаться, задуматься, а потом снова и снова возвращаться к разговору с тем, кто незаметно стал проводником, наставником, а по-латыни – магистром. Отсюда – Magisteria.</span>
                                </p>
                                <p className="project-info__text">Современный читатель, слушатель, зритель хочет быть
                                    независимым в своих суждениях. Требование свободы мысли – это, конечно, не просто
                                    культурная установка Нового времени, но ключевое условие для понимания любой темы,
                                    любого предмета и, тем более, любого собеседника.</p>
                                <p className="project-info__text">С другой стороны, никто из нас не начинает свой путь с
                                    нуля. Всегда есть отправные точки или вершины, опираясь на которые мы получаем
                                    способность видеть и шире и дальше. Опытный наставник подскажет что почитать, на что
                                    обратить внимание в первую очередь, как не потерять напрасно время, в конце
                                    концов.</p>
                                <p className="project-info__text">Мы постарались представить на этом сайте учителей,
                                    способных приподнять слушателя над суматохой повседневности, дать новую перспективу,
                                    свежий взгляд на, казалось бы, вполне традиционные сюжеты. И, хочется думать, круг
                                    этих
                                    мастеров будет расти вместе с ростом аудитории наших зрителей и слушателей.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    }
}