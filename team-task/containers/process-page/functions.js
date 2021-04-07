import moment from "moment";

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

        _tree.lines.push({from: dep.DepTaskId, to: dep.TaskId})
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
    // let _needIncRow = false
    node.dependencies.nodes.forEach((nodeId, index, array) => {
        const result = _calcNodesWeight(nodes, nodes[nodeId], level + 1, _row)
        _row = result.row
        // if (!result.needIncRow && (array.length > 1)) {_row++}
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
