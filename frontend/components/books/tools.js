import React from "react";
import {Link} from "react-router-dom"

const HOSTS = {
    'www.ozon.ru': { order: 1, title: 'OZON', },
    'www.labirint.ru': { order: 2, title: 'Лабиринт', },
    'www.litres.ru': { order: 3, title: 'ЛитРес', },
    'ru.bookmate.com': { order: 4, title: 'Bookmate', },
    'www.storytel.com': { order: 5, title: 'Storytel', },
    'zvukislov.ru': { order: 6, title: 'Звуки слов', },
}

export const getExtLinks = (extLinks) => {
    let _links = [];

    for (let host in extLinks) {
        if (extLinks.hasOwnProperty(host)) {
            _links.push(host)
        }
    }

    _links.sort((a, b) => {
        let _orderA = HOSTS[a] ? HOSTS[a].order : 0,
            _orderB = HOSTS[b] ? HOSTS[b].order : 0;

        return _orderA - _orderB
    })

    return _links.map((item) => {
        return <li>
            <Link to={extLinks[item]}><span>{HOSTS[item].title}</span></Link>
        </li>
    });
}