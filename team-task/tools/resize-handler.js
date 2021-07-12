import $ from "jquery";

export const resizeHandler = (rowCount: number, gridName: string, minWidth = null) => {
    const _form = $('.form'),
        _height = _form.height(),
        _width = _form.width();

    const width = minWidth && _width < minWidth ? minWidth :_width;

    console.log('Width', _width);

    if (window.$$(`${gridName}-grid`)) {
        const _headerHeight = window.$$(`${gridName}-grid`).config.headerRowHeight;

        setTimeout(() => {
            let _gridHeight = _height - _headerHeight - 48

            const _calcHeight = (rowCount * 80) + _headerHeight + 60
            _gridHeight = _calcHeight > _gridHeight ? _calcHeight : _gridHeight;
            window.$$(`${gridName}-grid`).$setSize(width, _gridHeight)
        }, 0)
    }
};
