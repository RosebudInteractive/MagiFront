export default function calculateVerticalLevels(records, levelLimit, checkVisibility = true) {
    const items = [...records].sort((a, b) => a.xStart - b.xStart);
    let currentLevel = levelLimit || 1;
    const findAndSetLevel = (processedElement, elementIndex) => {
        const intersections = items.filter((item, index) => {
            if (index < elementIndex) {
                // такой поиск пересечения будет работать только при сортированном в прямом порядке массиве
                const hasIntersection = (item.xStart <= processedElement.xStart
                    && item.xEnd > processedElement.xStart)
                    && (checkVisibility ? (item.visible && processedElement.visible) : true);
                return hasIntersection;
            }
            return false;
        });
        if (intersections.length > 0) {
            const levels = (new Array(currentLevel))
                .fill(null)
                .map(() => ({ inUse: false, level: 0, delta: 0 }));
            intersections.forEach((item) => {
                levels[item.yLevel].inUse = true;
                levels[item.yLevel].level = item.yLevel;
                const delta = item.xEnd - processedElement.xStart;
                levels[item.yLevel].delta = levels[item.yLevel].delta && (levels[item.yLevel].delta > delta)
                    ? levels[item.yLevel].delta
                    : delta;
            });
            const allLevelsInUse = levels.every((level) => level.inUse);
            if (allLevelsInUse) {
                if (levelLimit > 0) {
                    levels.sort((a, b) => a.delta - b.delta);
                    // eslint-disable-next-line no-param-reassign
                    processedElement.yLevel = levels[0].level;
                }
                else {
                    // eslint-disable-next-line no-param-reassign
                    processedElement.yLevel = currentLevel;
                    currentLevel += 1;
                }
            }
            else {
                // eslint-disable-next-line no-param-reassign
                processedElement.yLevel = levels.findIndex((level) => !level.inUse);
            }
        }
    };
    items.forEach((item, index) => findAndSetLevel(item, index));
    return { items, levelsCount: currentLevel };
}
