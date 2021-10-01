import $ from "jquery";
import tree from './tree-builder'

export const buildTree = (process) => {
    return tree.build(process);
}

export const parseParams = () => {
    const paramsData = {}

    const _params = new URLSearchParams(location.search),
        activeTask = _params.get("activeTask") ? +_params.get("activeTask") : null

    if (activeTask) {
        paramsData.activeTask = activeTask
    }

    return paramsData
}

export const _scrollHandler = () => {
    let st = $(window).scrollTop();

    const _wrapper = $(".process-body__elements-wrapper"),
        _container = $(".process-body__elements")

    const _containerBottom = _container.height() + _container.offset().top

    if (st  < 242) {
        _wrapper.removeClass('_fixed');
        _wrapper.removeClass('_bottom');
        _wrapper.css("width", "100%")
    }

    if (st > _containerBottom - _wrapper.height()) {
        _wrapper.removeClass('_fixed');
        _wrapper.addClass('_bottom');
    }

    if ((st > 242) && (st < _containerBottom - _wrapper.height())) {
        _wrapper.addClass('_fixed');
        _wrapper.removeClass('_bottom');
        if (_container.hasClass("_hidden")) {
            _wrapper.width(26)
        } else {
            _wrapper.width(_container.width())
        }
    }
}
