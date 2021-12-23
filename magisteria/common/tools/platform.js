import Platform from "platform";

export const isMobilePlatform = () => {
    return (Platform.os.family === "Android") || isMobileAppleDevice() || (Platform.os.family === "Windows Phone")
}

export const isSafariOnMac = () => {
    return (Platform.os.family === "OS X") && (Platform.name === "Safari")
}

// Такая проверка добавлена для того чтобы обработать настройку "Запрос настольного веб-сайта"
// Так как при ее включении сафари определяется как десктопный с ос mac OS X 10.15
export const isIOSWithEnabledDesktopBrowser = () => {
    const _ua = window.navigator.userAgent.toLowerCase();

    return _ua.indexOf('macintosh') > -1 && 'ontouchend' in document
}

export const isMobileAppleDevice = () => {
    const _isTrueIOS = Platform.os.family === "iOS"

    return _isTrueIOS || isIOSWithEnabledDesktopBrowser()
}

export const isIOS13 = () => {
    if (Platform.os.family === "iOS") {
        let _version = Platform.os.version.split('.')
        return +_version[0] > 12
    } else {
        return false
    }
}

export const getCurrencySign = () => {
    if (Platform.os.family === "Android") {
        let _version = Platform.os.version.split('.')
        if (+_version[0] < 5) {
            return "Р"
        }
    }

    // Баг отображнения знака рубля после обновления до 13 версии
    if (isIOS13()) {
        return "Р"
    }

    if (isIOSWithEnabledDesktopBrowser()) {
        return "Р"
    }

    return "₽"
}