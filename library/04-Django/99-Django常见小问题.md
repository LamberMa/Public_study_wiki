# Django常见小问题汇总

## 数据库问题

1. 数据库字符集问题，主要原因是数据库的字符集不对，可以创建数据库的时候指定字符集，比如`create database xxx charset utf8`亦或是修改数据库的配置文件在[mysqld]下添加如下的两条内容：`default-character-set=utf8`和`init_connect=’SET NAMES utf8′`；

   ```python
   django.db.utils.InternalError: (1366, "Incorrect string value: '\\xE7\\x94\\xA8\\xE6\\x88\\xB7' for column 'name' at row 1")
   ```




## 其他问题

