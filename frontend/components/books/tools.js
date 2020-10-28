import React from "react";
import {Link} from "react-router-dom"

const HOSTS = {
    'www.ozon.ru': { order: 1, title: 'OZON', },
    'www.labirint.ru': { order: 2, title: 'Лабиринт', },
    'www.litres.ru': { order: 3, title: 'ЛитРес', },
    'ru.bookmate.com': { order: 4, title: 'Bookmate', },
    'www.storytel.com': { order: 5, title: 'Storytel', },
    'zvukislov.ru': { order: 6, title: 'Звуки слов', },
    'www.chitai-gorod.ru': { order: 7, title: 'Читай-город', },
}

export const getExtLinks = (extLinks) => {
    let _links = _getSortedLinks(extLinks)

    _links = _links.map((item) => {
        return <li>
            <a href={extLinks[item]} target="_blank"><span>{HOSTS[item].title}</span></a>
        </li>
    })

    return (_links.length > 1) ? _links.reduce((prev, curr) => [prev, ', ', curr]) : _links;
}

export const getDefaultExtLink = (extLinks) => {

    let _links = _getSortedLinks(extLinks)

    return (_links.length > 0) ? extLinks[_links[0]] : null
}

const _getSortedLinks = (extLinks) => {

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

    return _links
}