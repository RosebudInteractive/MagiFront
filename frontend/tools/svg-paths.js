import React from 'react';

export const filter = <svg id="filter" viewBox="0 0 22 21" width="100%" height="100%">
    <g transform="translate(1 3)">
        <path id="filter-a" d="M0 0h12v2H0V0z"/>
    </g>
    <g transform="translate(17 3)">
        <path id="filter-b" d="M0 0h4v2H0V0z"/>
    </g>
    <g transform="translate(9 10)">
        <path id="filter-a" d="M0 0h12v2H0V0z"/>
    </g>
    <g transform="translate(1 17)">
        <path id="filter-a" d="M0 0h12v2H0V0z"/>
    </g>
    <g transform="translate(13 1)">
        <path id="filter-c" d="M0 0h2v6H0V0z"/>
    </g>
    <g transform="translate(17 17)">
        <path id="filter-b" d="M0 0h4v2H0V0z"/>
    </g>
    <g transform="translate(1 10)">
        <path id="filter-b" d="M0 0h4v2H0V0z"/>
    </g>
    <g transform="translate(13 15)">
        <path id="filter-c" d="M0 0h2v6H0V0z"/>
    </g>
    <g transform="translate(5 8)">
        <path id="filter-c" d="M0 0h2v6H0V0z"/>
    </g>
</svg>;

export const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const getCrownForCourse = (course) => {
    const _crown = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#crown"/>'

    if (!course) {
        return null
    }

    const _fill = course.IsGift ? "#F79F1A" : "#C8684C"

    return course.IsPaid ?
            <svg className="course-module__label-icon" width="18" height="18" fill={_fill}
                 dangerouslySetInnerHTML={{__html: _crown}}/>
            :
            null
}