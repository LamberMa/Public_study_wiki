# Haproxy负载均衡


官方网站：http://www.haproxy.org/


>Haproxy是一个专业的负载均衡软件，它支持图形界面，配置简单并且维护方便。拥有对服务器节点的健康检查功能，相当于Keepalived健康检查。后端服务器有故障可以自动摘除，恢复还能自动添加。

Haproxy支持两种主要代理模式
- 基于4层的TCP应用代理，例如可用于邮件服务，内部协议通信服务器，mysql，https服务等
- 基于7层的http代理，在4层tcp代理模式下，haproxy仅在客户端和服务器之间进行流量转发，但是在7层的http代理模式下，haproxy会分析应用层协议，并且能够通过允许，拒绝，交换，增加，修改或者删除请求（request）或者回应（response）里指定的内容来控制协议。

Haproxy有点类似于LVS的NAT模式，来回都要经过Haproxy，因此会存在瓶颈，一般3kw以内的PV都是可以支持的到的，但是Haproxy和NAT模式还不一样，因为NAT模式是实际的去修改包，但是Haproxy是代理客户去请求。

## Haproxy的安装部署


```
useradd haproxy -s /sbin/nologin -M
cd /tools/
wget http://www.haproxy.org/download/1.4/src/haproxy-1.4.27.tar.gz
tar xf haproxy-1.4.27.tar.gz
cd haproxy-1.4.27
make TARGET=linux2628 ARCH=x86_64
make PREFIX=/application/haproxy1.4.27 install
ln -s /application/haproxy1.4.27/ /application/haproxy
```
具体的make参数可以参照README中的帮助信息。

## Haproxy配置调整

官方配置文档说明:http://www.haproxy.org/download/1.4/doc/configuration.txt

配置转发功能：

```
[root@data-1-2 haproxy-1.4.27]# vim /etc/sysctl.conf 
[root@data-1-2 haproxy-1.4.27]# sysctl -p
net.ipv4.ip_forward = 1
```
查看Haproxy的目录结构：

```
[root@data-1-1 haproxy]# tree ./
./
├── doc
│   └── haproxy
│       ├── architecture.txt
│       ├── configuration.txt
│       ├── haproxy-en.txt
│       └── haproxy-fr.txt
├── sbin
│   └── haproxy
└── share
    └── man
        └── man1
            └── haproxy.1

```
为了方便管理应用，创建新的目录：

```
[root@data-1-1 haproxy]# pwd
/application/haproxy
[root@data-1-1 haproxy]# mkdir -p bin conf logs var/run var/chroot
```
### 配置文件总体规划

![](http://omk1n04i8.bkt.clouddn.com/17-4-19/26436219-file_1492564629229_327e.jpg)

配置文件说明：
```
global
     chroot   /application/haproxy/var/chroot
     daemon                                   ##以守护进程的方式运行
     group    haproxy
     user     haproxy
     log      127.0.0.1:514 local0 warning    ##全局日志使用本地514端口的syslog服务中的local0日志设备，日志级别为warning
     pidfile  /application/proxy/var/run/haproxy.pid
     maxconn  20480     ##定义每一个haproxy进程的最大连接数
     spread-checks  3
     nbproc   8         ##设置启动时候启动的进程数，一般保持和主机核心数一致
defaults
     log  global
     mode http          ##mode {http|tcp|health}分别对应7层，4层，健康监测
     #option httplog    ##启用日志记录http请求，默认不记录，只记录时间、日志服务器、实例名称以及信息
     #option dontlognull  ## 启用该项，日志中将不会记录空连接，所谓空连接就是在上游的负载均衡器或者监控系统为了探测业务是否存活可用的时候，需要定期的链接或者获取某一固定的组件或者页面，或者探测扫描端口是否在监听或开放等动作称为空连接。如果该服务上游没有其他的LB的话，那就不要启用这个参数了。
     retries  3
     option redispatch   ##当使用了cookie时，haproxy将会将其请求的后端服务器的serverid插入到cookie中，以保证会话session的持久性，而此时，如果后端的服务器掉了，但是客户端的cookie是不会刷新的，如果设置此参数，将会把客户的请求强制定向到另外的一个后端的server上，以保证服务的正常。
     contimeout   5000      ##单位是ms，新版本使用timeout 
     clitimeout   50000     ##设置链接客户端发送数据的时候链接最长等待时间，默认单位还是毫秒。
     srvtimeout   50000     ##设置服务器回应1客户端数据发送的最长等待时间，单位是毫秒。
     option abortonclose    ##当服务器负载很高的时候，自动结束掉当前队列处理比较久的链接
     option dontlognull
     option httpclose
listen www              ##每一个listen都可看做是一个虚拟主机或者说是实例1
        bind  x.x.x.x:80               ##监听的VIP
        mode http
        no   option splice-response
        stats enable                   ##激活web界面
        stats uri/admin?stats          ##web界面的uri
        stats auth proxy:oldboy        ##web界面的认证
        balance roundrobin             ##负载均衡的策略
        option  httpclose
        option  forwardfor             ##类似于X-forward-for，后端记录真实IP
        option  httpchk HEAD /check.html  HTTP/1.0       ##健康检查
        server  www01 10.0.0.9:80  check     ##realserver1
        server  www02 10.0.0.8:80  check     ##realserver2
```
配置文件样例：

```
[root@data-1-1 conf]# pwd
/application/haproxy/conf
[root@data-1-1 haproxy]# cat ./conf/haproxy.conf
global
     chroot   /application/haproxy/var/chroot
     daemon                                   
     group    haproxy
     user     haproxy
     log      127.0.0.1:514 local0 warning    
     pidfile  /application/haproxy/var/run/haproxy.pid
     maxconn  20000     
     spread-checks  3
     nbproc   8    
     
defaults
     log  global
     mode http          
     retries  3
     option redispatch 
     contimeout   5000 
     clitimeout   50000
     srvtimeout   50000

listen oldboytest 
     bind  *:80
     mode  tcp
     balance roundrobin
     timeout server 15s
     timeout connect 15s
     server  web01 10.0.0.8:22  check port 22 inter 5000 fall 5
     server  web02 10.0.0.18:80  check port 80 inter 5000 fall 5
```
上面的配置文件就是我用10.0.0.7去代理10.0.0.8的ssh，我们可以测试一下：


启动服务
```
# 启动服务
./sbin/haproxy -f ./conf/haproxy.conf -D

# 查看服务启动状态
[root@data-1-1 haproxy]# ps -ef | grep haproxy | grep -v grep    
haproxy    2781      1  0 23:29 ?        00:00:00 ./sbin/haproxy -f ./conf/haproxy.conf -D
haproxy    2782      1  0 23:29 ?        00:00:00 ./sbin/haproxy -f ./conf/haproxy.conf -D
haproxy    2783      1  0 23:29 ?        00:00:00 ./sbin/haproxy -f ./conf/haproxy.conf -D
haproxy    2784      1  0 23:29 ?        00:00:00 ./sbin/haproxy -f ./conf/haproxy.conf -D
haproxy    2785      1  0 23:29 ?        00:00:00 ./sbin/haproxy -f ./conf/haproxy.conf -D
haproxy    2786      1  0 23:29 ?        00:00:00 ./sbin/haproxy -f ./conf/haproxy.conf -D
haproxy    2787      1  0 23:29 ?        00:00:00 ./sbin/haproxy -f ./conf/haproxy.conf -D
haproxy    2788      1  0 23:29 ?        00:00:00 ./sbin/haproxy -f ./conf/haproxy.conf -D
```
测试结果：

```
[root@data-1-1 haproxy]# ssh -p80 10.0.0.7
The authenticity of host '[10.0.0.7]:80 ([10.0.0.7]:80)' can't be established.
RSA key fingerprint is b3:0c:dd:a9:32:6d:14:cb:49:93:5d:aa:b8:34:90:0b.
Are you sure you want to continue connecting (yes/no)? yes
Warning: Permanently added '[10.0.0.7]:80' (RSA) to the list of known hosts.
root@10.0.0.7's password: 
Last login: Tue Apr 18 20:51:30 2017 from 10.0.0.1
[root@data-1-2 ~]# 

结果正常，已经ssh过去了。
```