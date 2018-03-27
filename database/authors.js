const authorRows = [
    {
        id : 1,
        AccountId : 1,
        LanguageId : 1,
        Portrait : 'http://example.image1.ru',
        FirstName : 'Петр',
        LastName : 'Петров',
        Description : 'Наш первый тестовый автор'
    },
    {
        id : 2,
        AccountId : 1,
        LanguageId : 1,
        Portrait : 'http://example.image2.ru',
        FirstName : 'Сергей',
        LastName : 'Сергеев',
        Description : 'Наш второй тестовый автор'
    },
    {
        id : 3,
        AccountId : 1,
        LanguageId : 1,
        Portrait : 'http://example.image3.ru',
        FirstName : 'Платон',
        LastName : 'Кузнецов',
        Description : 'Наш третий тестовый автор'
    },
];

exports.AuthorsService = class AuthorsService {

    getAll() {
        return new Promise((resolve, reject) => {
            resolve(authorRows);
        });
    }

    get(id) {
        return new Promise((resolve, reject) => {
            resolve(authorRows[0])
        });
    }

    del(id) {
        return new Promise((resolve, reject) => {
            console.log(id);
            resolve(null);
        });
    }

    update(id, data) {
        return new Promise((resolve, reject) => {
            console.log(id, data);
            resolve(data);
        });
    }

    insert(data) {
        return new Promise((resolve, reject) => {
            console.log(data);
            resolve(authorRows[0]);
        });
    }
};