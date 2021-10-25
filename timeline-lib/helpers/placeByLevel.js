import calculateVerticalLevels from './calculateVerticalLevels';
function placeByYLevelLimit(records, limit, checkVisibility = true) {
    return calculateVerticalLevels(records, limit, checkVisibility);
}
export default placeByYLevelLimit;
