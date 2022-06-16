import $ from 'jquery';
import { stringToDirection } from '#src/constants/common';
const convertParam2Filter = ({ lessonId }) => {
    if (!lessonId)
        return null;
    const filter = {};
    filter.lessonId = parseInt(lessonId, 10);
    return filter;
};
export const parseParams = () => {
    const paramsData = {};
    const params = new URLSearchParams(window.location.search);
    const lessonId = params.get('lessonId');
    const orderValue = params.get('order');
    if (orderValue) {
        const order = orderValue.split(',');
        paramsData.order = { field: order[0], direction: stringToDirection(order[1]) };
    }
    const filter = convertParam2Filter({ lessonId });
    if (filter) {
        paramsData.parsedFilter = filter;
    }
    return paramsData;
};
export const resizeHandler = (rowCount) => {
    const form = $('.form');
    const height = form.height();
    const width = form.width();
    // @ts-ignore
    if (window.$$('images-grid')) {
        // @ts-ignore
        const headerHeight = window.$$('images-grid').config.headerRowHeight;
        setTimeout(() => {
            let gridHeight = (height || 0) - headerHeight - 48;
            const calcHeight = (rowCount * 80) + headerHeight + 60;
            gridHeight = calcHeight > gridHeight ? calcHeight : gridHeight;
            // @ts-ignore
            window.$$('images-grid').$setSize(width, gridHeight);
        }, 0);
    }
};
export const convertFilter2Params = (filter) => {
    const data = {};
    if (filter) {
        if (filter.lessonId)
            data.lessonId = filter.lessonId.toString();
    }
    return data;
};
