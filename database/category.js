const _rows = [
    {
        Id : 1,
        Name : 'Категория 1',
        ParentId: null,
        ParentName : '',
    },
    {
        Id : 2,
        Name : 'Категория 2',
        ParentId: 1,
        ParentName : 'Категория 1',
    },
    {
        Id : 3,
        Name : 'Категория 3',
        ParentId: 1,
        ParentName : 'Категория 1',
    },
];

const CategoriesService = class CategoriesService {

    getAll() {
        return new Promise((resolve) => {
            resolve(_rows);
        });
    }

    get(id) {
        return new Promise((resolve) => {
            resolve(_rows[0])
        });
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

let dbCategories = null;
exports.CategoriesService = () => {
    return dbCategories ? dbCategories : dbCategories = new CategoriesService();
}