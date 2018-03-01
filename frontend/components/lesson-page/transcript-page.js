import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';

export default class TranscriptPage extends React.Component {
    static propTypes = {
        episodes: PropTypes.array.isRequired,
        refs: PropTypes.array.isRequired,
        gallery: PropTypes.array.isRequired,
    };

    render() {
        return(
            <div>
                <TextBlock {...this.props} />
                <ReadingBlock {...this.props}/>
                <Gallery {...this.props}/>
            </div>
        )
    }
}

class TextBlock extends React.Component {
    static propTypes = {
        episodes: PropTypes.array.isRequired,
    };

    _parseTranscript(text) {
        const _re = /<h2>(.*?)<\/h2>/
        // const _reg = new RegExp("<h/[0-9]/>", 'i');
        if (_re.test(text)) {
            let _matches = _re.exec(text);
            console.log(_matches)
        }
    }

    _getText(){
        let _text = '';

        this.props.episodes.forEach((episode) => {
            this._parseTranscript(episode.Transcript)
            _text = _text + episode.Transcript;
        });

        return _text;
    }

    render() {
        return(
            <section className={'text-block'}>
                <div className={'text-block__wrapper'}>
                    <div dangerouslySetInnerHTML={{__html: this._getText()}}/>
                    <Refs {...this.props}/>
                </div>
            </section>
        )
    }
}

class Refs extends React.Component {

    _getList() {
        return this.props.refs.map((ref, index) => {
            return <li key={index}>
                {ref.URL ? <Link to={ref.URL}>ref.Description</Link> : ref.Description}
            </li>
        })
    }


    render() {
        return(
            <div className="literature-sources">
                <h3 className="literature-sources__title">Источники</h3>
                <ol className="sources-list">
                    {this._getList()}
                </ol>
            </div>
        )
    }
}

class ReadingBlock extends React.Component {

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

class Gallery extends React.Component {

    _getList(){
        return this.props.gallery.map((item, index) => {
            return <Link to={'#'} className={'gallery-item'}>
            <div className="gallery-item__preview" key={index}>
                    <span className="number">{index + 1 + '.'}</span>
                    <div className="gallery-item__image">
                        <img src={'/data/' + item.FileName}/>
                    </div>
                    <p className="gallery-item__caption">{item.Name}<br/>{item.Description}</p>
                </div>
            </Link>
            })
    }

    render(){
        return(
            <section className="gallery-block" id="gallery">
                <div className="gallery">
                    <div className="gallery-label">
                        <h2>Галерея <span className="qty">{this.props.gallery.length}</span></h2>
                    </div>
                    {this._getList()}
                </div>
            </section>
        )
    }
}