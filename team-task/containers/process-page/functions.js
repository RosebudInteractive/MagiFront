import moment from "moment";
import $ from "jquery";

export const buildTree = (process) => {
    const _tree = {
        nodes: {},
        lines: [],
        rowCount: 0,
        colCount: 0,
    }

    process.Tasks.forEach((task, index) => {
        _tree.nodes[task.Id] = {
            id: task.Id,
            name: task.Name,
            state: task.State,
            dueDate: task.DueDate,
            isFinal: task.IsFinal,
            isAutomatic: task.IsAutomatic,
            disabled: !task.IsActive,
            isExpired: moment(task.DueDate).isBefore(moment()),
            executorName: task.Executor ? task.Executor.DisplayName : "",
            weight: undefined,
            rowNumber: undefined,
            index: index,
            dependencies: {count: 0, nodes: []}
        }
    })

    process.Deps.forEach((dep) => {
        if (_tree.nodes[dep.TaskId]) {
            _tree.nodes[dep.TaskId].dependencies.count++
        }

        if (_tree.nodes[dep.DepTaskId]) {
            _tree.nodes[dep.DepTaskId].dependencies.nodes.push(dep.TaskId)
        }

        _tree.lines.push({
            id: dep.Id,
            from: dep.DepTaskId,
            to: dep.TaskId,
            expression: dep.Expression,
            hasCondition: !!dep.IsConditional,
            disabled: !dep.IsActive
        })
    })

    const _roots = Object.values(_tree.nodes).filter(item => item.dependencies.count === 0)

    let _row = 0
    _roots.forEach((item) => {
        const _result = _calcNodesWeight(_tree.nodes, item, 0, _row)
        _row = _result.row + 1
    })

    Object.values(_tree.nodes).forEach((item) => {
        if (_tree.colCount < item.weight) {
            _tree.colCount = item.weight
        }
        if (_tree.rowCount < item.rowNumber) {
            _tree.rowCount = item.rowNumber
        }

        item.hasInlines = item.dependencies.nodes.count > 0;
        item.hasOutlines = item.dependencies.nodes.length > 0;
    })

    _tree.rowCount++
    _tree.colCount++

    return _tree
}

const _calcNodesWeight = (nodes, node, level, row) => {
    const _firstVisit = node.rowNumber === undefined

    node.weight = ((node.weight === undefined) || (level > node.weight)) ? level : node.weight
    node.rowNumber = (_firstVisit || (row < node.rowNumber)) ? row : node.rowNumber

    let _row = row

    node.dependencies.nodes.forEach((nodeId, index, array) => {
        const result = _calcNodesWeight(nodes, nodes[nodeId], level + 1, _row)
        _row = result.row
        const _isLastChild = index === (array.length - 1)
        const _needIncRow = result.firstVisit && !_isLastChild
        if (_needIncRow) {
            _row++
        }
    })

    return {row: _row, firstVisit: _firstVisit}
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
