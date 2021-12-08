import platform from "platform";

const getIOSVersion = (): number | undefined => {
  if (platform && platform.os && platform.os.family === "iOS") {
    const osVersion = platform.os.version
      ? platform.os.version.split('.')
      : undefined;
    return osVersion ? +osVersion[0] : undefined
  } else {
    return undefined
  }
}

export const PlatformTool = {
  timeline: {
    isDeprecatedBrowser: (): boolean => {
      const iosVersion: number = getIOSVersion() || 0;

      return !!iosVersion && (iosVersion < 14);
    },
    isUnsupportedBrowser: (): boolean => {
      return platform && platform.name === 'IE'
    }
  }
}
