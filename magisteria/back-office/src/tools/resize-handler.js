import $ from "jquery";

export const resizeHandler = (rowCount: number, containerSelector: string, gridName: string, minWidth = null) => {
    const _container = $(containerSelector),
        _height = _container.height(),
        _width = _container.width(),
        style = _container.parent()[0].currentStyle || window.getComputedStyle(_container.parent()[0]);

    const width = minWidth && _width < minWidth ? minWidth : _width;

    if (window.$$(`${gridName}-grid`)) {
        const _headerHeight = window.$$(`${gridName}-grid`).config.headerRowHeight;

        setTimeout(() => {
            let _gridHeight = _height - _headerHeight - parseInt(style.paddingTop) - parseInt(style.paddingBottom)

            const _calcHeight = (rowCount * 48) + _headerHeight + 32
            _gridHeight = _calcHeight > _gridHeight ? _calcHeight : _gridHeight;
            window.$$(`${gridName}-grid`).$setSize(width, _gridHeight)
        }, 0)
    }
};
