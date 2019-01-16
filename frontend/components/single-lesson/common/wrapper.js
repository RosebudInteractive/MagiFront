import React from 'react'
import PlayBlock from '../../common/play-block'
import 'styles/blocks/_course-module.sass'

export default class Wrapper extends React.Component {
    render() {
        return <div className="lecture-full _single js-lecture-full">
            <div className="lecture-full__wrapper">
                <PlayBlock />
                <div className="lecture-full__info-block">
                    <div className="lecture-full__text-block">
                        <button type="button" className="lecture-full__fav">
                            <svg width="14" height="23">
                                <use xlink:href="#flag"></use>
                            </svg>
                        </button>
                        <h3 className="lecture-full__title"><span className="label">Лекция:</span> <a href="#"><span>Ассирия – первый опыт создания «мировой империи» и его провал.</span></a>
                        </h3>
                        <p className="lecture-full__descr"> Развитие прикладных форм японской живописи от китайских
                            образцов к демократичным жанрам эпохи Эдо. <span className="lecture-full_stats"><span
                                className="cathegory">История</span> /<span className="author">Олег Воскобойников</span></span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    }
}