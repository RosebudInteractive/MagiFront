export const PROCESS_STATE = {
    DRAFT: {value: 1, label: "Черновик", css: "_draft"},
    EXECUTING: {value: 2, label: "В процессе", css: "_executing"},
    DONE: {value: 3, label: "Завершен", css: "_done"}
}

export const TASK_STATE = {
    WAITING: {value: 1, label: "В ожидании", css: "_waiting"},
    DRAFT: {value: 2, label: "Черновик", css: "_draft"},
    EXECUTING: {value: 3, label: "В процессе", css: "_executing"},
    QUESTION: {value: 4, label: "Вопрос", css: "_question"},
    DONE: {value: 5, label: "Завершена", css: "_done"},
}
