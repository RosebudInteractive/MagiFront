import React from 'react';
import {Link} from 'react-router-dom';

const NotFound = () => (
    <div className='not_found__page'>
        <div className='not-found__wrapper'>
            <div className='header'><h2>Ошибка 404 Not Found</h2></div>
            <div className='text'>Ошибка 404 или Not Found («не найдено») — стандартный код ответа HTTP о том, что
                клиент
                был в состоянии общаться с сервером, но сервер не может найти данные согласно запросу. Ошибку 404 не
                следует
                путать с ошибкой «Сервер не найден» или иными ошибками, указывающими на ограничение доступа к серверу.
                Ошибка 404 означает, что запрашиваемый ресурс может быть доступен в будущем, что однако не гарантирует
                наличие прежнего содержания.
            </div>
            <Link to="/" className='btn btn--brown'>На главную страницу</Link>
        </div>
    </div>
);

export default NotFound;