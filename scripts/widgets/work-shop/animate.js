/**
 *
 * @param options {}
 */
export function animate(options, playState) {

    let start = performance.now();
    let request = {frame: 0};

    request.frame = requestAnimationFrame(function animate(time) {
        // timeFraction от 0 до 1
        let timeFraction = (time - start + options.curTime) / options.duration;
        if (timeFraction > 1) timeFraction = 1;
        if (timeFraction < 0) timeFraction = 0;

        // текущее состояние анимации от 0 до 1
        let progress = options.timing(timeFraction);
        // Текущее состояние в заказанных единицах
        let calcProgress = options.from + options.to * progress;
        options.draw(calcProgress);

        if (timeFraction < 1 && !playState.stopped //&&
            //playState.position >= options.effectStart && playState.position <= options.effectDuration
        ) {
            request.frame = requestAnimationFrame(animate);
        } else {
            cancelAnimationFrame(request.frame);
            if (options.complete) {
                options.complete();
            }
        }

    });

    return request;

}

export function imageTimingFunc(timeFraction) {
    return timeFraction;
}

export function quad(progress) {
    //return progress;
    return Math.pow(progress, 3);
}

export function makeEaseInOut(timing) {
    return function (timeFraction) {
        if (timeFraction < .5)
            return timing(2 * timeFraction) / 2;
        else
            return (2 - timing(2 * (1 - timeFraction))) / 2;
    }
}


/*
background-size: contain;
    position: absolute;
    width: 947px;
    height: 771px;
    background-image: url(https://magisteria.ru/wp-content/uploads/2017/04/Sidyashhij-Budda.-Tailand-XVII-v.-Metropoliten-muzej-Nyu-Jork.jpg);
    background-repeat: no-repeat;
    background-position: 50% 50%;
    transform: scale(1.33941, 1.33941);
 */