import {appName} from '../config'
import {createSelector} from 'reselect'
import {Record} from 'immutable'
import 'whatwg-fetch';
import {checkStatus, parseJSON} from "tools/fetch-tools";
import {all, takeEvery, put, call, select, fork,} from 'redux-saga/effects'
import $ from "jquery";

/**
 * Constants
 * */
export const moduleName = 'app'
const prefix = `${appName}/${moduleName}`

const GET_OPTIONS_REQUEST = `${prefix}/GET_OPTIONS_REQUEST`
const GET_OPTIONS_START = `${prefix}/GET_OPTIONS_START`
const GET_OPTIONS_SUCCESS = `${prefix}/GET_OPTIONS_SUCCESS`
const GET_OPTIONS_FAIL = `${prefix}/GET_OPTIONS_FAIL`
