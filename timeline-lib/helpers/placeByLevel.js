import calculateVerticalLevels from "./calculateVerticalLevels";

const placeByYLevelLimit = function(records, limit, checkVisibility = true){
    return calculateVerticalLevels(records, limit + 1, checkVisibility);
};

export default placeByYLevelLimit;
