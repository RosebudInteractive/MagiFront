import React, { useMemo } from "react";
import DiscountBlock from "../common/discount-block";
export default function CourseDiscountBlock(props) {
    const { searchParams, discounts } = props;
    const discount = useMemo(() => {
        const params = new URLSearchParams(searchParams), promo = params.get('promo') || '', level = parseInt(params.get('lvl') || '0'), discount = level && discounts.get(+level - 1);
        return discount && { promo: promo, value: discount.value, descr: discount.descr };
    }, []);
    if (!discount)
        return null;
    return <DiscountBlock promo={discount.promo} header={`Получите скидку ${discount.value}%`} description={discount.descr}/>;
}
