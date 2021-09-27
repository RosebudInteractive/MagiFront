import calculateVerticalLevels from './calculateVerticalLevels';
function placeByYLevelLimit(records, limit, checkVisibility = true) {
    return calculateVerticalLevels(records, limit + 1, checkVisibility);
}
export default placeByYLevelLimit;
