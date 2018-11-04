'use strict';
process.env["NODE_CONFIG_DIR"] = "../config/";
const config = require('config');

const schedule = require('node-schedule');
const { magisteryConfig } = require("../etc/config")
const { DbEngineInit } = require("../database/dbengine-init");

new DbEngineInit(magisteryConfig);
const { DbUtils } = require('../database/db-utils');
const { getTimeStr } = require('../utils');

let activeTasks = {};
let dfmt = { h: "h ", m: "m ", s: "s", ms: true };

function getStatStr(taskDsc, duration, dfmt, isErr) {
    let isFirst = !taskDsc.num;
    taskDsc.num = taskDsc.num ? taskDsc.num : 0;
    taskDsc.err = taskDsc.err ? taskDsc.err : 0;
    if (isErr)
        taskDsc.err++;
    taskDsc.num++;
    taskDsc.max = (isFirst || (duration > taskDsc.max)) ? duration : taskDsc.max;
    taskDsc.min = (isFirst || (duration < taskDsc.min)) ? duration : taskDsc.min;
    taskDsc.avg = isFirst ? duration : (((taskDsc.num - 1) * taskDsc.avg + duration) / taskDsc.num);
    return `Duration: ${DbUtils.fmtDuration(duration, dfmt)} (` +
        `Avg: [${DbUtils.fmtDuration(taskDsc.avg, dfmt)}] ` +
        `Min: [${DbUtils.fmtDuration(taskDsc.min, dfmt)}] ` +
        `Max: [${DbUtils.fmtDuration(taskDsc.max, dfmt)}] ` +
        `Tot: ${taskDsc.num} `+
        `Errors: ${taskDsc.err})`;
}

Promise.resolve()
    .then(() => {
        let keys = Object.keys(activeTasks);
        if (keys.length === 0) {
            console.error("There are no active tasks!");
            process.exit(1);
        }
    });

if (config.has("tasks")) {
    let tasks = config.tasks;
    if (tasks.length > 0) {
        for (let i = 0; i < tasks.length; i++) {
            if (tasks[i].disabled) {
                console.warn(`${getTimeStr()} ===> WARNING: Task [${i}]: "${tasks[i].name}" is disabled.`);
                continue;
            }
            let getTaskProcessor = require(tasks[i].module);
            if (typeof (getTaskProcessor) === "function") {
                switch (tasks[i].type) {
                    case "scheduled-task":
                        if (tasks[i].schedule) {
                            let taskId = i + "";
                            let taskName = tasks[i].name;
                            let taskRun = getTaskProcessor(taskName, tasks[i].options);
                            let task = schedule.scheduleJob(tasks[i].schedule, (fireDate) => {
                                let taskDsc = activeTasks[taskId];
                                if (taskDsc) {
                                    if (!taskDsc.isRunning) {
                                        let startDt = new Date();
                                        taskDsc.isRunning = true;
                                        delete taskDsc.error;
                                        taskDsc.lastStart = startDt;
                                        console.log(`${getTimeStr(startDt)} ===> "${taskName}" started (scheduled at ${getTimeStr(fireDate)}).`);
                                        taskRun(fireDate)
                                            .then(() => {
                                                let finDt = new Date();
                                                taskDsc.isRunning = false;
                                                taskDsc.lastFinish = finDt;
                                                let dt = (finDt - startDt) / 1000;
                                                console.log(`${getTimeStr(finDt)} <=== "${taskName}" finished. ${getStatStr(taskDsc, dt, dfmt)}.`);
                                            })
                                            .catch((err) => {
                                                let finDt = new Date();
                                                taskDsc.isRunning = false;
                                                taskDsc.lastFinish = finDt;
                                                taskDsc.error = err;
                                                let dt = (finDt - startDt) / 1000;
                                                console.error(`${getTimeStr(finDt)} #### "${taskName}" failed. ${getStatStr(taskDsc, dt, dfmt, true)}. Error: ${err}`);
                                            });
                                    }
                                    else
                                        console.error(`${getTimeStr()} #### Task "${taskDsc.taskName}" (id=${taskId}) is already running. Ignored.`);
                                }
                                else
                                    console.error(`${getTimeStr()} ===> Task id=${taskId} doesn't exist. Ignored.`);
                            });
                            activeTasks[taskId] = {
                                taskName: taskName,
                                task: task,
                                isRunning: false,
                            };
                            console.log(`${getTimeStr()} ===> Task "${tasks[i].name}" has been scheduled.`);
                        }
                        else
                            throw new Error(`Missing schedule of task [${i}]: "${tasks[i].name}".`);
                        break;
                    default:
                        throw new Error(`Unsupported task type: "${tasks[i].type}".`);
                };
            }
            else
                throw new Error(`Invalid module "${tasks[i].module}" type: "${typeof (getTaskProcessor)}".`);
        }
    }
    else
        throw new Error("There are no active tasks!");
}
else
    throw new Error("Tasks aren't configured!");
