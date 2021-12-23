import React, {useEffect} from 'react';
import {Link} from 'react-router-dom';
import MetaTags from 'react-meta-tags';
import $ from "jquery";
import {pages} from "tools/page-tools";
import {setCurrentPage} from "actions/page-header-actions";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";

function NotFoundPage(props) {
    const {actions} = props

    useEffect(() => {
        actions.setCurrentPage(pages.notFound)

        return () => {
            _removeMetaTags()
        }
    })

    const _getMetaTags = () => {
        return <MetaTags>
            <meta name="robots" content="noindex,follow"/>
            <meta name="prerender-status-code" content="404"/>
        </MetaTags>
    }

    const _removeMetaTags = () => {
        $('meta[name="robots"]').remove();
        $('meta[name="prerender-status-code"]').remove();
    }

        return <React.Fragment>
            {_getMetaTags()}
            <div className='not_found__page'>
                <div className='not-found__wrapper'>
                    <div className='header'>Ошибка 404. Страница не найдена.</div>
                    <div className='text'>Уважаемый посетитель! К сожалению, страницы с таким адресом нет на нашем сайте.
                        Предлагаем перейти на главную страницу Магистерии и найти курсы по интересующей Вас теме.
                    </div>
                    <Link to="/" className='btn btn--brown'>На главную страницу</Link>
                </div>
            </div>
        </React.Fragment>
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({setCurrentPage}, dispatch),
    }
}

export default connect(null, mapDispatchToProps)(NotFoundPage);