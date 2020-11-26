import {NestedPlayer} from "tools/player/nested-player"

function notifier(object){
    return function(target) {
        target.notifier = object
    }
}

@notifier()
export default class AdmNestedPlayer extends NestedPlayer{}