import React from 'react';
import {Link} from 'react-router-dom';
import MetaTags from 'react-meta-tags';
import $ from "jquery";
import {pages} from "../tools/page-tools";
import * as pageHeaderActions from "../actions/page-header-actions";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";


class NotFoundPage extends React.Component {

    _getMetaTags() {
        return <MetaTags>
            <meta name="robots" content="noindex,follow"/>
        </MetaTags>
    }

    _removeMetaTags() {
        $('meta[name="robots"]').remove();
    }

    componentWillMount() {
        this.props.pageHeaderActions.setCurrentPage(pages.notFound);
    }

    componentWillUnmount() {
        this._removeMetaTags();
    }

    render() {
        return [this._getMetaTags(),
            <div className='not_found__page'>
                <div className='not-found__wrapper'>
                    <div className='header'><h2>Ошибка 404 Not Found</h2></div>
                    <div className='text'>Ошибка 404 или Not Found («не найдено») — стандартный код ответа HTTP о том,
                        что клиент был в состоянии общаться с сервером, но сервер не может найти данные согласно запросу. Ошибку
                        404 не следует путать с ошибкой «Сервер не найден» или иными ошибками, указывающими на ограничение доступа к
                        серверу. Ошибка 404 означает, что запрашиваемый ресурс может быть доступен в будущем, что однако не
                        гарантирует наличие прежнего содержания.
                    </div>
                    <Link to="/" className='btn btn--brown'>На главную страницу</Link>
                </div>
            </div>
        ]
    }
}

function mapDispatchToProps(dispatch) {
    return {
        pageHeaderActions: bindActionCreators(pageHeaderActions, dispatch),
    }
}

export default connect(null, mapDispatchToProps)(NotFoundPage);