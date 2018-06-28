/**
 *
 * @param options {}
 */
export function animate(options, playState) {

    let start = performance.now();
    options.inProgress = true;

    requestAnimationFrame(function animate(time) {
        // timeFraction от 0 до 1
        let timeFraction = (time - start + options.curTime) / options.duration;
        if (timeFraction > 1) timeFraction = 1;
        if (timeFraction < 0) timeFraction = 0;

        // текущее состояние анимации от 0 до 1
        let progress = options.timing(timeFraction);
        // Текущее состояние в заказанных единицах
        let calcProgress = options.from + options.to * progress;
        options.draw(calcProgress);

        if (timeFraction < 1 && !playState.stopped) {
            requestAnimationFrame(animate);
        } else {
            options.inProgress = false;
            if (options.complete) {
                options.complete();
            }
        }

    });

}

export function imageTimingFunc(timeFraction) {
    return timeFraction;
}

export function quad(progress) {
    return progress;
    //return Math.pow(progress, 2);
}

export function makeEaseInOut(timing) {
    return function (timeFraction) {
        if (timeFraction < .5)
            return timing(2 * timeFraction) / 2;
        else
            return (2 - timing(2 * (1 - timeFraction))) / 2;
    }
}
