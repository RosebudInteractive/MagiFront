import calculateVerticalLevels from './calculateVerticalLevels';
function placeByYLevelLimit(records, limit, checkVisibility = false) {
    return calculateVerticalLevels(records, limit, checkVisibility);
}
export default placeByYLevelLimit;
