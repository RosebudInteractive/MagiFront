const _rows = [
    {
        Id: 1,
        Name: 'Курс 1',
        State: 'D',
        Cover: 'https://magisteria.ru/wp-content/uploads/2016/08/unnamed-2.jpg',
        Color: 13413051,
        LanguageId: 1,
        LanguageName: 'Русский',
        URL: 'http:///i_do_not_know.com',
        Description: 'Описание курса 1 https://docs.webix.com',
        Authors: [2, 3],
        Categories : [4, 5],
        Lessons: [
            {
                Id: 1,
                Name: 'Лекция 1',
                ShortDescription: 'Краткое описание 1',
                FullDescription: 'Полное описание 1',
                Number: '1',
                ReadyDate: '01.01.2018',
                State: 'D',
                LanguageName: 'Русский',
            },
            {
                Id: 2,
                Name: 'Лекция 2',
                ShortDescription: 'Краткое описание 2',
                FullDescription: 'Полное описание 2',
                Number: '2',
                ReadyDate: '01.01.2018',
                State: 'D',
                LanguageName: 'Русский',
            }
        ],
    },
    {
        Id : 2,
        Name : 'Курс 2',
        State: 'P',
        Cover : 'http://example.com/course2.jpg',
        Color : 10070783,
        LanguageId : 2,
        LanguageName : 'English',
        URL: '/i_do_not_know',
        Description:'Описание курса 3',
        Authors: [],
        Categories : [],
        Lessons : [
            {
                Id : 3,
                Name: 'Лекция 3',
                ShortDescription : 'Краткое описание 3',
                FullDescription : 'Полное описание 3',
                Number : '1',
                ReadyDate : '01.01.2018',
                State : 'D',
                LanguageName: 'Русский',
            },
            {
                Id : 4,
                Name: 'Лекция 4',
                ShortDescription : 'Краткое описание 4',
                FullDescription : 'Полное описание 4',
                Number : '2',
                ReadyDate : '01.01.2018',
                State : 'D',
                LanguageName: 'Русский',
            }
        ],
    },
    {
        Id : 3,
        Name : 'Курс 3',
        State: 'A',
        Cover : 'http://example.com/course3.jpg',
        Color : 16755234,
        LanguageId : 2,
        LanguageName : 'English',
        URL: '/i_do_not_know',
        Description:'Описание курса 3',
        Authors: [1, 3],
        Categories : [2, 5],
        Lessons : [
            {
                Id : 5,
                Name: 'Лекция 5',
                ShortDescription : 'Краткое описание 5',
                FullDescription : 'Полное описание 5',
                Number : '1',
                ReadyDate : '01.01.2018',
                State : 'D',
                LanguageName: 'Русский',
            },
            {
                Id : 6,
                Name: 'Лекция 6',
                ShortDescription : 'Краткое описание 6',
                FullDescription : 'Полное описание 6',
                Number : '2',
                ReadyDate : '01.01.2018',
                State : 'D',
                LanguageName: 'Русский',
            }
        ],
    },
];

const _authors = [
    {
        Id : 1,
        FirstName : 'Петр',
        LastName : 'Петров',
    },
    {
        Id : 2,
        FirstName : 'Сергей',
        LastName : 'Сергеев',
    },
    {
        Id : 3,
        FirstName : 'Платон',
        LastName : 'Кузнецов',
    },
];

const CoursesService = class CoursesService {

    getAll() {
        return new Promise((resolve) => {
            resolve(_rows);
        });
    }

    get(id) {
        return new Promise((resolve) => {
            resolve(_rows[id-1])
        });
    }

    getAuthors(courseId) {
        return new Promise((resolve) => {
            resolve(_authors)
        })
    }

    del(id) {
        return new Promise((resolve) => {
            console.log(id);
            resolve(null);
        });
    }

    update(id, data) {
        return new Promise((resolve) => {
            console.log(id, data);
            resolve(data);
        });
    }

    insert(data) {
        return new Promise((resolve) => {
            console.log(data);
            resolve(_rows[0]);
        });
    }
};

let dbCourses = null;
exports.CoursesService = () => {
    return dbCourses ? dbCourses : dbCourses = new CoursesService();
}