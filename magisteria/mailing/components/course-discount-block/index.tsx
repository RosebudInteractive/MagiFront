import React, { useMemo } from "react"
import DiscountBlock from "../common/discount-block";

type Props = {
  searchParams: string,
  discounts: any,
}

export default function CourseDiscountBlock(props: Props): JSX.Element | null {
  const {searchParams, discounts} = props;

  const discount = useMemo(() => {
    const params = new URLSearchParams(searchParams),
      promo: string = params.get('promo') || '',
      level: number = parseInt(params.get('lvl') || '0'),
      discount = level && discounts.get(+level - 1)

    return discount && {promo: promo, value: discount.value, descr: discount.descr}
  }, [])

  if (!discount) return null

  return <DiscountBlock promo={discount.promo} header={`Получите скидку ${discount.value}%`}
                        description={discount.descr}/>
}

