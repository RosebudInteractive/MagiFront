/*
** MySQL: Upgrade to version `"ProtoOne" v.1.0.0.1 build 13`
*/
alter table `CourseLng` add `IntwD` int null
GO
alter table `CourseLng` add `IntwDFmt` varchar(15) null
GO
alter table `CourseLng` add `IntroD` int null
GO
alter table `CourseLng` add `IntroDFmt` varchar(15) null
GO
