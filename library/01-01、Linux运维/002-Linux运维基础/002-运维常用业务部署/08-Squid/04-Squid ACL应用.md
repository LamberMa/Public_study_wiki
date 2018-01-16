# Squid ACL应用实战
### 备份配置文件

```
[root@cache-server etc]# pwd
/application/squid/etc
[root@cache-server etc]# cp squid.conf{,.normal}
[root@cache-server etc]# ll
total 524
-rw-r--r-- 1 root root    419 Feb 23 18:46 cachemgr.conf
-rw-r--r-- 1 root root    419 Feb 23 18:46 cachemgr.conf.default
-rw-r--r-- 1 root root  11651 Feb 23 18:46 mime.conf
-rw-r--r-- 1 root root  11651 Feb 23 18:46 mime.conf.default
-rw-r--r-- 1 root root 165175 Feb 24 00:30 squid.conf
-rw-r--r-- 1 root root 165113 Feb 23 18:46 squid.conf.default
-rw-r--r-- 1 root root 165175 Feb 24 01:13 squid.conf.normal
[root@cache-server etc]# egrep -v "^#|^$" squid.conf.normal >squid.conf
```
在配置文件中加入如下的两行

```
acl sex url_regex -i ^http://.*oldboy.*
http_access deny sex
##这里指的注意的是最下面有一个http_access deny all，这一条命令要放在deny all的前面。
```
然后我们再去访问有关于oldboy关键字的网站的时候就会得到如下的结果：

![](http://omk1n04i8.bkt.clouddn.com/17-3-28/60953621-file_1490695126385_4eba.jpg)

如果我想要禁用域名中包含某些字符串的网址的访问（这里要使用urlpath_regex）：

```
acl sex urlpath_regex archive
http_access deny sex
```
![](http://omk1n04i8.bkt.clouddn.com/17-3-28/57676733-file_1490695421051_178ac.jpg)

使用acl控制上网下载的例子

```
acl BT urlpath_regex -i \.torrents$
acl BT urlpath_regex -i \.torrents$ \.mp3$
http_access deny BT
```
控制访问某黄色网站

```
acl sex url_regex -i ^http://.*sex.*$
http_access deny sex
```
单个IP每秒最多请求（并发）30个：可以用来防止爬虫，多线程下载：

```
acl OverConnLimit maxconn 30
http_access deny OverConnLimit
```

使用acl不记录指定类型文件的日志
```
acl url_no_log urlpath_regex  \.gif \.jpg \.css \.js \.swf \.GIF \.JPG \.SWF F5BigIP
acl method_no_log method PURGE HEAD
access_log /squid/logs/access.log combined !url_no_log !method_no_log
```
### 通过配置实现web管理squid
开启apache
```
[root@cache-server ~]# /application/apache/bin/apachectl start
```
查找

```
[root@cache-server ~]# find /application/squid/ -name "cachemgr.cgi"
/application/squid/libexec/cachemgr.cgi
```
然后将如下内容加入到我们的vhosts文件中，并将主配置文件的端口改为8080，供之后的代理的使用：

```
ScriptAlias "/squid" "/application/squid/libexec/cachemgr.cgi"
<Location "/squid">
       Order   deny,allow
       Deny    from all
       Allow   from all
</Location>

主配置文件：
Listen 8080
# 监听的端口，也可以指定监听哪个IP的指定端口
[root@cache-server ~]# /application/apache/bin/apachectl graceful
```
访问测试：

![](http://omk1n04i8.bkt.clouddn.com/17-3-28/63067339-file_1490696766701_540.jpg)
默认的是没有用户名密码的，这个我们可以进行自定义的设置：

```
cachemgr_passwd oldboy config
上面这条命令的格式为：
cachemgr_passwd 密码 行为
具体请参照default配置文件
```

![](http://omk1n04i8.bkt.clouddn.com/17-3-28/47540237-file_1490696769379_112c1.jpg)
