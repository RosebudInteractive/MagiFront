import platform from "platform";

const getIOSVersion = (): number | undefined => {
  if (platform?.os?.family === "iOS") {
    const osVersion = platform?.os?.version?.split('.')
    return osVersion ? +osVersion[0] : undefined
  } else {
    return undefined
  }
}

export const isDeprecatedBrowser = (): boolean => {
  const iosVersion: number = getIOSVersion() || 0;

  return !!iosVersion && (iosVersion < 14);
}

export const isUnsupportedBrowser = (): boolean => {
  return platform?.name === 'IE'
}

