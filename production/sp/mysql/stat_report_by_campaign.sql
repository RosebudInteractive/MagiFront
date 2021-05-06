CREATE PROCEDURE `stat_report_by_campaign`(st_date datetime, fin_date datetime)
BEGIN
select c.id, st_date, fin_date, coalesce(concat(c.Campaign, ' (', c.Source, '+', c.Medium, ')'), '<Empty>') campaign,
  res.nreg, res.hours, res.hnew, res.nlsn, res.nmain, res.nuser, res.nfull, res.sale_qty, res.sale_sum, res.sale_sum_ios, res.sale_sum_android
from
(
  select r.c_id, sum(r.nreg) nreg, sum(r.hours) hours, sum(r.hnew) hnew, sum(r.nlsn) nlsn,
    sum(r.nmain) nmain, sum(r.nuser) nuser, sum(r.nfull) nfull, sum(r.sale_qty) sale_qty, sum(r.sale_sum) sale_sum,
    sum(sale_sum_ios) sale_sum_ios, sum(sale_sum_android) sale_sum_android from
  (
  -- количество прослушанных часов в день
    select coalesce(h.CampaignId, 0) c_id, 0 nreg, round(sum(LsnTime)/60/60,2) hours, 0 hnew, 0 nlsn, 0 nmain, 0 nuser,
      0 nfull, 0 sale_qty, 0 sale_sum, 0 sale_sum_ios, 0 sale_sum_android
    from LsnHistory h
    where (h.StDate >= st_date) and (h.StDate < fin_date)
    group by coalesce(h.CampaignId, 0)
  union all
  -- кол-во регистраций
    select coalesce(u.CampaignId, 0), count(*), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 from User u
    where (u.RegDate >= st_date) and (u.RegDate < fin_date)
    group by coalesce(u.CampaignId, 0)
  union all
  -- сколько часов прослушали "новые" пользвоатели (зарегистрированы меньше Х дней, пока ставим Х=5)
    select coalesce(h.CampaignId, 0), 0, 0, round(sum(LsnTime)/60/60,2), 0, 0, 0, 0, 0, 0, 0, 0 from LsnHistory h
      join User u on u.SysParentId=h.UserId
    where (h.StDate >= st_date) and (h.StDate < fin_date) and (datediff(h.StDate,u.RegDate)<=5)
    group by coalesce(h.CampaignId, 0)
  union all
  -- сколько лекций+допэпзодов прослушано целиком
    select t.dt, 0, 0, 0, round(sum(t.nlsn),0), round(sum(if(t.ParentId is null,1,0)*t.nlsn),0), 0, 0, 0, 0, 0, 0 from
    (
      select coalesce(h.CampaignId, 0) as dt, h.LessonId, l.ParentId, h.UserId, round(sum(h.LsnTime)/max(ll.Duration),2) nlsn
      from LsnHistory h
        join Lesson l on l.Id=h.LessonId
        join LessonLng ll on ll.LessonId=l.Id
      where (h.StDate >= st_date) and (h.StDate < fin_date)
      group by coalesce(h.CampaignId, 0), h.LessonId, l.ParentId, h.UserId
      having sum(h.LsnTime)/max(ll.Duration) > 0.97
    ) as t
    group by t.dt
  union all
  -- сколько лекций слушали разные люди (считаем, что лекцию слушали, если прослушали больше 5% ее длительности и не меньше 1 минуты)
    select t.dt, 0, 0, 0, 0, 0, count(*), 0, 0, 0, 0, 0 from
    (
      select coalesce(h.CampaignId, 0) as dt, h.UserId, h.LessonId from LsnHistory h
        join Lesson l on l.Id=h.LessonId
        join LessonLng ll on ll.LessonId=l.Id
        join User u on u.SysParentId=h.UserId
      where (h.StDate >= st_date) and (h.StDate < fin_date)
      group by coalesce(h.CampaignId, 0), h.UserId, h.LessonId
      having (sum(h.LsnTime) >= 60) and (sum(h.LsnTime)/max(ll.Duration) >= 0.05)
    ) as t
    group by t.dt
  union all
  -- сколько разных лекций было прослушано разными людьми до конца
    select t.dt, 0, 0, 0, 0, 0, 0, count(*), 0, 0, 0, 0 from
    (
      select coalesce(h.CampaignId, 0) as dt, h.UserId, h.LessonId from LsnHistory h
        join Lesson l on l.Id=h.LessonId
        join LessonLng ll on ll.LessonId=l.Id
        join User u on u.SysParentId=h.UserId
      where (h.StDate >= st_date) and (h.StDate < fin_date)
      group by coalesce(h.CampaignId, 0), h.UserId, h.LessonId
      having sum(h.LsnTime)/max(ll.Duration) > 0.97
    ) as t
    group by t.dt
  union all
  -- сколько было продаж
    select coalesce(c.CampaignId, 0), 0, 0, 0, 0, 0, 0, 0, sum(ii.Qty), sum(ii.Qty * ii.Price),
      sum(case when c.PaymentType = 2 then (ii.Qty * ii.Price) else 0 end),
      sum(case when c.PaymentType = 3 then (ii.Qty * ii.Price) else 0 end)
    from Cheque c
      join Invoice i on i.Id = c.InvoiceId
      join InvoiceItem ii on ii.InvoiceId = i.Id
    where (c.ChequeDate >= st_date) and (c.ChequeDate < fin_date) and (c.StateId = 4) and (c.ChequeTypeId = 1)
    group by coalesce(c.CampaignId, 0)
  ) as r
  group by r.c_id
) as res
  left join Campaign c on c.Id = res.c_id
order by res.c_id;
END