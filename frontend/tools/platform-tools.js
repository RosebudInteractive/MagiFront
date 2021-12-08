import platform from "platform";
const getIOSVersion = () => {
    if (platform && platform.os && platform.os.family === "iOS") {
        const osVersion = platform.os.version
            ? platform.os.version.split('.')
            : undefined;
        return osVersion ? +osVersion[0] : undefined;
    }
    else {
        return undefined;
    }
};
export const PlatformTool = {
    timeline: {
        isDeprecatedBrowser: () => {
            const iosVersion = getIOSVersion() || 0;
            return !!iosVersion && (iosVersion < 14);
        },
        isUnsupportedBrowser: () => {
            return platform && platform.name === 'IE';
        }
    }
};
