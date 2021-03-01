import {appName} from "../config";

/**
 * Constants
 * */
export const moduleName = 'tasks'
const prefix = `${appName}/${moduleName}`

const SHOW_ERROR = `${prefix}/SHOW_ERROR`



/**
 * Action Creators
 * */
export const showErrorMessage = (message) => {
    return {type: SHOW_ERROR, payload: message}
}
