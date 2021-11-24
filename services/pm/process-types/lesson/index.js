'use strict';

exports.structure = {
    Name: "Lesson Process Proto ver. 8.0",
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
        },
        "AudioReDo": {
            "caption": "Переделать звук",
            "type": "boolean"
        },
        "TestURL": {
            "caption": "Тест",
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
                "AudioNotes",
                "AudioReDo"
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
                    "PicFinalURL",
                    "TechTransTiterURL"
                ],
                "Сдать обработанные иллюстрации": [
                    "PicDescriptionURL",
                    "PicFinalURL",
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
                "AudioNotes",
                "AudioReDo"
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
                "Подготовить монтаж музыки": [
                    "AudioProcURL",
                    "TechTransEditURL"
                ],
                "Сдать тайм-коды": [
                    "AudioFinalURL",
                    "AudioNotes",
                    "TechTransTimeURL",
                    "AudioReDo"
                ],
                "Сдать музыку и коды": [
                    "AudioFinalURL",
                    "AudioNotes",
                    "TechTransMusicResultURL",
                    "AudioReDo"
                ],
                "Повторно сдать тайм-коды": [
                    "AudioFinalURL",
                    "AudioNotes",
                    "TechTransTimeURL"
                ],
                "Повторно сдать музыку и коды": [
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
        },
        {
            Name: "Тест",
            ViewFields: [
                "TestURL"
            ],
            WriteFields: {
                "Сдать готовый тест": [
                    "TestURL"
                ]
            }
        }
    ]

}

async function process_1(pm, p_id, supervisor_id, elements, data, options) {
    // Процесс №1 (без музыки и без картинок автора)
    let has_test = typeof (data.HasTest) === 'boolean' ? data.HasTest : false;
    // Задача #1
    let res = await pm.newTask({
        "Name": "Регистрация новой записи",
        "ProcessId": p_id,
        "ExecutorId": supervisor_id,
        "Description": "",
        "ElementId": elements["Звук"] ? elements["Звук"].Id : null,
        "WriteFieldSet": "Обработать звук",
        "IsElemReady": false,
        "Dependencies": []
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
    // Задача #5
    let res5 = await pm.newTask({
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
        "Dependencies": [res5.id]
    }, options);
    // Задача #7
    res = await pm.newTask({
        "Name": "Иллюстрирование - выполнение задачи",
        "ProcessId": p_id,
        "ExecutorId": data.ExecutorPictures ? data.ExecutorPictures : supervisor_pic,
        "Description": "Подберите, пожалуйста, иллюстрации для следующей темы.",
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
        "Description": "Проверка иллюстраций и технической стенограммы.",
        "ElementId": elements["Иллюстрации"] ? elements["Иллюстрации"].Id : null,
        "WriteFieldSet": "Проверить иллюстрации",
        "IsElemReady": true,
        "Dependencies": [res.id]
    }, options);
    // Задача #9
    res = await pm.newTask({
        "Name": "Редактура-корректура - выполнение задачи",
        "ProcessId": p_id,
        "ExecutorId": null,
        "Description": "Отредактируйте, пожалуйста, техническую стенограмму.",
        "ElementId": elements["Техническая стенограмма"] ? elements["Техническая стенограмма"].Id : null,
        "WriteFieldSet": "Отредактировать ТС",
        "IsElemReady": false,
        "Dependencies": [res.id]
    }, options);
    // Задача #10
    let res2 = await pm.newTask({
        "Name": "Список материалов и литературы - запрос автору",
        "ProcessId": p_id,
        "ExecutorId": data.ExecutorLiterature ? data.ExecutorLiterature : null,
        "Description": "Запросить у автора список литературы.",
        "ElementId": elements["Список литературы"] ? elements["Список литературы"].Id : null,
        "IsElemReady": false,
        "Dependencies": [res5.id]
    }, options);
    // Задача #11
    res2 = await pm.newTask({
        "Name": "Список материалов и литературы - добавление списка литературы",
        "ProcessId": p_id,
        "ExecutorId": data.ExecutorLiterature ? data.ExecutorLiterature : supervisor_id,
        "Description": "Ссылка на список литературы и/или техническую стенограмму с добавленным списком.",
        "ElementId": elements["Список литературы"] ? elements["Список литературы"].Id : null,
        "WriteFieldSet": "Добавить литературу",
        "IsElemReady": true,
        "Dependencies": [res2.id]
    }, options);
    // Задача #13
    let { id: time_code_task_id } = await pm.newTask({
        "Name": "Контроль звука и расстановка тайм-кодов - исполнение",
        "ProcessId": p_id,
        "ExecutorId": data.ExecutorSoundControl ? data.ExecutorSoundControl : null,
        "Description": "Проверьте, пожалуйста, качество обработки звукозаписи и расставьте таймкоды в технической стенограмме.",
        "ElementId": elements["Техническая стенограмма"] ? elements["Техническая стенограмма"].Id : null,
        "WriteFieldSet": "Сдать тайм-коды",
        "IsElemReady": true,
        "Dependencies": [res.id]
    }, options);

    // Задача #13a
    let { id: sound_notes_task_id } = await pm.newTask({
        "Name": "Ознакомиться с замечаниями к обработке звука",
        "ProcessId": p_id,
        "ExecutorId": data.ExecutorSound ? data.ExecutorSound : null,
        "Description": "Пожалуйста, ознакомьтесь с замечаниями к обработке звукозаписи и учтите их в дальнейшей работе.",
        "ElementId": elements["Звук"] ? elements["Звук"].Id : null,
        "IsElemReady": false
    }, options);
    await pm.addOrUpdateTaskDep(true, {
        "TaskId": sound_notes_task_id,
        "DepTaskId": time_code_task_id,
        "IsConditional": true,
        "IsDefault": false,
        "Expression": "isNotEmpty(AudioNotes) && (!AudioReDo)"
    }, options);

    // Переделка звука
    res = await pm.newTask({
        "Name": "Переделка звука",
        "ProcessId": p_id,
        "ExecutorId": data.ExecutorSound ? data.ExecutorSound : null,
        "Description": "Переделайте, пожалуйста, звук согласно замечаниям.",
        "ElementId": elements["Звук"] ? elements["Звук"].Id : null,
        "WriteFieldSet": "Выложить отредактированный звук",
        "IsElemReady": true
    }, options);
    await pm.addOrUpdateTaskDep(true, {
        "TaskId": res.id,
        "DepTaskId": time_code_task_id,
        "IsConditional": true,
        "IsDefault": false,
        "Expression": "AudioReDo"
    }, options);

    // Повторный контроль звука и расстановка тайм-кодов
    res = await pm.newTask({
        "Name": "Повторный контроль звука и расстановка тайм-кодов",
        "ProcessId": p_id,
        "ExecutorId": data.ExecutorSoundControl ? data.ExecutorSoundControl : null,
        "Description": "Проверьте, пожалуйста, качество обработки звукозаписи и расставьте таймкоды в технической стенограмме.",
        "ElementId": elements["Техническая стенограмма"] ? elements["Техническая стенограмма"].Id : null,
        "WriteFieldSet": "Повторно сдать тайм-коды",
        "IsElemReady": true,
        "Dependencies": [res.id]
    }, options);

    // Задача #14
    res = await pm.newTask({
        "Name": "Финализация",
        "ProcessId": p_id,
        "ExecutorId": data.ExecutorReadyComponents ? data.ExecutorReadyComponents : supervisor_id,
        "Description": "Подготовка к публикации.",
        "ElementId": elements["Готовые компоненты"] ? elements["Готовые компоненты"].Id : null,
        "WriteFieldSet": "Финализировать",
        "IsElemReady": true,
        "Dependencies": [res2.id, res.id]
    }, options);
    await pm.addOrUpdateTaskDep(true, {
        "TaskId": res.id,
        "DepTaskId": time_code_task_id,
        "IsConditional": true,
        "IsDefault": false,
        "Expression": "(!AudioReDo)"
    }, options);

    if (has_test)
        // Задача #15
        res = await pm.newTask({
            "Name": "Тест",
            "ProcessId": p_id,
            "ExecutorId": data.ExecutorTest ? data.ExecutorTest :
                (elements["Тест"] && elements["Тест"].SupervisorId ? elements["Тест"].SupervisorId : supervisor_id),
            "Description": "Подготовьте, пожалуйста, проверочный тест.",
            "ElementId": elements["Тест"] ? elements["Тест"].Id : null,
            "WriteFieldSet": "Сдать готовый тест",
            "IsElemReady": true,
            "Dependencies": [res.id]
        }, options);

    // Конец процесса
    await pm.newTask({
        "Name": "Конец процесса",
        "ProcessId": p_id,
        "Description": "Автоматическое завершение процесса.",
        "IsAutomatic": true,
        "IsFinal": true,
        "Dependencies": [res.id, sound_notes_task_id]
    }, options);
}

async function process_2(pm, p_id, supervisor_id, elements, data, options) {
    // Процесс №2 (с картинками автора и без музыки)
    let has_test = typeof (data.HasTest) === 'boolean' ? data.HasTest : false;
    // Задача #1
    let res = await pm.newTask({
        "Name": "Регистрация новой записи",
        "ProcessId": p_id,
        "ExecutorId": supervisor_id,
        "Description": "",
        "ElementId": elements["Звук"] ? elements["Звук"].Id : null,
        "WriteFieldSet": "Обработать звук",
        "IsElemReady": false,
        "Dependencies": []
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
    // Задача #5
    let res5 = await pm.newTask({
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
        "Description": "Передать иллюстрации от автора и видео.",
        "ElementId": elements["Иллюстрации"] ? elements["Иллюстрации"].Id : null,
        "WriteFieldSet": "Передать иллюстрации от автора",
        "IsElemReady": false,
        "Dependencies": [res5.id]
    }, options);
    // Задача #7
    res = await pm.newTask({
        "Name": "Иллюстрирование - выполнение задачи",
        "ProcessId": p_id,
        "ExecutorId": data.ExecutorPictures ? data.ExecutorPictures : supervisor_pic,
        "Description": "Обработайте, пожалуйста, иллюстрации от автора.",
        "ElementId": elements["Иллюстрации"] ? elements["Иллюстрации"].Id : null,
        "WriteFieldSet": "Сдать обработанные иллюстрации",
        "IsElemReady": false,
        "Dependencies": [res.id]
    }, options);
    // Задача #8
    res = await pm.newTask({
        "Name": "Иллюстрирование - проверка",
        "ProcessId": p_id,
        "ExecutorId": data.ExecutorPicturesControl ? data.ExecutorPicturesControl : supervisor_pic,
        "Description": "Проверка иллюстраций и технической стенограммы.",
        "ElementId": elements["Иллюстрации"] ? elements["Иллюстрации"].Id : null,
        "WriteFieldSet": "Проверить иллюстрации",
        "IsElemReady": true,
        "Dependencies": [res.id]
    }, options);
    // Задача #9
    res = await pm.newTask({
        "Name": "Редактура-корректура - выполнение задачи",
        "ProcessId": p_id,
        "ExecutorId": null,
        "Description": "Отредактируйте, пожалуйста, техническую стенограмму.",
        "ElementId": elements["Техническая стенограмма"] ? elements["Техническая стенограмма"].Id : null,
        "WriteFieldSet": "Отредактировать ТС",
        "IsElemReady": false,
        "Dependencies": [res.id]
    }, options);
    // Задача #10
    let res2 = await pm.newTask({
        "Name": "Список материалов и литературы - запрос автору",
        "ProcessId": p_id,
        "ExecutorId": data.ExecutorLiterature ? data.ExecutorLiterature : null,
        "Description": "Запросить у автора список литературы.",
        "ElementId": elements["Список литературы"] ? elements["Список литературы"].Id : null,
        "IsElemReady": false,
        "Dependencies": [res5.id]
    }, options);
    // Задача #11
    res2 = await pm.newTask({
        "Name": "Список материалов и литературы - добавление списка литературы",
        "ProcessId": p_id,
        "ExecutorId": data.ExecutorLiterature ? data.ExecutorLiterature : supervisor_id,
        "Description": "Ссылка на список литературы и/или техническую стенограмму с добавленным списком литературы.",
        "ElementId": elements["Список литературы"] ? elements["Список литературы"].Id : null,
        "WriteFieldSet": "Добавить литературу",
        "IsElemReady": true,
        "Dependencies": [res2.id]
    }, options);

    // Задача #13
    let { id: time_code_task_id } = await pm.newTask({
        "Name": "Контроль звука и расстановка тайм-кодов - исполнение",
        "ProcessId": p_id,
        "ExecutorId": data.ExecutorSoundControl ? data.ExecutorSoundControl : null,
        "Description": "Проверьте, пожалуйста, качество обработки звукозаписи и расставьте таймкоды в технической стенограмме.",
        "ElementId": elements["Техническая стенограмма"] ? elements["Техническая стенограмма"].Id : null,
        "WriteFieldSet": "Сдать тайм-коды",
        "IsElemReady": true,
        "Dependencies": [res.id]
    }, options);

    // Задача #13a
    let { id: sound_notes_task_id } =await pm.newTask({
        "Name": "Ознакомиться с замечаниями к обработке звука",
        "ProcessId": p_id,
        "ExecutorId": data.ExecutorSound ? data.ExecutorSound : null,
        "Description": "Пожалуйста, ознакомьтесь с замечаниями к обработке звукозаписи и учтите их в дальнейшей работе.",
        "ElementId": elements["Звук"] ? elements["Звук"].Id : null,
        "IsElemReady": false
    }, options);
    await pm.addOrUpdateTaskDep(true, {
        "TaskId": sound_notes_task_id,
        "DepTaskId": time_code_task_id,
        "IsConditional": true,
        "IsDefault": false,
        "Expression": "isNotEmpty(AudioNotes) && (!AudioReDo)"
    }, options);

    // Переделка звука
    res = await pm.newTask({
        "Name": "Переделка звука",
        "ProcessId": p_id,
        "ExecutorId": data.ExecutorSound ? data.ExecutorSound : null,
        "Description": "Переделайте, пожалуйста, звук согласно замечаниям.",
        "ElementId": elements["Звук"] ? elements["Звук"].Id : null,
        "WriteFieldSet": "Выложить отредактированный звук",
        "IsElemReady": true
    }, options);
    await pm.addOrUpdateTaskDep(true, {
        "TaskId": res.id,
        "DepTaskId": time_code_task_id,
        "IsConditional": true,
        "IsDefault": false,
        "Expression": "AudioReDo"
    }, options);

    // Повторный контроль звука и расстановка тайм-кодов
    res = await pm.newTask({
        "Name": "Повторный контроль звука и расстановка тайм-кодов",
        "ProcessId": p_id,
        "ExecutorId": data.ExecutorSoundControl ? data.ExecutorSoundControl : null,
        "Description": "Проверьте, пожалуйста, качество обработки звукозаписи и расставьте таймкоды в технической стенограмме.",
        "ElementId": elements["Техническая стенограмма"] ? elements["Техническая стенограмма"].Id : null,
        "WriteFieldSet": "Повторно сдать тайм-коды",
        "IsElemReady": true,
        "Dependencies": [res.id]
    }, options);

    // Задача #14
    res = await pm.newTask({
        "Name": "Финализация",
        "ProcessId": p_id,
        "ExecutorId": data.ExecutorReadyComponents ? data.ExecutorReadyComponents : supervisor_id,
        "Description": "Подготовка к публикации.",
        "ElementId": elements["Готовые компоненты"] ? elements["Готовые компоненты"].Id : null,
        "WriteFieldSet": "Финализировать",
        "IsElemReady": true,
        "Dependencies": [res.id, res2.id]
    }, options);
    await pm.addOrUpdateTaskDep(true, {
        "TaskId": res.id,
        "DepTaskId": time_code_task_id,
        "IsConditional": true,
        "IsDefault": false,
        "Expression": "(!AudioReDo)"
    }, options);

    if (has_test)
        // Задача #15
        res = await pm.newTask({
            "Name": "Тест",
            "ProcessId": p_id,
            "ExecutorId": data.ExecutorTest ? data.ExecutorTest :
                (elements["Тест"] && elements["Тест"].SupervisorId ? elements["Тест"].SupervisorId : supervisor_id),
            "Description": "Подготовьте, пожалуйста, проверочный тест.",
            "ElementId": elements["Тест"] ? elements["Тест"].Id : null,
            "WriteFieldSet": "Сдать готовый тест",
            "IsElemReady": true,
            "Dependencies": [res.id]
        }, options);

    // Конец процесса
    await pm.newTask({
        "Name": "Конец процесса",
        "ProcessId": p_id,
        "Description": "Автоматическое завершение процесса.",
        "IsAutomatic": true,
        "IsFinal": true,
        "Dependencies": [res.id, sound_notes_task_id]
    }, options);
}

async function process_3(pm, p_id, supervisor_id, elements, data, options) {
    // Процесс №3 (с музыкой и без картинок автора)
    let has_test = typeof (data.HasTest) === 'boolean' ? data.HasTest : false;
    // Задача #1
    let res = await pm.newTask({
        "Name": "Регистрация новой записи",
        "ProcessId": p_id,
        "ExecutorId": supervisor_id,
        "Description": "",
        "ElementId": elements["Звук"] ? elements["Звук"].Id : null,
        "WriteFieldSet": "Обработать звук",
        "IsElemReady": false,
        "Dependencies": []
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
    // Задача #5
    let res5 = await pm.newTask({
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
        "Dependencies": [res5.id]
    }, options);
    // Задача #7
    res = await pm.newTask({
        "Name": "Иллюстрирование - выполнение задачи",
        "ProcessId": p_id,
        "ExecutorId": data.ExecutorPictures ? data.ExecutorPictures : supervisor_pic,
        "Description": "Подберите, пожалуйста, иллюстрации для следующей темы.",
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
        "Description": "Проверка иллюстраций и технической стенограммы.",
        "ElementId": elements["Иллюстрации"] ? elements["Иллюстрации"].Id : null,
        "WriteFieldSet": "Проверить иллюстрации",
        "IsElemReady": true,
        "Dependencies": [res.id]
    }, options);
    // Задача #9
    res = await pm.newTask({
        "Name": "Редактура-корректура - выполнение задачи",
        "ProcessId": p_id,
        "ExecutorId": null,
        "Description": "Отредактируйте, пожалуйста, техническую стенограмму.",
        "ElementId": elements["Техническая стенограмма"] ? elements["Техническая стенограмма"].Id : null,
        "WriteFieldSet": "Отредактировать ТС",
        "IsElemReady": false,
        "Dependencies": [res.id]
    }, options);
    // Задача #10
    let res2 = await pm.newTask({
        "Name": "Список материалов и литературы - запрос автору",
        "ProcessId": p_id,
        "ExecutorId": data.ExecutorLiterature ? data.ExecutorLiterature : null,
        "Description": "Запросить у автора список литературы.",
        "ElementId": elements["Список литературы"] ? elements["Список литературы"].Id : null,
        "IsElemReady": false,
        "Dependencies": [res5.id]
    }, options);
    // Задача #11
    res2 = await pm.newTask({
        "Name": "Список материалов и литературы - добавление списка литературы",
        "ProcessId": p_id,
        "ExecutorId": data.ExecutorLiterature ? data.ExecutorLiterature : supervisor_id,
        "Description": "Ссылка на список литературы и/или техническую стенограмму с добавленным списком литературы.",
        "ElementId": elements["Список литературы"] ? elements["Список литературы"].Id : null,
        "WriteFieldSet": "Добавить литературу",
        "IsElemReady": true,
        "Dependencies": [res2.id]
    }, options);
    // Задача #12
    res = await pm.newTask({
        "Name": "Контроль звука, монтаж музыки и расстановка тайм-кодов - запрос автору",
        "ProcessId": p_id,
        "ExecutorId": supervisor_id,
        "Description": "Запросить у автора расстановку музыкальных фрагментов.",
        "ElementId": elements["Техническая стенограмма"] ? elements["Техническая стенограмма"].Id : null,
        "WriteFieldSet": "Запросить роспись музыки",
        "IsElemReady": false,
        "Dependencies": [res.id]
    }, options);

    // Задача #14
    let { id: time_code_task_id } = await pm.newTask({
        "Name": "Контроль звука, монтаж музыки и расстановка тайм-кодов - исполнение",
        "ProcessId": p_id,
        "ExecutorId": data.ExecutorSoundControl ? data.ExecutorSoundControl : null,
        "Description": "Сделайте, пожалуйста, расстановку тайм-кодов для следующей записи.",
        "ElementId": elements["Техническая стенограмма"] ? elements["Техническая стенограмма"].Id : null,
        "WriteFieldSet": "Сдать музыку и коды",
        "IsElemReady": true,
        "Dependencies": [res.id]
    }, options);

    // Задача #14b
    let { id: sound_notes_task_id } = await pm.newTask({
        "Name": "Ознакомиться с замечаниями к обработке звука",
        "ProcessId": p_id,
        "ExecutorId": data.ExecutorSound ? data.ExecutorSound : null,
        "Description": "Пожалуйста, ознакомьтесь с замечаниями к обработке звукозаписи и учтите их в дальнейшей работе.",
        "ElementId": elements["Звук"] ? elements["Звук"].Id : null,
        "IsElemReady": false
    }, options);
    await pm.addOrUpdateTaskDep(true, {
        "TaskId": sound_notes_task_id,
        "DepTaskId": time_code_task_id,
        "IsConditional": true,
        "IsDefault": false,
        "Expression": "isNotEmpty(AudioNotes) && (!AudioReDo)"
    }, options);

    // Переделка звука
    res = await pm.newTask({
        "Name": "Переделка звука",
        "ProcessId": p_id,
        "ExecutorId": data.ExecutorSound ? data.ExecutorSound : null,
        "Description": "Переделайте, пожалуйста, звук согласно замечаниям.",
        "ElementId": elements["Звук"] ? elements["Звук"].Id : null,
        "WriteFieldSet": "Выложить отредактированный звук",
        "IsElemReady": true
    }, options);
    await pm.addOrUpdateTaskDep(true, {
        "TaskId": res.id,
        "DepTaskId": time_code_task_id,
        "IsConditional": true,
        "IsDefault": false,
        "Expression": "AudioReDo"
    }, options);

    // Повторный контроль звука и расстановка тайм-кодов
    res = await pm.newTask({
        "Name": "Повторный контроль звука и расстановка тайм-кодов",
        "ProcessId": p_id,
        "ExecutorId": data.ExecutorSoundControl ? data.ExecutorSoundControl : null,
        "Description": "Проверьте, пожалуйста, качество обработки звукозаписи и расставьте таймкоды в технической стенограмме.",
        "ElementId": elements["Техническая стенограмма"] ? elements["Техническая стенограмма"].Id : null,
        "WriteFieldSet": "Повторно сдать музыку и коды",
        "IsElemReady": true,
        "Dependencies": [res.id]
    }, options);

    // Задача #15
    res = await pm.newTask({
        "Name": "Финализация",
        "ProcessId": p_id,
        "ExecutorId": data.ExecutorReadyComponents ? data.ExecutorReadyComponents : supervisor_id,
        "Description": "Подготовка к публикации.",
        "ElementId": elements["Готовые компоненты"] ? elements["Готовые компоненты"].Id : null,
        "WriteFieldSet": "Финализировать",
        "IsElemReady": true,
        "Dependencies": [res.id, res2.id]
    }, options);
    await pm.addOrUpdateTaskDep(true, {
        "TaskId": res.id,
        "DepTaskId": time_code_task_id,
        "IsConditional": true,
        "IsDefault": false,
        "Expression": "(!AudioReDo)"
    }, options);

    if (has_test)
        // Задача #16
        res = await pm.newTask({
            "Name": "Тест",
            "ProcessId": p_id,
            "ExecutorId": data.ExecutorTest ? data.ExecutorTest :
                (elements["Тест"] && elements["Тест"].SupervisorId ? elements["Тест"].SupervisorId : supervisor_id),
            "Description": "Подготовьте, пожалуйста, проверочный тест.",
            "ElementId": elements["Тест"] ? elements["Тест"].Id : null,
            "WriteFieldSet": "Сдать готовый тест",
            "IsElemReady": true,
            "Dependencies": [res.id]
        }, options);

    // Конец процесса
    await pm.newTask({
        "Name": "Конец процесса",
        "ProcessId": p_id,
        "Description": "Автоматическое завершение процесса.",
        "IsAutomatic": true,
        "IsFinal": true,
        "Dependencies": [res.id, sound_notes_task_id]
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