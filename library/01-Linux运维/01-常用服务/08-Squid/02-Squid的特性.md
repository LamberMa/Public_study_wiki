# Squid的特性
## 文件目录结构
```
[root@cache-server application]# tree -L 2 /application/squid
/application/squid
├── bin
│   ├── RunAccel
│   ├── RunCache
│   └── squidclient
├── etc
│   ├── cachemgr.conf
│   ├── cachemgr.conf.default
│   ├── mime.conf
│   ├── mime.conf.default
│   ├── squid.conf
│   └── squid.conf.default
├── libexec
│   ├── cachemgr.cgi
│   ├── diskd
│   ├── dnsserver
│   ├── ncsa_auth
│   ├── pinger
│   └── unlinkd
├── sbin
│   └── squid
├── share
│   ├── errors
│   ├── icons
│   ├── man
│   └── mib.txt
└── var
    └── logs
```
接下来对目录以及文件进行说明：

文件名/目录名| 功能描述
---|---
sbin | squid主从程序目录，正常只能被root启动
sbin/squid | squid的主程序
bin | bin目录包含对所有用户可用的程序
bin/Runcache | Runcache是一个shell脚本，你能用它来启动squid，假如squid死掉，该脚本自动重启它，除非它检测到经常性的重启
bin/RunAccel | RunAccel与Runcache几乎一致，唯一的不同是它增加了一个命令行参数，告诉squid在哪里侦听HTTP请求。
bin/squidclient | squidclient是一个简单的HTTP客户端程序，你能用他来测试squid。它也有一些特殊功能，用以对运行的squid进程发起管理请求
libexec | libexec程序目录包含了辅助程序，有一些命令你不能正常的启动，然而这些程序通常被其他程序启动。
linexec/unlinkd | unlinkd就是一个辅助程序，它从cache目录里删除文件
libexec/cachemgr.cgi | cachemgr.cgi是squid管理功能的CGI接口。为了使用它，你需要拷贝该程序到你的web服务器的cgi-bin目录
libexec/diskd | 假如你指定了--enable-storeio=diskd，你才能看到它
libexec/pinger | 假如你指定了--enable-icmp，你才能看到它
etc | squid的配置文件目录
etc/squid.conf | squid主配置文件
var | 包含了不是很重要的和经常变化的文件，这些文件不必正常的备份他们
var/logs | 这个目录是squid不同日志文件的默认位置。当你第一次安装squid的时候，它是空的，一旦squid开始运行，你能在这里看到名字为acces.log，cache.log和store.log这样的文件
var/cache | 假如你不在squid.conf文件里指定，这是默认的缓存目录（cache_dir）

## 配置Squid
为了保证squid能够正常使用，我们需要对squid进行一系列的配置，和其他的应用一样，squid的运行也需要有一个账户，默认如果不指定的话那就是nobody

```
cache_effective_user squid
cache_effective_group squid
```
修改squid的日志记录信息

```
access_log /application/squid3.0/var/logs/access.log squid
cache_log /application/squid3.0/var/logs/cache.log
cache_store_log /application/squid3.0/var/logs/store.log
```
打开磁盘的缓存

```
cache_dir ufs /application/squid3.0/var/cache 100 16 256
```
Squid的端口号（默认端口号是3128），如果要做缓存服务器要改成80，如果要做代理那么就不用管，当然这个http_port可以写多个。

```
http_port 3128
```
配置主机名：

```
visible_hostname img01.etiantian.org
```
配置管理员信息：

```
cache_mgr 1020561033@qq.com
```

## Squid的日志文件
squid有三个主要的日志文件：cache.log access.log store.log
- cache.log：squid的配置信息，性能警告，以及严重错误
- access.log：记录访问日志
- store.log：有关存储或者删除cache目标的记录
