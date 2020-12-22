'use strict'
module.exports = {

    promocode: function promocode(discount, lastDate) {
        // discount - скидка в процентах, но не больше 50
        // lastDate - срок действия промокода
        var m = lastDate.getMonth(), y = lastDate.getFullYear(), d = lastDate.getDate();
        m = m * 5 + 11;
        y = 9 - y % 10;
        d = d * 2 + 16;
        var drate = (discount > 50 ? 50 : (discount < 0 ? 0 : discount));
        drate += 45;
        var checksum = (discount + lastDate.getMonth() + lastDate.getDate() + lastDate.getFullYear()) % 10;
        var promo = "MAGIS" + String(y) + String(drate) + String(m) + String(d) + String(checksum);
        return promo;
    },

    getPromoDate: function getPromoDate(promo) {
        var y = 2020 + 9 - Number(promo.slice(5, 6));
        var m = (Number(promo.slice(8, 10)) - 11) / 5;
        var d = (Number(promo.slice(10, 12)) - 16) / 2
        var dr = Number(promo.slice(6, 8)) - 45;
        // if (m == 11) y = 2019;
        var checksum = Number(promo.slice(12, 13));
        if (checksum == ((y + m + d + dr) % 10))
            return new Date(y, m, d)
        else
            return null;
    },

    getPromoDiscount: function getPromoDiscount(promo) {
        return Number(promo.slice(6, 8)) - 45;
    }
};