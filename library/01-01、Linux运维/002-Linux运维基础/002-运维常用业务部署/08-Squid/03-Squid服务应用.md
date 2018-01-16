# Squid服务应用
## 运行Squid

查看运行前的帮助：

```
[root@cache-server ~]# /application/squid/sbin/squid -h
Usage: squid [-cdhvzCDFNRVYX] [-s | -l facility] [-f config-file] [-[au] port] [-k signal]
       -a port   Specify HTTP port number (default: 3128).    ##指定新的http_port值，如果这里指定了这个选项，那么会覆盖配置文件中的那个值
       -d level  Write debugging to stderr also.              ##让squid将它的调试信息写到标准错误
       -f file   Use given config-file instead of             ##指定配置文件启动
                 /application/squid3.0/etc/squid.conf
       -h        Print help message.               
       -k reconfigure|rotate|shutdown|interrupt|kill|debug|check|parse  ##指定squid执行不同的管理功能，功能参数这里都给列出来了。
                 Parse configuration file, then send signal to
                 running copy (except -k parse) and exit.
       -s | -l facility
                 Enable logging to syslog.         ##激活日志记录到syslog进程。squid使用LOCAL4 syslog设备。
       -u port   Specify ICP port number (default: 3130), disable with 0.
       -v        Print version.
       -z        Create swap directories        ##初始化缓存
       -C        Do not catch fatal signals.
       -D        Disable initial DNS tests.     ##禁止初始化DNS测试，正常请工况下squid直到验证它的dns可用才会启动，该选项阻止了这样的检测。
       -F        Don't serve any requests until store is rebuilt.
       -N        No daemon mode.
       -R        Do not set REUSEADDR on port.
       -S        Double-check swap during rebuild.
       -X        Force full debugging.
       -Y        Only return UDP_HIT or UDP_MISS_NOFETCH during fast reload.
```


检查配置文件语法：

```
[root@cache-server etc]# /application/squid/sbin/squid -k parse
2017/02/24 00:08:27| Processing Configuration File: /application/squid3.0/etc/squid.conf (depth 0)
2017/02/24 00:08:27| cache_cf.cc(346) squid.conf:1707 unrecognized: '/cache_dir'
2017/02/24 00:08:27| Initializing https proxy context
WARNING: Cannot write log file: /application/squid3.0/var/logs/cache.log
/application/squid3.0/var/logs/cache.log: Permission denied
         messages will be sent to 'stderr'.
##这里发现有一个报错提示我们logs文件夹下没有可以写的权限，因此我们需要对目录进行授权。

[root@cache-server etc]# chown -R squid.squid /application/squid/var/logs/

##授权完成以后再次进行配置文件的语法检查
[root@cache-server etc]# /application/squid/sbin/squid -k parse           
2017/02/24 00:09:15| Processing Configuration File: /application/squid3.0/etc/squid.conf (depth 0)
2017/02/24 00:09:15| cache_cf.cc(346) squid.conf:1707 unrecognized: '/cache_dir'
2017/02/24 00:09:15| Initializing https proxy context
```

添加环境变量：

```
[root@cache-server ~]# echo 'export PATH=$PATH:/application/squid/sbin:/application/squid/bin' >> /etc/profile
[root@cache-server ~]# . /etc/profile
[root@cache-server ~]# echo $PATH
/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin:/root/bin:/application/squid/sbin:/application/squid/bin
```
初始化Cache_dir：

```
[root@cache-server ~]# chown -R squid /application/squid/var/
[root@cache-server ~]# squid -z
2017/02/24 00:24:55| cache_cf.cc(346) squid.conf:1707 unrecognized: '/cache_dir'
2017/02/24 00:24:55| Creating Swap Directories
2017/02/24 00:24:55| Making directories in /application/squid3.0/var/cache/00
2017/02/24 00:24:55| Making directories in /application/squid3.0/var/cache/01
2017/02/24 00:24:55| Making directories in /application/squid3.0/var/cache/02
2017/02/24 00:24:55| Making directories in /application/squid3.0/var/cache/03
2017/02/24 00:24:55| Making directories in /application/squid3.0/var/cache/04
2017/02/24 00:24:55| Making directories in /application/squid3.0/var/cache/05
2017/02/24 00:24:55| Making directories in /application/squid3.0/var/cache/06
2017/02/24 00:24:55| Making directories in /application/squid3.0/var/cache/07
2017/02/24 00:24:55| Making directories in /application/squid3.0/var/cache/08
2017/02/24 00:24:55| Making directories in /application/squid3.0/var/cache/09
2017/02/24 00:24:55| Making directories in /application/squid3.0/var/cache/0A
2017/02/24 00:24:55| Making directories in /application/squid3.0/var/cache/0B
2017/02/24 00:24:55| Making directories in /application/squid3.0/var/cache/0C
2017/02/24 00:24:55| Making directories in /application/squid3.0/var/cache/0D
2017/02/24 00:24:55| Making directories in /application/squid3.0/var/cache/0E
2017/02/24 00:24:55| Making directories in /application/squid3.0/var/cache/0F
```
>可以看到上面的结构，记得我们调整cache_dir的时候对应的L1和L2的值么？L1对应的是16个也就是上面的16个目录，L2对应的是256个，意味着上面的每个文件夹下面还有256个目录，以后squid通过hash算法放到这些目录里。

测试启动：

```
[root@cache-server etc]# squid -N -d1         
2017/02/24 00:31:12| Starting Squid Cache version 3.0.STABLE20 for x86_64-unknown-linux-gnu...
2017/02/24 00:31:12| Process ID 77759
2017/02/24 00:31:12| With 4096 file descriptors available
2017/02/24 00:31:12| Performing DNS Tests...
2017/02/24 00:31:13| Successful DNS name lookup tests...
2017/02/24 00:31:13| helperOpenServers: Starting 5/5 'dnsserver' processes
2017/02/24 00:31:13| User-Agent logging is disabled.
2017/02/24 00:31:13| Referer logging is disabled.
2017/02/24 00:31:13| Unlinkd pipe opened on FD 14
2017/02/24 00:31:13| Swap maxSize 102400 + 8192 KB, estimated 8507 objects
2017/02/24 00:31:13| Target number of buckets: 425
2017/02/24 00:31:13| Using 8192 Store buckets
2017/02/24 00:31:13| Max Mem  size: 8192 KB
2017/02/24 00:31:13| Max Swap size: 102400 KB
2017/02/24 00:31:13| Version 1 of swap file without LFS support detected...
2017/02/24 00:31:13| Rebuilding storage in /application/squid3.0/var/cache (CLEAN)
2017/02/24 00:31:13| Using Least Load store dir selection
2017/02/24 00:31:13| Set Current Directory to /application/squid3.0/var/cache
2017/02/24 00:31:13| Loaded Icons.
2017/02/24 00:31:13| Accepting  HTTP connections at 0.0.0.0, port 3128, FD 16.
2017/02/24 00:31:13| Accepting ICP messages at 0.0.0.0, port 3130, FD 17.
2017/02/24 00:31:13| HTCP Disabled.
2017/02/24 00:31:13| Pinger socket opened on FD 19
2017/02/24 00:31:13| Ready to serve requests.
2017/02/24 00:31:13| Done reading /application/squid3.0/var/cache swaplog (0 entries)
2017/02/24 00:31:13| Finished rebuilding storage from disk.
2017/02/24 00:31:13|         0 Entries scanned
2017/02/24 00:31:13|         0 Invalid entries.
2017/02/24 00:31:13|         0 With invalid flags.
2017/02/24 00:31:13|         0 Objects loaded.
2017/02/24 00:31:13|         0 Objects expired.
2017/02/24 00:31:13|         0 Objects cancelled.
2017/02/24 00:31:13|         0 Duplicate URLs purged.
2017/02/24 00:31:13|         0 Swapfile clashes avoided.
2017/02/24 00:31:13|   Took 0.01 seconds (  0.00 objects/sec).
2017/02/24 00:31:13| Beginning Validation Procedure
2017/02/24 00:31:13|   Completed Validation Procedure
2017/02/24 00:31:13|   Validated 25 Entries
2017/02/24 00:31:13|   store_swap_size = 0
2017/02/24 00:31:14| storeLateRelease: released 0 objects
```
如果看到`2017/02/24 00:31:13| Ready to serve requests.`这一行就证明启动成功了。

查看端口占用情况：

```
[root@cache-server ~]# netstat -lntup | grep squid
tcp        0      0 0.0.0.0:3128                0.0.0.0:*                   LISTEN      77759/squid         
udp        0      0 0.0.0.0:3130                0.0.0.0:*                               77759/squid   
```
测试使用：

![](http://omk1n04i8.bkt.clouddn.com/17-3-28/23053038-file_1490692421178_169eb.jpg)

此时我们可以通过IE浏览器去访问一些网站然后发现是访问正常的，此时我们去查看squid的日志：

```
[root@cache-server ~]# tail /application/squid/var/logs/access.log  
1487867890.006  59035 10.0.0.1 TCP_MISS/503 0 CONNECT clients1.google.com:443 - DIRECT/74.125.23.138 -
1487867911.725  24281 10.0.0.1 TCP_MISS/200 657 POST http://bbs.dcgamer.top/json/get_notifications - DIRECT/60.211.204.165 application/json
1487867912.622  10724 10.0.0.1 TCP_MISS/200 6076 CONNECT note.youdao.com:443 - DIRECT/123.58.182.251 -
1487867912.884  10240 10.0.0.1 TCP_MISS/200 6264 CONNECT rpc3.note.youdao.com:443 - DIRECT/123.58.182.209 -
1487867922.003  59465 10.0.0.1 TCP_MISS/503 0 CONNECT clients1.google.com:443 - DIRECT/74.125.23.113 -
1487867924.918    771 10.0.0.1 TCP_MISS/200 1460 GET http://notify3.note.youdao.com/pushserver3/client? - DIRECT/123.58.182.253 text/json
1487867927.219   1760 10.0.0.1 TCP_MISS/200 1460 GET http://notify3.note.youdao.com/pushserver3/client? - DIRECT/123.58.182.253 text/json
1487867937.106  20206 10.0.0.1 TCP_MISS/200 7897 CONNECT note.youdao.com:443 - DIRECT/123.58.182.252 -
1487867937.217  19727 10.0.0.1 TCP_MISS/200 7773 CONNECT rpc3.note.youdao.com:443 - DIRECT/123.58.182.210 -
1487867939.884  24438 10.0.0.1 TCP_MISS/200 657 POST http://bbs.dcgamer.top/json/get_notifications - DIRECT/123.132.254.130 application/json
```
此时其实可以发现有了日志信息了，而且如果说把squid停掉的话我们用ie就上不去网了。上述的启动方式属于前台启动，-N参数表示不使用守护进程模式，因此我们再使用后台模式把squid启动起来。


```
[root@cache-server etc]# squid -D
[root@cache-server etc]# ps -ef | grep squid
root      77799      1  0 00:47 ?        00:00:00 squid -D
squid     77801  77799  0 00:47 ?        00:00:00 (squid) -D
squid     77802  77801  0 00:47 ?        00:00:00 (dnsserver)
squid     77803  77801  0 00:47 ?        00:00:00 (dnsserver)
squid     77804  77801  0 00:47 ?        00:00:00 (dnsserver)
squid     77805  77801  0 00:47 ?        00:00:00 (dnsserver)
squid     77806  77801  0 00:47 ?        00:00:00 (dnsserver)
squid     77807  77801  0 00:47 ?        00:00:00 (unlinkd)
root      77810  77470  0 00:47 pts/0    00:00:00 grep --color squid
```
把squid加入到开机自启动：

```
[root@cache-server etc]# echo "/application/squid/sbin/squid -D">> /etc/rc.local
```
## 制作Squid的启动脚本
很简单的一个脚本
```
[root@cache-server init.d]# cat /etc/init.d/squid
#!/bin/sh
# chkconfig: 345 88 14
# description: To manage squid deamon
case "$1" in
start)
     /application/squid/sbin/squid -D
     ;;
stop)
     /application/squid/sbin/squid -k shutdown
     ;;
restart)
     /application/squid/sbin/squid -k reconfigure
     ;;
parse)
     /application/squid/sbin/squid -k parse
     ;;
check)
     /application/squid/sbin/squid -k check
     ;;
*)
    echo "Usage(start|stop|restart|parse|check)"
     ;;
esac
```
## 日志轮询

```
[root@cache-server init.d]# ll /application/squid/var/logs/
total 648
-rw-r----- 1 squid squid 278098 Feb 24 01:02 access.log
-rw-r----- 1 squid squid  18318 Feb 24 00:59 cache.log
-rw-r--r-- 1 root  squid      6 Feb 24 00:58 squid.pid
-rw-r----- 1 squid squid 350751 Feb 24 01:02 store.log
[root@cache-server init.d]# squid -k rotate
[root@cache-server init.d]# ll /application/squid/var/logs/
total 660
-rw-r----- 1 squid squid    140 Feb 24 01:02 access.log
-rw-r----- 1 squid squid 278236 Feb 24 01:02 access.log.0
-rw-r----- 1 squid squid    457 Feb 24 01:02 cache.log
-rw-r----- 1 squid squid  18318 Feb 24 00:59 cache.log.0
-rw-r--r-- 1 root  squid      6 Feb 24 00:58 squid.pid
-rw-r----- 1 squid squid    178 Feb 24 01:02 store.log
-rw-r----- 1 squid squid 350930 Feb 24 01:02 store.log.0
```
做了两件事：
- 关闭当前打开的日志文件
- 对日志文件进行重命名，如上面的命令显示后面加了个0做为扩展名，一次类推，下一次就是1,2,3……达到你在文件中设置的值。

```
#  TAG: logfile_rotate
#       Specifies the number of logfile rotations to make when you
#       type 'squid -k rotate'. The default is 10, which will rotate
#       with extensions 0 through 9. Setting logfile_rotate to 0 will
#       disable the file name rotation, but the logfiles are still closed
#       and re-opened. This will enable you to rename the logfiles
#       yourself just before sending the rotate signal.
#
#       Note, the 'squid -k rotate' command normally sends a USR1
#       signal to the running squid process.  In certain situations
#       (e.g. on Linux with Async I/O), USR1 is used for other
#       purposes, so -k rotate uses another signal.  It is best to get
#       in the habit of using 'squid -k rotate' instead of 'kill -USR1
#       <pid>'.
#
#Default:
# logfile_rotate 10

```
具体的值是在上面定义的，默认就是10个。
