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
    custom: 1,
    course: 2,
    lesson: 3
};

exports.NotifRecipientType = {
    topic: 1,
    endPoint: 2
};

exports.NotifRecipientStatus = {
    pending: 1,
    ok: 2,
    error: 3
};

exports.NotifCallStatus = {
    pending: 1,
    ok: 2,
    error: 3
};
