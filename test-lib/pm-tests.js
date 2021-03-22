'use strict';
const request = require('request');
const _ = require('lodash');
const BASE_URI = "http://localhost:3000";

async function _createProcess(data, token, host) {
    return new Promise((resolve, reject) => {
        request({
            url: `${host ? host : BASE_URI}/api/pm/process`,
            headers: token ? { "Authorization": "JWT " + token } : undefined,
            json: true,
            method: "POST",
            body: {
                "Name": data.name,
                "StructId": 1,
                "LessonId": 1
            }
        }, (error, res, body) => {
            if (error)
                reject(error)
            else {
                if (res.statusCode !== 200)
                    reject(new Error(`_createProcess:: HTTP StatusCode: ${res.statusCode}`))
                else {
                    resolve(body);
                }
            }                
        }
        );
    });
}

async function _createTask(data, token, host) {
    return new Promise((resolve, reject) => {
        request({
            url: `${host ? host : BASE_URI}/api/pm/task`,
            headers: token ? { "Authorization": "JWT " + token } : undefined,
            json: true,
            method: "POST",
            body: {
                "Name": data.name,
                "ProcessId": data.ProcessId
            }
        }, (error, res, body) => {
            if (error)
                reject(error)
            else {
                if (res.statusCode !== 200)
                    reject(new Error(`_createTask:: HTTP StatusCode: ${res.statusCode}`))
                else {
                    resolve(body);
                }
            }
        }
        );
    });
}

async function _addDep(data, token, host) {
    return new Promise((resolve, reject) => {
        request({
            url: `${host ? host : BASE_URI}/api/pm/task-dep`,
            headers: token ? { "Authorization": "JWT " + token } : undefined,
            json: true,
            method: "POST",
            body: {
                "TaskId": data.dst_id,
                "DepTaskId": data.src_id
            }
        }, (error, res, body) => {
            if (error)
                reject(error)
            else {
                if (res.statusCode !== 200)
                    reject(new Error(`_addDep:: HTTP StatusCode: ${res.statusCode}`))
                else {
                    resolve(body);
                }
            }
        }
        );
    });
}

async function createProcess(data, token, host) {
    let { id: process_id } = await _createProcess(data, token, host);
    if (data && Array.isArray(data.tasks) && (data.tasks.length > 0)) {
        let tasks = {};
        for (let i = 0; i < data.tasks.length; i++){
            let task_data = _.defaultsDeep({ ProcessId: process_id }, data.tasks[i]);
            let { id: task_id } = await _createTask(task_data, token, host);
            tasks[task_data.name] = task_id;
        }
        if (Array.isArray(data.deps) && (data.deps.length > 0)) {
            for (let i = 0; i < data.deps.length; i++) { 
                let src_id = tasks[data.deps[i].src];
                if (!src_id)
                    throw new Error(`Task "${data.deps[i].src}" doesn't exist.`);
                let dst_id = tasks[data.deps[i].dst];
                if (!dst_id)
                    throw new Error(`Task "${data.deps[i].dst}" doesn't exist.`);
                await _addDep({ src_id: src_id, dst_id: dst_id }, token, host);
            }
        }
    }
    return { process_id: process_id };
}
exports.PmTests = {
    createProcess: createProcess
};