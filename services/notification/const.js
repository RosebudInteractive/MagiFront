'use strict';

exports.ApplicationType = {
    ios: 1,
    android: 2
};

exports.NotificationType = {
    bookmark: 1,
    new: 2
};

exports.NotifDeliveryType = {
    app: 1,
    email: 2
};

exports.NotificationTopicType = {
    course: 1,
    newCourse: 2
};

exports.AllowedNotifDelivery = {
    bookmark: {
        app: 1
    },
    new: {
        app: 2
    }
};

exports.NotificationMsgType = {
    Custom: 1,
    Course: 2,
    Lesson: 3
};

exports.NotifRecipientType = {
    Topic: 1,
    Endpoint: 2
};

exports.NotifRecipientStatus = {
    Pending: 1,
    Ok: 2,
    Error: 3
};

exports.NotifCallStatus = {
    Pending: 1,
    Ok: 2,
    Error: 3
};
