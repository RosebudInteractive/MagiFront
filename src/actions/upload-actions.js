import {appName} from '../config'

/**
 * Constants
 * */
export const moduleName = 'upload'
const prefix = `${appName}/${moduleName}`

export const START_UPLOAD = `${prefix}/GET_OPTIONS_START`
export const GET_OPTIONS_SUCCESS = `${prefix}/GET_OPTIONS_SUCCESS`
export const GET_OPTIONS_FAIL = `${prefix}/GET_OPTIONS_FAIL`

export const DISABLE_BUTTONS = `${prefix}/DISABLE_BUTTONS`
export const ENABLE_BUTTONS = `${prefix}/ENABLE_BUTTONS`