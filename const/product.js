'use strict';

exports.Product = {
    DefaultPriceListCode: "MAIN",
    DefaultPriceListId: 1,
    ProductTypes: {
        Subscription: 1,
        Book: 2,
        AudioBook: 3,
        EBook: 4,
        CourseOnLine: 5,
        CoursePromoCode: 6
    },
    VATTypes: {
        Vat20Id: 1,
        Vat10Id: 2  
    },
    DiscountTypes: {
        GeneralPercId: 1,
        CoursePercId: 2,
        DynCoursePercId: 3
    },
    ProductReqParams: {
        TypeCode: "SUBS",
        Detail: "true",
        Discontinued: "0"
    }
};
