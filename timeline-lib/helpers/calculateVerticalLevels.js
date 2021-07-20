export type EventItem = {
    xStart: number,
    xEnd: number,
    id: number,
    yLevel: number,
    visible?: boolean
}

export default function calculateVerticalLevels(records: Array<EventItem>, levelLimit: number = 4, checkVisibility = true) {
    let items = [...records].sort((a,b) => a.xStart - b.xStart)

    const findAndSetLevel = (processedElement: EventItem, elementIndex: number) => {
        let _intersections = items.filter((item, index) => {
            if (index < elementIndex) {
                // такой поиск пересечения будет работать только при сортированном в прямом порядке массиве
                const _hasIntersection = (item.xStart <= processedElement.xStart && item.xEnd > processedElement.xStart)
                    &&
                    (checkVisibility ? (item.visible && processedElement.visible) : true);
                return _hasIntersection
            } else {
                return false
            }
        });

        if (_intersections.length > 0) {
            const _levels = (new Array(levelLimit)).fill(null).map(() => ({inUse:false, level: null, delta: null}))

            _intersections.forEach((item) => {
                _levels[item.yLevel].inUse = true
                _levels[item.yLevel].level = item.yLevel
                const _delta = item.xEnd - processedElement.xStart
                _levels[item.yLevel].delta = _levels[item.yLevel].delta && (_levels[item.yLevel].delta > _delta) ? _levels[item.yLevel].delta : _delta
            })

            const _allLevelsInUse = _levels.every(level => level.inUse)

            if (_allLevelsInUse) {
                _levels.sort((a, b) => { return a.delta - b.delta})

                processedElement.yLevel = _levels[0].level
            } else {
                processedElement.yLevel = _levels.findIndex(level => !level.inUse)
            }
        }
    }

    items.forEach((item, index) => {return findAndSetLevel(item, index)});

    return items;
};
