import $ from "jquery";

export function resizeHandler() {
    const _main = $('.main-area'),
        _height = _main.height(),
        _width = _main.width()

    if (window.$$(this.tableId)) {
        const _headerHeight = window.$$(this.tableId).config.headerRowHeight

        window.$$(this.tableId).$setSize(_width, _height - _headerHeight)
    }
}

export function restoreGridPosition(){
    const _grid = window.$$(this.tableId)
    if (_grid && this.scroll && (this.scroll.x || this.scroll.y)) {
        _grid.scrollTo(this.scroll.x, this.scroll.y)
    }
}

export function selectGridItem(selectedObj) {
    let _needForceUpdate = (this._selected !== +selectedObj.id) || (this._isFirstSelected !== selectedObj.isFirst) || (this._isLastSelected !== selectedObj.isLast);

    this._selectNoRefresh(selectedObj)
    this._saveScrollPos()

    if (_needForceUpdate) {
        this.forceUpdate()
    }
}

export function selectItemWithNoRefresh(selectedObj){
    this._isFirstSelected = selectedObj.isFirst;
    this._isLastSelected = selectedObj.isLast;
    this._selected = +selectedObj.id;
}

export function saveGridScrollPos() {
    const _grid = window.$$(this.tableId)
    if (_grid) {
        this.scroll = window.$$(this.tableId).getScrollState()
    }
}