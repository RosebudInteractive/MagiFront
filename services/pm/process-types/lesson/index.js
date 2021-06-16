'use strict';

exports.structure = {
    Name: "Lesson Process Proto ver. 4.0",
    ProcessFields: {
        "AudioIniURL": {
            "caption": "Исходный звук",
            "type": "string"
        },
        "AudioIniComment": {
            "caption": "Состояние записи",
            "type": "string"
        },
        "InstrToAudioEdt": {
            "caption": "Указания к обработке звука",
            "type": "string"
        },
        "AudioProcURL": {
            "caption": "Обработанный звук",
            "type": "string"
        },
        "TranscriptURL": {
            "caption": "Транскрипт",
            "type": "string"
        },
        "PicDescriptionURL": {
            "caption": "Идеи для иллюстрирования",
            "type": "string"
        },
        "PicSrcURL": {
            "caption": "Источники иллюстраций",
            "type": "string"
        },
        "PicAuthorURL": {
            "caption": "Картинки от автора",
            "type": "string"
        },
        "PicFinalURL": {
            "caption": "Готовые иллюстрации",
            "type": "string"
        },
        "TechTransTiterURL": {
            "caption": "Техническая стенограмма",
            "type": "string"
        },
        "TechTransEditURL": {
            "caption": "ТС отредактированная",
            "type": "string"
        },
        "RefsURL": {
            "caption": "Список литературы",
            "type": "string"
        },
        "AudioFinalURL": {
            "caption": "Проверенный звук",
            "type": "string"
        },
        "AudioNotes": {
            "caption": "Замечания к обработке звука",
            "type": "string"
        },
        "TechTransTimeURL": {
            "caption": "Тайм-коды",
            "type": "string"
        },
        "TechTransMusicURL": {
            "caption": "ТС - роспись музыки",
            "type": "string"
        },
        "TechTransMusicResultURL": {
            "caption": "ТС с музыкой",
            "type": "string"
        },
        "AllCompsFinalURL": {
            "caption": "Готовые компоненты",
            "type": "string"
        }
    },
    Elements: [
        {
            Name: "Звук",
            ViewFields: [
                "AudioIniURL",
                "AudioIniComment",
                "InstrToAudioEdt",
                "AudioProcURL",
                "AudioFinalURL",
                "AudioNotes"
            ],
            WriteFields: {
                "Зарегистрировать запись": [
                    "AudioIniURL",
                    "AudioIniComment"
                ],
                "Обработать звук": [
                    "AudioIniURL",
                    "AudioIniComment",
                    "InstrToAudioEdt"
                ],
                "Выложить отредактированный звук": [
                    "AudioProcURL"
                ]
            }
        },
        {
            Name: "Транскрипт",
            ViewFields: [
                "TranscriptURL",
                "AudioProcURL"
            ],
            WriteFields: {
                "Сделать расшифровку": [
                    "AudioProcURL"
                ],
                "Сдать транскрипт": [
                    "TranscriptURL"
                ]
            }
        },
        {
            Name: "Иллюстрации",
            ViewFields: [
                "TranscriptURL",
                "PicDescriptionURL",
                "PicSrcURL",
                "PicAuthorURL",
                "PicFinalURL",
                "TechTransTiterURL"
            ],
            WriteFields: {
                "Передать иллюстрации от автора": [
                    "PicAuthorURL",
                    "PicDescriptionURL"
                ],
                "Отправить на иллюстрирование": [
                    "TranscriptURL",
                    "PicDescriptionURL",
                    "PicSrcURL"
                ],
                "Сдать подобранные иллюстрации": [
                    "PicDescriptionURL",
                    "PicSrcURL",
                    "PicFinalURL"
                ],
                "Сдать иллюстрации": [
                    "PicDescriptionURL",
                    "PicSrcURL",
                    "TechTransTiterURL"
                ],
                "Проверить иллюстрации": [
                    "PicDescriptionURL",
                    "PicSrcURL",
                    "PicFinalURL",
                    "TechTransTiterURL"
                ]
            }
        },
        {
            Name: "Техническая стенограмма",
            ViewFields: [
                "TechTransTiterURL",
                "TechTransEditURL",
                "TechTransTimeURL",
                "TechTransMusicURL",
                "TechTransMusicResultURL",
                "RefsURL",
                "AudioFinalURL",
                "AudioProcURL",
                "AudioNotes"
            ],
            WriteFields: {
                "Отредактировать ТС": [
                    "TechTransEditURL"
                ],
                "Запросить роспись музыки": [
                    "TechTransEditURL"
                ],
                "Расставить тайм-коды": [
                    "AudioProcURL",
                    "TechTransEditURL"
                ],
                "Сдать тайм-коды": [
                    "AudioFinalURL",
                    "AudioNotes",
                    "TechTransTimeURL"
                ],
                "Сдать музыку и коды": [
                    "AudioFinalURL",
                    "AudioNotes",
                    "TechTransMusicResultURL"
                ]
            }
        },
        {
            Name: "Список литературы",
            ViewFields: [
                "RefsURL",
                "TechTransTiterURL",
                "TechTransEditURL"
            ],
            WriteFields: {
                "Добавить литературу": [
                    "RefsURL",
                    "TechTransEditURL"
                ]
            }
        },
        {
            Name: "Готовые компоненты",
            ViewFields: [
                "AllCompsFinalURL",
                "AudioIniURL",
                "AudioIniComment",
                "InstrToAudioEdt",
                "AudioProcURL",
                "AudioFinalURL",
                "AudioNotes",
                "TranscriptURL",
                "PicDescriptionURL",
                "PicSrcURL",
                "PicAuthorURL",
                "PicFinalURL",
                "TechTransTiterURL",
                "TechTransEditURL",
                "TechTransTimeURL",
                "TechTransMusicURL",
                "TechTransMusicResultURL",
                "RefsURL"
            ],
            WriteFields: {
                "Финализировать": [
                    "AllCompsFinalURL"
                ]
            }
        }
    ]

}

async function process_1(pm, p_id, supervisor_id, elements, data, options) {
    // Процесс №1 (без музыки и без картинок автора)
    // Задача #1
    let res = await pm.newTask({
        "Name": "Регистрация новой записи",
        "ProcessId": p_id,
        "ExecutorId": supervisor_id,
        "Description": "",
        "ElementId": elements["Звук"] ? elements["Звук"].Id : null,
        "WriteFieldSet": "Зарегистрировать запись",
        "IsElemReady": false,
        "Dependencies": []
    }, options);
    // Задача #2
    res = await pm.newTask({
        "Name": "Редактура звука - постановка задачи",
        "ProcessId": p_id,
        "ExecutorId": supervisor_id,
        "Description": "",
        "ElementId": elements["Звук"] ? elements["Звук"].Id : null,
        "WriteFieldSet": "Обработать звук",
        "IsElemReady": false,
        "Dependencies": [res.id]
    }, options);
    // Задача #3
    res = await pm.newTask({
        "Name": "Редактура звука - выполнение задачи",
        "ProcessId": p_id,
        "ExecutorId": data.ExecutorSound ? data.ExecutorSound : null,
        "Description": "Сделайте, пожалуйста, обработку звука.",
        "ElementId": elements["Звук"] ? elements["Звук"].Id : null,
        "WriteFieldSet": "Выложить отредактированный звук",
        "IsElemReady": true,
        "Dependencies": [res.id]
    }, options);
    // Задача #4
    res = await pm.newTask({
        "Name": "Транскрипт - постановка задачи",
        "ProcessId": p_id,
        "ExecutorId": supervisor_id,
        "Description": "",
        "ElementId": elements["Транскрипт"] ? elements["Транскрипт"].Id : null,
        "WriteFieldSet": "Сделать расшифровку",
        "IsElemReady": false,
        "Dependencies": [res.id]
    }, options);
    // Задача #5
    res = await pm.newTask({
        "Name": "Транскрипт - выполнение задачи",
        "ProcessId": p_id,
        "ExecutorId": data.ExecutorTranscript ? data.ExecutorTranscript : null,
        "Description": "Расшифруйте, пожалуйста, следующую звукозапись.",
        "ElementId": elements["Транскрипт"] ? elements["Транскрипт"].Id : null,
        "WriteFieldSet": "Сдать транскрипт",
        "IsElemReady": true,
        "Dependencies": [res.id]
    }, options);
    // Задача #6
    let supervisor_pic = elements["Иллюстрации"] && elements["Иллюстрации"].SupervisorId ? elements["Иллюстрации"].SupervisorId : null;
    res = await pm.newTask({
        "Name": "Иллюстрирование с поиском картинок - постановка задачи",
        "ProcessId": p_id,
        "ExecutorId": data.ExecutorPicturesControl ? data.ExecutorPicturesControl : supervisor_pic,
        "Description": "",
        "ElementId": elements["Иллюстрации"] ? elements["Иллюстрации"].Id : null,
        "WriteFieldSet": "Отправить на иллюстрирование",
        "IsElemReady": false,
        "Dependencies": [res.id]
    }, options);
    // Задача #7
    res = await pm.newTask({
        "Name": "Иллюстрирование - выполнение задачи",
        "ProcessId": p_id,
        "ExecutorId": data.ExecutorPictures ? data.ExecutorPictures : supervisor_pic,
        "Description": "Возьмите, пожалуйста, на иллюстрирование следующие материалы.",
        "ElementId": elements["Иллюстрации"] ? elements["Иллюстрации"].Id : null,
        "WriteFieldSet": "Сдать подобранные иллюстрации",
        "IsElemReady": false,
        "Dependencies": [res.id]
    }, options);
    // Задача #8
    res = await pm.newTask({
        "Name": "Иллюстрирование - проверка",
        "ProcessId": p_id,
        "ExecutorId": data.ExecutorPicturesControl ? data.ExecutorPicturesControl : supervisor_pic,
        "Description": "",
        "ElementId": elements["Иллюстрации"] ? elements["Иллюстрации"].Id : null,
        "WriteFieldSet": "Проверить иллюстрации",
        "IsElemReady": true,
        "Dependencies": [res.id]
    }, options);
    // Задача #9
    res = await pm.newTask({
        "Name": "Редактура-корректура - выполнение задачи",
        "ProcessId": p_id,
        "ExecutorId": data.ExecutorTranscript ? data.ExecutorTranscript : null,
        "Description": "Возьмите, пожалуйста, на редактуру следующий текст.",
        "ElementId": elements["Техническая стенограмма"] ? elements["Техническая стенограмма"].Id : null,
        "WriteFieldSet": "Отредактировать ТС",
        "IsElemReady": false,
        "Dependencies": [res.id]
    }, options);
    // Задача #10
    res = await pm.newTask({
        "Name": "Список материалов и литературы - запрос автору",
        "ProcessId": p_id,
        "ExecutorId": data.ExecutorLiterature ? data.ExecutorLiterature : null,
        "Description": "",
        "ElementId": elements["Список литературы"] ? elements["Список литературы"].Id : supervisor_id,
        "IsElemReady": false,
        "Dependencies": [res.id]
    }, options);
    // Задача #11
    res = await pm.newTask({
        "Name": "Список материалов и литературы - добавление списка литературы",
        "ProcessId": p_id,
        "ExecutorId": data.ExecutorLiterature ? data.ExecutorLiterature : supervisor_id,
        "Description": "",
        "ElementId": elements["Список литературы"] ? elements["Список литературы"].Id : null,
        "WriteFieldSet": "Добавить литературу",
        "IsElemReady": true,
        "Dependencies": [res.id]
    }, options);
    // Задача #12
    res = await pm.newTask({
        "Name": "Контроль звука и расстановка тайм-кодов - постановка задачи",
        "ProcessId": p_id,
        "ExecutorId": supervisor_id,
        "Description": "",
        "ElementId": elements["Техническая стенограмма"] ? elements["Техническая стенограмма"].Id : null,
        "WriteFieldSet": "Расставить тайм-коды",
        "IsElemReady": false,
        "Dependencies": [res.id]
    }, options);
    // Задача #13
    res = await pm.newTask({
        "Name": "Контроль звука и расстановка тайм-кодов - исполнение",
        "ProcessId": p_id,
        "ExecutorId": data.ExecutorSoundControl ? data.ExecutorSoundControl : null,
        "Description": "Сделайте, пожалуйста, расстановку тайм-кодов для следующей записи.",
        "ElementId": elements["Техническая стенограмма"] ? elements["Техническая стенограмма"].Id : null,
        "WriteFieldSet": "Сдать тайм-коды",
        "IsElemReady": true,
        "Dependencies": [res.id]
    }, options);
    // Задача #14
    res = await pm.newTask({
        "Name": "Ознакомиться с замечаниями к обработке звука",
        "ProcessId": p_id,
        "ExecutorId": data.ExecutorSound ? data.ExecutorSound : null,
        "Description": "",
        "ElementId": elements["Звук"] ? elements["Звук"].Id : null,
        "IsElemReady": false,
        "Dependencies": [res.id]
    }, options);
    // Задача #15
    res = await pm.newTask({
        "Name": "Финализация",
        "ProcessId": p_id,
        "ExecutorId": data.ExecutorReadyComponents ? data.ExecutorReadyComponents : supervisor_id,
        "Description": "Выполните, пожалуйста, финализацию следующего эпизода.",
        "ElementId": elements["Готовые компоненты"] ? elements["Готовые компоненты"].Id : supervisor_id,
        "WriteFieldSet": "Финализировать",
        "IsElemReady": true,
        "Dependencies": [res.id]
    }, options);
}

async function process_2(pm, p_id, supervisor_id, elements, data, options) {
    // Процесс №2 (с картинками автора и без музыки)
    // Задача #1
    let res = await pm.newTask({
        "Name": "Регистрация новой записи",
        "ProcessId": p_id,
        "ExecutorId": supervisor_id,
        "Description": "",
        "ElementId": elements["Звук"] ? elements["Звук"].Id : null,
        "WriteFieldSet": "Зарегистрировать запись",
        "IsElemReady": false,
        "Dependencies": []
    }, options);
    // Задача #2
    res = await pm.newTask({
        "Name": "Редактура звука - постановка задачи",
        "ProcessId": p_id,
        "ExecutorId": supervisor_id,
        "Description": "",
        "ElementId": elements["Звук"] ? elements["Звук"].Id : null,
        "WriteFieldSet": "Обработать звук",
        "IsElemReady": false,
        "Dependencies": [res.id]
    }, options);
    // Задача #3
    res = await pm.newTask({
        "Name": "Редактура звука - выполнение задачи",
        "ProcessId": p_id,
        "ExecutorId": data.ExecutorSound ? data.ExecutorSound : null,
        "Description": "Сделайте, пожалуйста, обработку звука.",
        "ElementId": elements["Звук"] ? elements["Звук"].Id : null,
        "WriteFieldSet": "Выложить отредактированный звук",
        "IsElemReady": true,
        "Dependencies": [res.id]
    }, options);
    // Задача #4
    res = await pm.newTask({
        "Name": "Транскрипт - постановка задачи",
        "ProcessId": p_id,
        "ExecutorId": supervisor_id,
        "Description": "",
        "ElementId": elements["Транскрипт"] ? elements["Транскрипт"].Id : null,
        "WriteFieldSet": "Сделать расшифровку",
        "IsElemReady": false,
        "Dependencies": [res.id]
    }, options);
    // Задача #5
    res = await pm.newTask({
        "Name": "Транскрипт - выполнение задачи",
        "ProcessId": p_id,
        "ExecutorId": data.ExecutorTranscript ? data.ExecutorTranscript : null,
        "Description": "Расшифруйте, пожалуйста, следующую звукозапись.",
        "ElementId": elements["Транскрипт"] ? elements["Транскрипт"].Id : null,
        "WriteFieldSet": "Сдать транскрипт",
        "IsElemReady": true,
        "Dependencies": [res.id]
    }, options);
    // Задача #6
    let supervisor_pic = elements["Иллюстрации"] && elements["Иллюстрации"].SupervisorId ? elements["Иллюстрации"].SupervisorId : null;
    res = await pm.newTask({
        "Name": "Иллюстрирование с картинками от автора - постановка задачи",
        "ProcessId": p_id,
        "ExecutorId": data.ExecutorPicturesControl ? data.ExecutorPicturesControl : supervisor_pic,
        "Description": "",
        "ElementId": elements["Иллюстрации"] ? elements["Иллюстрации"].Id : null,
        "WriteFieldSet": "Передать иллюстрации от автора",
        "IsElemReady": false,
        "Dependencies": [res.id]
    }, options);
    // Задача #7
    res = await pm.newTask({
        "Name": "Иллюстрирование - выполнение задачи",
        "ProcessId": p_id,
        "ExecutorId": data.ExecutorPictures ? data.ExecutorPictures : supervisor_pic,
        "Description": "Возьмите, пожалуйста, на иллюстрирование следующие материалы.",
        "ElementId": elements["Иллюстрации"] ? elements["Иллюстрации"].Id : null,
        "WriteFieldSet": "Сдать иллюстрации",
        "IsElemReady": false,
        "Dependencies": [res.id]
    }, options);
    // Задача #8
    res = await pm.newTask({
        "Name": "Иллюстрирование - проверка",
        "ProcessId": p_id,
        "ExecutorId": data.ExecutorPicturesControl ? data.ExecutorPicturesControl : supervisor_pic,
        "Description": "",
        "ElementId": elements["Иллюстрации"] ? elements["Иллюстрации"].Id : null,
        "WriteFieldSet": "Проверить иллюстрации",
        "IsElemReady": true,
        "Dependencies": [res.id]
    }, options);
    // Задача #9
    res = await pm.newTask({
        "Name": "Редактура-корректура - выполнение задачи",
        "ProcessId": p_id,
        "ExecutorId": data.ExecutorTranscript ? data.ExecutorTranscript : null,
        "Description": "Возьмите, пожалуйста, на редактуру следующий текст.",
        "ElementId": elements["Техническая стенограмма"] ? elements["Техническая стенограмма"].Id : null,
        "WriteFieldSet": "Отредактировать ТС",
        "IsElemReady": false,
        "Dependencies": [res.id]
    }, options);
    // Задача #10
    res = await pm.newTask({
        "Name": "Список материалов и литературы - запрос автору",
        "ProcessId": p_id,
        "ExecutorId": data.ExecutorLiterature ? data.ExecutorLiterature : null,
        "Description": "",
        "ElementId": elements["Список литературы"] ? elements["Список литературы"].Id : supervisor_id,
        "IsElemReady": false,
        "Dependencies": [res.id]
    }, options);
    // Задача #11
    res = await pm.newTask({
        "Name": "Список материалов и литературы - добавление списка литературы",
        "ProcessId": p_id,
        "ExecutorId": data.ExecutorLiterature ? data.ExecutorLiterature : supervisor_id,
        "Description": "",
        "ElementId": elements["Список литературы"] ? elements["Список литературы"].Id : null,
        "WriteFieldSet": "Добавить литературу",
        "IsElemReady": true,
        "Dependencies": [res.id]
    }, options);
    // Задача #12
    res = await pm.newTask({
        "Name": "Контроль звука и расстановка тайм-кодов - постановка задачи",
        "ProcessId": p_id,
        "ExecutorId": supervisor_id,
        "Description": "",
        "ElementId": elements["Техническая стенограмма"] ? elements["Техническая стенограмма"].Id : null,
        "WriteFieldSet": "Расставить тайм-коды",
        "IsElemReady": false,
        "Dependencies": [res.id]
    }, options);
    // Задача #13
    res = await pm.newTask({
        "Name": "Контроль звука и расстановка тайм-кодов - исполнение",
        "ProcessId": p_id,
        "ExecutorId": data.ExecutorSoundControl ? data.ExecutorSoundControl : null,
        "Description": "Сделайте, пожалуйста, расстановку тайм-кодов для следующей записи.",
        "ElementId": elements["Техническая стенограмма"] ? elements["Техническая стенограмма"].Id : null,
        "WriteFieldSet": "Сдать тайм-коды",
        "IsElemReady": true,
        "Dependencies": [res.id]
    }, options);
    // Задача #14
    res = await pm.newTask({
        "Name": "Финализация",
        "ProcessId": p_id,
        "ExecutorId": data.ExecutorReadyComponents ? data.ExecutorReadyComponents : supervisor_id,
        "Description": "Выполните, пожалуйста, финализацию следующего эпизода.",
        "ElementId": elements["Готовые компоненты"] ? elements["Готовые компоненты"].Id : supervisor_id,
        "WriteFieldSet": "Финализировать",
        "IsElemReady": true,
        "Dependencies": [res.id]
    }, options);
}

async function process_3(pm, p_id, supervisor_id, elements, data, options) {
    // Процесс №3 (с музыкой и без картинок автора)
    // Задача #1
    let res = await pm.newTask({
        "Name": "Регистрация новой записи",
        "ProcessId": p_id,
        "ExecutorId": supervisor_id,
        "Description": "",
        "ElementId": elements["Звук"] ? elements["Звук"].Id : null,
        "WriteFieldSet": "Зарегистрировать запись",
        "IsElemReady": false,
        "Dependencies": []
    }, options);
    // Задача #2
    res = await pm.newTask({
        "Name": "Редактура звука - постановка задачи",
        "ProcessId": p_id,
        "ExecutorId": supervisor_id,
        "Description": "",
        "ElementId": elements["Звук"] ? elements["Звук"].Id : null,
        "WriteFieldSet": "Обработать звук",
        "IsElemReady": false,
        "Dependencies": [res.id]
    }, options);
    // Задача #3
    res = await pm.newTask({
        "Name": "Редактура звука - выполнение задачи",
        "ProcessId": p_id,
        "ExecutorId": data.ExecutorSound ? data.ExecutorSound : null,
        "Description": "Сделайте, пожалуйста, обработку звука.",
        "ElementId": elements["Звук"] ? elements["Звук"].Id : null,
        "WriteFieldSet": "Выложить отредактированный звук",
        "IsElemReady": true,
        "Dependencies": [res.id]
    }, options);
    // Задача #4
    res = await pm.newTask({
        "Name": "Транскрипт - постановка задачи",
        "ProcessId": p_id,
        "ExecutorId": supervisor_id,
        "Description": "",
        "ElementId": elements["Транскрипт"] ? elements["Транскрипт"].Id : null,
        "WriteFieldSet": "Сделать расшифровку",
        "IsElemReady": false,
        "Dependencies": [res.id]
    }, options);
    // Задача #5
    res = await pm.newTask({
        "Name": "Транскрипт - выполнение задачи",
        "ProcessId": p_id,
        "ExecutorId": data.ExecutorTranscript ? data.ExecutorTranscript : null,
        "Description": "Расшифруйте, пожалуйста, следующую звукозапись.",
        "ElementId": elements["Транскрипт"] ? elements["Транскрипт"].Id : null,
        "WriteFieldSet": "Сдать транскрипт",
        "IsElemReady": true,
        "Dependencies": [res.id]
    }, options);
    // Задача #6
    let supervisor_pic = elements["Иллюстрации"] && elements["Иллюстрации"].SupervisorId ? elements["Иллюстрации"].SupervisorId : null;
    res = await pm.newTask({
        "Name": "Иллюстрирование с поиском картинок - постановка задачи",
        "ProcessId": p_id,
        "ExecutorId": data.ExecutorPicturesControl ? data.ExecutorPicturesControl : supervisor_pic,
        "Description": "",
        "ElementId": elements["Иллюстрации"] ? elements["Иллюстрации"].Id : null,
        "WriteFieldSet": "Отправить на иллюстрирование",
        "IsElemReady": false,
        "Dependencies": [res.id]
    }, options);
    // Задача #7
    res = await pm.newTask({
        "Name": "Иллюстрирование - выполнение задачи",
        "ProcessId": p_id,
        "ExecutorId": data.ExecutorPictures ? data.ExecutorPictures : supervisor_pic,
        "Description": "Возьмите, пожалуйста, на иллюстрирование следующие материалы.",
        "ElementId": elements["Иллюстрации"] ? elements["Иллюстрации"].Id : null,
        "WriteFieldSet": "Сдать подобранные иллюстрации",
        "IsElemReady": false,
        "Dependencies": [res.id]
    }, options);
    // Задача #8
    res = await pm.newTask({
        "Name": "Иллюстрирование - проверка",
        "ProcessId": p_id,
        "ExecutorId": data.ExecutorPicturesControl ? data.ExecutorPicturesControl : supervisor_pic,
        "Description": "",
        "ElementId": elements["Иллюстрации"] ? elements["Иллюстрации"].Id : null,
        "WriteFieldSet": "Проверить иллюстрации",
        "IsElemReady": true,
        "Dependencies": [res.id]
    }, options);
    // Задача #9
    res = await pm.newTask({
        "Name": "Редактура-корректура - выполнение задачи",
        "ProcessId": p_id,
        "ExecutorId": data.ExecutorTranscript ? data.ExecutorTranscript : null,
        "Description": "Возьмите, пожалуйста, на редактуру следующий текст.",
        "ElementId": elements["Техническая стенограмма"] ? elements["Техническая стенограмма"].Id : null,
        "WriteFieldSet": "Отредактировать ТС",
        "IsElemReady": false,
        "Dependencies": [res.id]
    }, options);
    // Задача #10
    res = await pm.newTask({
        "Name": "Список материалов и литературы - запрос автору",
        "ProcessId": p_id,
        "ExecutorId": data.ExecutorLiterature ? data.ExecutorLiterature : null,
        "Description": "",
        "ElementId": elements["Список литературы"] ? elements["Список литературы"].Id : supervisor_id,
        "IsElemReady": false,
        "Dependencies": [res.id]
    }, options);
    // Задача #11
    res = await pm.newTask({
        "Name": "Список материалов и литературы - добавление списка литературы",
        "ProcessId": p_id,
        "ExecutorId": data.ExecutorLiterature ? data.ExecutorLiterature : supervisor_id,
        "Description": "",
        "ElementId": elements["Список литературы"] ? elements["Список литературы"].Id : null,
        "WriteFieldSet": "Добавить литературу",
        "IsElemReady": true,
        "Dependencies": [res.id]
    }, options);
    // Задача #12
    res = await pm.newTask({
        "Name": "Контроль звука, монтаж музыки и расстановка тайм-кодов - запрос автору",
        "ProcessId": p_id,
        "ExecutorId": supervisor_id,
        "Description": "",
        "ElementId": elements["Техническая стенограмма"] ? elements["Техническая стенограмма"].Id : null,
        "WriteFieldSet": "Запросить роспись музыки",
        "IsElemReady": false,
        "Dependencies": [res.id]
    }, options);
    // Задача #13
    res = await pm.newTask({
        "Name": "Контроль звука и расстановка тайм-кодов - постановка задачи",
        "ProcessId": p_id,
        "ExecutorId": supervisor_id,
        "Description": "",
        "ElementId": elements["Техническая стенограмма"] ? elements["Техническая стенограмма"].Id : null,
        "WriteFieldSet": "Расставить тайм-коды",
        "IsElemReady": false,
        "Dependencies": [res.id]
    }, options);
    // Задача #14
    res = await pm.newTask({
        "Name": "Контроль звука, монтаж музыки и расстановка тайм-кодов - исполнение",
        "ProcessId": p_id,
        "ExecutorId": data.ExecutorSoundControl ? data.ExecutorSoundControl : null,
        "Description": "Сделайте, пожалуйста, расстановку тайм-кодов для следующей записи.",
        "ElementId": elements["Техническая стенограмма"] ? elements["Техническая стенограмма"].Id : null,
        "WriteFieldSet": "Сдать музыку и коды",
        "IsElemReady": true,
        "Dependencies": [res.id]
    }, options);
    // Задача #15
    res = await pm.newTask({
        "Name": "Финализация",
        "ProcessId": p_id,
        "ExecutorId": data.ExecutorReadyComponents ? data.ExecutorReadyComponents : supervisor_id,
        "Description": "Выполните, пожалуйста, финализацию следующего эпизода.",
        "ElementId": elements["Готовые компоненты"] ? elements["Готовые компоненты"].Id : supervisor_id,
        "WriteFieldSet": "Финализировать",
        "IsElemReady": true,
        "Dependencies": [res.id]
    }, options);
}

exports.script = async (pm, p_id, supervisor_id, elements, data, options) => {
    let result;
    if ((!data.UseAuthorPictures) && (!data.UseMusic))
        result = process_1(pm, p_id, supervisor_id, elements, data, options)
    else
        if (data.UseAuthorPictures && (!data.UseMusic))
            return process_2(pm, p_id, supervisor_id, elements, data, options)
        else
            if ((!data.UseAuthorPictures) && data.UseMusic)
                return process_3(pm, p_id, supervisor_id, elements, data, options)
            else
                throw new Error(`Недопустимый тип процесса: картинки автора - ${data.UseAuthorPictures ? 'да' : 'нет'}, музыка -  ${data.UseMusic ? 'да' : 'нет'}.`);
    return result;
}