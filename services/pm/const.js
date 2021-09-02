'use strict';

exports.NotificationType = {
    TaskCanStart: 1,
    TaskQuestionResolved: 2,
    TaskQuestionRaised: 3,
    TaskAssigned: 4
};

exports.NotificationParams = {
    ParamName: "notification"
};

exports.ProcessState = {
    Draft: 1,
    Executing: 2,
    Finished: 3
};

exports.ProcessStateStr = {
    1: "Черновик",
    2: "Выполняется",
    3: "Завершен"
};

exports.TaskState = {
    Draft: 1,
    ReadyToStart: 2,
    InProgess: 3,
    Alert: 4,
    Finished: 5
};

exports.TaskStateStr = {
    1: "В ожидании",
    2: "Можно приступать",
    3: "В процессе",
    4: "Вопрос",
    5: "Завершена"
};

exports.ElemState = {
    NotReady: 1,
    Partly: 2,
    Ready: 3,
    InProgess: 4
};
