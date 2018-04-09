# Mysql Exercise

> 请创建如下表，并创建相关约束

![](http://omk1n04i8.bkt.clouddn.com/17-9-26/59526112.jpg)

1、自行创建测试数据

```mysql
/*
 Navicat Premium Data Transfer

 Source Server         : localhost
 Source Server Type    : MySQL
 Source Server Version : 50624
 Source Host           : localhost
 Source Database       : sqlexam

 Target Server Type    : MySQL
 Target Server Version : 50624
 File Encoding         : utf-8

 Date: 10/21/2016 06:46:46 AM
*/

SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
--  Table structure for `class`
-- ----------------------------
DROP TABLE IF EXISTS `class`;
CREATE TABLE `class` (
  `cid` int(11) NOT NULL AUTO_INCREMENT,
  `caption` varchar(32) NOT NULL,
  PRIMARY KEY (`cid`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Records of `class`
-- ----------------------------
BEGIN;
INSERT INTO `class` VALUES ('1', '三年二班'), ('2', '三年三班'), ('3', '一年二班'), ('4', '二年九班');
COMMIT;

-- ----------------------------
--  Table structure for `course`
-- ----------------------------
DROP TABLE IF EXISTS `course`;
CREATE TABLE `course` (
  `cid` int(11) NOT NULL AUTO_INCREMENT,
  `cname` varchar(32) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  PRIMARY KEY (`cid`),
  KEY `fk_course_teacher` (`teacher_id`),
  CONSTRAINT `fk_course_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teacher` (`tid`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Records of `course`
-- ----------------------------
BEGIN;
INSERT INTO `course` VALUES ('1', '生物', '1'), ('2', '物理', '2'), ('3', '体育', '3'), ('4', '美术', '2');
COMMIT;

-- ----------------------------
--  Table structure for `score`
-- ----------------------------
DROP TABLE IF EXISTS `score`;
CREATE TABLE `score` (
  `sid` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `num` int(11) NOT NULL,
  PRIMARY KEY (`sid`),
  KEY `fk_score_student` (`student_id`),
  KEY `fk_score_course` (`course_id`),
  CONSTRAINT `fk_score_course` FOREIGN KEY (`course_id`) REFERENCES `course` (`cid`),
  CONSTRAINT `fk_score_student` FOREIGN KEY (`student_id`) REFERENCES `student` (`sid`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Records of `score`
-- ----------------------------
BEGIN;
INSERT INTO `score` VALUES ('1', '1', '1', '10'), ('2', '1', '2', '9'), ('5', '1', '4', '66'), ('6', '2', '1', '8'), ('8', '2', '3', '68'), ('9', '2', '4', '99'), ('10', '3', '1', '77'), ('11', '3', '2', '66'), ('12', '3', '3', '87'), ('13', '3', '4', '99'), ('14', '4', '1', '79'), ('15', '4', '2', '11'), ('16', '4', '3', '67'), ('17', '4', '4', '100'), ('18', '5', '1', '79'), ('19', '5', '2', '11'), ('20', '5', '3', '67'), ('21', '5', '4', '100'), ('22', '6', '1', '9'), ('23', '6', '2', '100'), ('24', '6', '3', '67'), ('25', '6', '4', '100'), ('26', '7', '1', '9'), ('27', '7', '2', '100'), ('28', '7', '3', '67'), ('29', '7', '4', '88'), ('30', '8', '1', '9'), ('31', '8', '2', '100'), ('32', '8', '3', '67'), ('33', '8', '4', '88'), ('34', '9', '1', '91'), ('35', '9', '2', '88'), ('36', '9', '3', '67'), ('37', '9', '4', '22'), ('38', '10', '1', '90'), ('39', '10', '2', '77'), ('40', '10', '3', '43'), ('41', '10', '4', '87'), ('42', '11', '1', '90'), ('43', '11', '2', '77'), ('44', '11', '3', '43'), ('45', '11', '4', '87'), ('46', '12', '1', '90'), ('47', '12', '2', '77'), ('48', '12', '3', '43'), ('49', '12', '4', '87'), ('52', '13', '3', '87');
COMMIT;

-- ----------------------------
--  Table structure for `student`
-- ----------------------------
DROP TABLE IF EXISTS `student`;
CREATE TABLE `student` (
  `sid` int(11) NOT NULL AUTO_INCREMENT,
  `gender` char(1) NOT NULL,
  `class_id` int(11) NOT NULL,
  `sname` varchar(32) NOT NULL,
  PRIMARY KEY (`sid`),
  KEY `fk_class` (`class_id`),
  CONSTRAINT `fk_class` FOREIGN KEY (`class_id`) REFERENCES `class` (`cid`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Records of `student`
-- ----------------------------
BEGIN;
INSERT INTO `student` VALUES ('1', '男', '1', '理解'), ('2', '女', '1', '钢蛋'), ('3', '男', '1', '张三'), ('4', '男', '1', '张一'), ('5', '女', '1', '张二'), ('6', '男', '1', '张四'), ('7', '女', '2', '铁锤'), ('8', '男', '2', '李三'), ('9', '男', '2', '李一'), ('10', '女', '2', '李二'), ('11', '男', '2', '李四'), ('12', '女', '3', '如花'), ('13', '男', '3', '刘三'), ('14', '男', '3', '刘一'), ('15', '女', '3', '刘二'), ('16', '男', '3', '刘四');
COMMIT;

-- ----------------------------
--  Table structure for `teacher`
-- ----------------------------
DROP TABLE IF EXISTS `teacher`;
CREATE TABLE `teacher` (
  `tid` int(11) NOT NULL AUTO_INCREMENT,
  `tname` varchar(32) NOT NULL,
  PRIMARY KEY (`tid`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Records of `teacher`
-- ----------------------------
BEGIN;
INSERT INTO `teacher` VALUES ('1', '张磊老师'), ('2', '李平老师'), ('3', '刘海燕老师'), ('4', '朱云海老师'), ('5', '李杰老师');
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;

表结构和数据
```

2、查询“生物”课程比“物理”课程成绩高的所有学生的学号；

```mysql
select A.student_id from 
(select score.sid,score.student_id,course.cname,score.num from score LEFT JOIN course on score.course_id=course.cid where course.cname='生物' ) as A
INNER JOIN 
(select score.sid,score.student_id,course.cname,score.num from score LEFT JOIN course on score.course_id=course.cid where course.cname='物理' ) as B
on A.student_id=B.student_id where A.num>B.num
```

3、查询平均成绩大于60分的同学的学号和平均成绩； 

```mysql
select temp.student_id,student.sname,temp.number from (select student_id,avg(num) as number from score  GROUP BY student_id having number > 60) as temp LEFT JOIN student on temp.student_id=sid;
```

4、查询所有同学的学号、姓名、选课数、总成绩；

```mysql
select score.student_id,student.sname,count(score.student_id),sum(score.num) from score LEFT JOIN
student on score.student_id=student.sid
GROUP BY score.student_id
```

5、查询姓“李”的老师的个数；

```mysql
select * from teacher where t_name like '李%';
```

6、查询没学过“叶平”老师课的同学的学号、姓名；

```mysql
select student.sid,student.sname from student where sid not in (
select student_id from score where score.course_id  in 
(select cid from course LEFT JOIN teacher on course.teacher_id=teacher.tid where tname='李平老师')
GROUP BY student_id
)
```

7、查询学过“001”并且也学过编号“002”课程的同学的学号、姓名；

```mysql
select student_id,student.sname as count from score 
LEFT JOIN student on score.student_id=student.sid
where course_id=1 or course_id=2 GROUP BY student_id HAVING count(student_id) > 1
```

8、查询学过“叶平”老师所教的所有课的同学的学号、姓名；

```mysql
select score.student_id,student.sname from score 
LEFT JOIN student on score.student_id=student.sid
where course_id in 
(select cid from course 
LEFT JOIN teacher on 
course.teacher_id=teacher.tid WHERE teacher.tname='李平老师')
GROUP BY student_id having COUNT(course_id) = 
(select count(cid) from course 
LEFT JOIN teacher on 
course.teacher_id=teacher.tid WHERE teacher.tname='李平老师')
```

9、查询课程编号“002”的成绩比课程编号“001”课程低的所有同学的学号、姓名；

```mysql
select A.student_id,student.sname from 
(select * from score LEFT JOIN course on score.course_id=course.cid where course.cid=1) as A
INNER JOIN
(select * from score LEFT JOIN course on score.course_id=course.cid where course.cid=2) as B
on A.student_id=B.student_id
LEFT JOIN student on A.student_id=student.sid
where A.num > B.num
```

10、查询有课程成绩小于60分的同学的学号、姓名；

```mysql
select student.sid,student.sname from score
LEFT JOIN student on student.sid=score.student_id
where score.num < 60
GROUP BY sid

或者使用distinct

select DISTINCT student.sid,student.sname from score
LEFT JOIN student on student.sid=score.student_id
where score.num < 60

但是distinct效率并不是很高，能少用就少用。
```

11、查询没有学全所有课的同学的学号、姓名；

```mysql
-- 以后要么count主键，要么就count1
select student_id,student.sname as count_num from score
LEFT JOIN student on score.student_id=student.sid
GROUP BY student_id
HAVING count(1) < (select count(1) from course)
```

12、查询至少有一门课与学号为“001”的同学所学相同的同学的学号和姓名；

```mysql
-- 假如001学了3门课程，只要001学过的任何一门课程我学过，那么我就是符合条件的。
select student_id,sname from score 
LEFT JOIN student on score.student_id=student.sid
where student.sid <> 1 and score.course_id in
(select course.cid from score 
LEFT JOIN course on score.course_id=course.cid
where student_id=1)
GROUP BY student_id
```

13、查询至少学过学号为“001”同学所有课的**其他同学**学号和姓名；

```mysql
select student_id,sname from score 
LEFT JOIN student on score.student_id=student.sid
where student.sid <> 1 and score.course_id in
(select course.cid from score 
LEFT JOIN course on score.course_id=course.cid
where student_id=1)
GROUP BY student_id 
having count(1)=(select count(score.course_id) from score where student_id = 1)
```

14、查询和“002”号的同学学习的课程完全相同的其他同学学号和姓名；

```mysql
-- 先把和002选择个数一样的，再把不在002选择课程内的剔除
select student_id,sname from score LEFT JOIN student on score.student_id=student.sid
where student_id in 
(select student_id from score where student_id <> 1 GROUP BY student_id HAVING count(1) = (select count(1) from score where student_id=1))
and course_id in (select course_id from score where student_id=1)
GROUP BY student_id HAVING count(1) = (select count(1) from score where student_id=1)
```

15、删除学习“李平”老师课的SC表记录；

```mysql
DELETE from score where score.course_id in 
(select cid from course LEFT JOIN teacher on course.teacher_id=teacher.tid where tname='李平老师')
```

16、向Score表中插入一些记录，这些记录要求符合以下条件：①没有上过编号“002”课程的同学学号；②插入“002”号课程的平均成绩； 

```mysql
insert into score(student_id,course_id,num)
select student_id,2,(select avg(num) from score where course_id=2) from score where course_id!=2
```

17、按平均成绩从低到高显示所有学生的“语文”、“数学”、“英语”三门的课程成绩，按如下形式显示： 学生ID,语文,数学,英语,有效课程数,有效平均分；

```mysql
select 
   student_id as '学生ID',
   (select num from score as s2 where s2.student_id=s1.student_id and course_id=1) as '语文',
   (select num from score as s2 where s2.student_id=s1.student_id and course_id=2) as '数学',
   (select num from score as s2 where s2.student_id=s1.student_id and course_id=3) as '英语'
from score as s1;
```

18、查询各科成绩最高和最低的分：以如下形式显示：课程ID，最高分，最低分；

```mysql
select course_id,max(num),min(num) from score GROUP BY course_id

假如说要求最低分小于10的就显示0那么可以写成如下的：
select course_id,max(num),min(num),case when min(num)<10 then 0 else min(num) end from score GROUP BY course_id
```

19、按各科平均成绩从低到高和及格率的百分数从高到低顺序；

```mysql
select course_id,AVG(num),sum(case when num<60 then 0 else 1 end),sum(1),sum(case when num<60 then 0 else 1 end)/sum(1) as jigelv from score GROUP BY course_id ORDER BY avg(num) asc,jigelv desc
```

20、课程平均分从高到低显示（显示任课老师）；

```mysql
select score.course_id,course.cname,avg(IF(ISNULL(score.num),0,score.num)),teacher.tname from score 
LEFT JOIN course on score.course_id=course.cid 
LEFT JOIN teacher on teacher.tid=course.teacher_id
GROUP BY score.course_id order by avg(num) desc

# 三目运算符，如果score.num为null的话（也就是范围为true，那么给个默认值为0.否则为score.num）
```

21、查询各科成绩前三名的记录:(不考虑成绩并列情况) 

```mysql

```

22、查询每门课程被选修的学生数；

```mysql
select course_id, count(1) from score group by course_id;
```

23、查询出只选修了一门课程的全部学生的学号和姓名；

```mysql
select student_id,sname,count(1) as num from score 
LEFT JOIN student on score.student_id=student.sid
GROUP BY student_id having num=1
```

24、查询男生、女生的人数；

```mysql
select gender,count(1) from student group by gender
```

25、查询姓“张”的学生名单；

```mysql
select sname from student where sname like '张%';
```

26、查询同名同姓学生名单，并统计同名人数；

```mysql
select sname,count(1) as count from student group by sname;
```

27、查询每门课程的平均成绩，结果按平均成绩升序排列，平均成绩相同时，按课程号降序排列；

```mysql
select course_id,avg(if(isnull(num), 0 ,num)) as avg from score group by course_id order by avg asc,course_id desc;
```

28、查询平均成绩大于85的所有学生的学号、姓名和平均成绩；

```mysql
select student_id,sname, avg(if(isnull(num), 0 ,num)) as avgnum from score left join student on score.student_id = student.sid group by student_id having avgnum > 85
```

29、查询课程名称为“数学”，且分数低于60的学生姓名和分数；

```mysql
select student.sname,A.num from student join (
select student_id,num from score left join course on score.course_id = course.cid
where cname='生物' and num < 60
) as A
on student.sid = A.student_id

-- 或者

select student.sname,score.num from score
left join course on score.course_id = course.cid
left join student on score.student_id = student.sid
where score.num < 60 and course.cname = '生物'
```

30、查询课程编号为003且课程成绩在80分以上的学生的学号和姓名； 

```mysql
select * from score where score.student_id = 3 and score.num > 80
```

31、求选了课程的学生人数

```mysql
-- 1、
select count(c) from 
(
select count(student_id) as c from score group by student_id
) as A

-- 2、
select count(distinct student_id) from score
```

32、查询选修“张磊”老师所授课程的学生中，成绩最高的学生姓名及其成绩；

```mysql
select sname,num from score
left join student on score.student_id = student.sid
where score.course_id in 
(
select course.cid from course 
left join teacher on course.teacher_id = teacher.tid 
where tname='张磊老师'
) order by num desc limit 1;
```

33、查询各个课程及相应的选修人数；

```mysql
select course.cname,count(course_id) from score left join course
on score.course_id = course.cid
GROUP BY course.cid
```

*34、查询不同课程但成绩相同的学生的学号、课程号、学生成绩；

```mysql
select DISTINCT s1.course_id,s2.course_id,s1.num,s2.num from score as s1, score as s2 where s1.num = s2.num and s1.course_id != s2.course_id;
```

*35、查询每门课程成绩最好的前两名；

```mysql
select score.sid,score.course_id,score.num,T.first_num,T.second_num from score left join
(
select
    sid,
    (select num from score as s2 where s2.course_id = s1.course_id order by num desc limit 0,1) as first_num,
    (select num from score as s2 where s2.course_id = s1.course_id order by num desc limit 1,1) as second_num
    from
        score as s1
) as T
    on score.sid =T.sid
    where score.num <= T.first_num and score.num >= T.second_num
```

36、检索至少选修两门课程的学生学号；

```mysql
select student_id from score group by student_id having count(student_id) > 1
```

37、查询全部学生都选修的课程的课程号和课程名；

```mysql
-- 找到学生的总数，哪一门课的成绩统计数=课程总数就证明，这门课所有人都学习了
select course_id,count(1) from score group by course_id having count(1) = (select count(1) from student);
```

38、查询没学过“叶平”老师讲授的任一门课程的学生姓名；

```mysql
select student_id,student.sname from score
left join student on score.student_id = student.sid
where score.course_id not in 
(
-- 首先获取到
select cid from course left join teacher on course.teacher_id = teacher.tid where tname = '张磊老师'
)
group by student_id
```

39、查询两门以上不及格课程的同学的学号及其平均成绩；

```mysql
select student_id,count(1) from score where num < 60 group by student_id having count(1) > 2
```

40、检索“004”课程分数小于60，按分数降序排列的同学学号；

```mysql
select student_id from score where course_id = 4 and num < 60 order by num desc;
```

41、删除“002”同学的“001”课程的成绩；

```mysql
delete from score where course_id = 1 and student_id = 2;
```

