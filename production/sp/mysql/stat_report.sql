CREATE DEFINER=`sa`@`%` PROCEDURE `stat_report`(st_date datetime, fin_date datetime)
BEGIN
select r.`date`, sum(r.nreg) nreg, sum(r.hours) hours, sum(r.hnew) hnew, sum(r.nlsn) nlsn,
  sum(r.nmain) nmain, sum(r.nuser) nuser, sum(r.nfull) nfull, sum(sale_qty) sale_qty, sum(sale_sum) sale_sum,
    sum(sale_sum_ios) sale_sum_ios from
(
-- количество прослушанных часов в день
  select date(h.StDate) `date`, 0 nreg, round(sum(LsnTime)/60/60,2) hours, 0 hnew, 0 nlsn, 0 nmain, 0 nuser,
    0 nfull, 0 sale_qty, 0 sale_sum, 0 sale_sum_ios
  from LsnHistory h
  where (h.StDate >= st_date) and (h.StDate < fin_date)
  group by date(h.StDate)
union all
-- кол-во регистраций
  select date(u.RegDate), count(*), 0, 0, 0, 0, 0, 0, 0, 0, 0 from User u
  where (u.RegDate >= st_date) and (u.RegDate < fin_date)
  group by date(u.RegDate)
union all
-- сколько часов прослушали "новые" пользвоатели (зарегистрированы меньше Х дней, пока ставим Х=5)
  select date(h.StDate) `date`, 0, 0, round(sum(LsnTime)/60/60,2), 0, 0, 0, 0, 0, 0, 0 from LsnHistory h
    join User u on u.SysParentId=h.UserId
  where (h.StDate >= st_date) and (h.StDate < fin_date) and (datediff(h.StDate,u.RegDate)<=5)
  group by date(h.StDate)
union all
-- сколько лекций+допэпзодов прослушано целиком
  select t.dt, 0, 0, 0, round(sum(t.nlsn),0), round(sum(if(t.ParentId is null,1,0)*t.nlsn),0), 0, 0, 0, 0, 0 from
  (
    select date(h.StDate) as dt, h.LessonId, l.ParentId, h.UserId, round(sum(h.LsnTime)/max(ll.Duration),2) nlsn
    from LsnHistory h
      join Lesson l on l.Id=h.LessonId
      join LessonLng ll on ll.LessonId=l.Id
    where (h.StDate >= st_date) and (h.StDate < fin_date)
    group by date(h.StDate), h.LessonId, l.ParentId, h.UserId
    having sum(h.LsnTime)/max(ll.Duration) > 0.97
  ) as t
  group by t.dt
union all
-- сколько лекций слушали разные люди (считаем, что лекцию слушали, если прослушали больше 5% ее длительности и не меньше 1 минуты)
  select t.dt, 0, 0, 0, 0, 0, count(*), 0, 0, 0, 0 from
  (
    select date(h.StDate) as dt, h.UserId, h.LessonId from LsnHistory h
      join Lesson l on l.Id=h.LessonId
      join LessonLng ll on ll.LessonId=l.Id
      join User u on u.SysParentId=h.UserId
    where (h.StDate >= st_date) and (h.StDate < fin_date)
    group by date(h.StDate), h.UserId, h.LessonId
    having (sum(h.LsnTime) >= 60) and (sum(h.LsnTime)/max(ll.Duration) >= 0.05)
  ) as t
  group by t.dt
union all
-- сколько разных лекций было прослушано разными людьми до конца
  select t.dt, 0, 0, 0, 0, 0, 0, count(*), 0, 0, 0 from
  (
    select date(h.StDate) as dt, h.UserId, h.LessonId from LsnHistory h
      join Lesson l on l.Id=h.LessonId
      join LessonLng ll on ll.LessonId=l.Id
      join User u on u.SysParentId=h.UserId
    where (h.StDate >= st_date) and (h.StDate < fin_date)
    group by date(h.StDate), h.UserId, h.LessonId
    having sum(h.LsnTime)/max(ll.Duration) > 0.97
  ) as t
  group by t.dt
union all
-- сколько было продаж
  select date(c.ChequeDate), 0, 0, 0, 0, 0, 0, 0, sum(ii.Qty), sum(ii.Qty * ii.Price),
    sum(case when c.PaymentType = 2 then (ii.Qty * ii.Price) else 0 end)
  from Cheque c
    join Invoice i on i.Id = c.InvoiceId
    join InvoiceItem ii on ii.InvoiceId = i.Id
  where (c.ChequeDate >= st_date) and (c.ChequeDate < fin_date) and (c.StateId = 4) and (c.ChequeTypeId = 1)
  group by date(c.ChequeDate)
) as r
group by r.`date`
order by 1 desc;
END