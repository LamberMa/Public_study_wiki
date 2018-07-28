# Squid的代理
## 代理模式
### 透明代理
>所谓的透明代理就是对于用户来说其实他和正常上网没什么区别，但是他走得是代理，对于用户来说，用户是根本感知不到代理的存在的，之前配置的代理我们又称为服务器代理。透明代理一般布置在网络的出口位置

做透明代理具体需求如下：
- 至少有两块网卡，一块连接出口的路由器，另外一块连接公司的内部网络
- 所有的上网请求都通过代理服务器（即把代理服务器设置为网关）

一般要做透明代理的的话，一般要在编译的时候把下面两条参数编译进去：

```
--enable-linux-netfilter
--enable-linux-tproxy
```

配置透明代理很简单（帮助信息可以查看默认文件的http_port的TAG，直接搜索即可）：

```
http_port 3128 transparent
并加入如下的三行
cache_mem 80 MB               ##可以被使用的内存的总数，注意这个值要小于cache_dir中设置的值。
cache_swap_low 90             ##squid使用率低于这个使用率不会进行删除目标      
cache_swap_high 95            ##使用率超过95%，逐出对象的操作更加剧烈
maximum_object_size 8192 KB    ##最大的缓存对象的大小，默认是8K，如果大于这个值就不会放在磁盘里了。
minimum_object_size 0 KB     
maximum_object_size_in_memory 4096 KB   ##这个是允许保存在内存里的对象的最大的大小。超过这个大小就不会保存在内存中了。
emulate_httpd_log on
memory_replacement_policy lru  ##缓存算法 最少最近使用。
refresh_pattern \.(jpg|png|gif|mp3|xml) 1440    50%     2880    ignore-reload
```
设置完透明代理后，进行防火墙的调整：

```
[root@cache-server ~]# iptables -t nat -A POSTROUTING -o eth0 -s 172.16.1.0/24 -j MASQUERADE
开启设备的NAT功能，其中eth0为外网卡，eth1为内网卡，内网网段为172.16.1.0/24，对这个网段做nat转换

[root@cache-server ~]# iptables -t nat -A PREROUTING -i eth1 -p tcp --dport 80 -j REDIRECT --to-ports 3128
把从内网卡收到的请求做一个端口的重定向，针对80端口的访问重定向到squid的3128端口上。

[root@cache-server ~]# vim /etc/sysctl.conf
net.ipv4.ip_forward = 1
开启设备的IP转发

[root@cache-server ~]# sysctl -p            
net.ipv4.ip_forward = 1
net.ipv4.conf.default.rp_filter = 1
net.ipv4.conf.default.accept_source_route = 0
kernel.sysrq = 0
kernel.core_uses_pid = 1
net.ipv4.tcp_syncookies = 1
kernel.msgmnb = 65536
kernel.msgmax = 65536
kernel.shmmax = 68719476736
kernel.shmall = 4294967296
```
测试：

这里我新开了一台机器，网卡地址为172.16.1.100
添加网关为172.16.1.7
```
route add default gw 172.16.1.7
curl -I www.baidu.com
回显为200，说明访问成功了！
```
我们再看squid服务器的日志信息

```
[root@cache-server etc]# tail -f ../var/logs/access.log
1487880222.719     48 172.16.1.100 TCP_MISS/200 2873 GET http://www.baidu.com/ - DIRECT/61.135.169.125 text/html
1487880228.207     41 172.16.1.100 TCP_MISS/200 424 HEAD http://www.baidu.com/ - DIRECT/61.135.169.121 text/html
```
这里的TCP/MISS其实就是代表了没有缓存的意思，透明代理实验成功。

### 反向代理
>公司购买CDN了，那么还要不要搭建squid

基本需求就不是很大了。

#### squid反向代理如何获得数据更新
>squid反向代理一般只缓存可缓冲的数据（比如HTML网页，js，css和图片等），而一些CGI脚本程序或者ASP、JSP、PHP之类的动态程序默认不缓存。它根据从WEB服务器返回的HTTP头标记来缓冲静态页面。有四个重要的HTTP头标记
- Last-Modified：告诉反向代理页面什么时间被修改
- Expires：告诉反向代理页面什么时间应该从缓冲区中删除
- Cache-Control：告诉反向代理页面是否应该被缓冲
- Pragma：用来包含实现特定的命令，最常用的是Pragma：no-Cache

优先级的对比（no-cache，expires，max-age）：

经验：在squid中Caache-control：no-cache→Expires→refresh_pattern→Last-Modified（靠前面的最重要，前面的生效后，后面的基本就失效了）

#### 常用header简单讲解：
1. 不缓存控制
    - Cache-Control：no-store：禁止中间的缓存服务器存储这个对象，并把header转发给用户。
    - Cache-Control：no-cache：缓存服务器可以给文件缓存在本地缓存区，只是在和源站新鲜验证前，不能提供给客户端使用
    - Pragma：：no-cache：这是兼容HTTP1.0的时候使用的，原则上是只能对于HTTP请求，用处和Cache-Control：no-cache一样。
2. 指定过期时间控制
    - Cache-Control：max-age表示如果缓存服务器拿到这个文件后，这个对象多久之内是新鲜的可以用的，可以发送给客户端使用的
    - Cache-Control：s-maxage行为上和上面一样，只是只能适用于public的时候缓存
    - Cache-Control：must-revalidate，默认的情况下，缓存代理时可以提供给客户一些旧的对象的内容，以提高性能，但是如果原始服务器不希望这样，就可以配置这个选项，进行严格的检查，比如源站不可用的时候，回源验证过程会失败，默认会吐旧的数据，但是配置了这个以后会吧报504 gateway timeout
    - Expires：这个作用和max-age是一样的，但这是指定一个过期的日期，但不是秒数。所以不建议使用，因为很多缓存服务器和源服务器常常时间不同步，所以基于max-age是使用相对的时间来表示还剩下多少秒可以使用，不要使用expires来使用绝对时间。

#### 反向代理测试
>测试机器web01(10.0.0.8)

配置文件进行备份加入如下的新内容：

```
#refresh_pattern [-i] regexp min percent max [options]
refresh_pattern -i \.jpg$ 30 50% 4320 reload-into-ims
refresh_pattern -i \.png$ 30 50% 4320 reload-into-ims
refresh_pattern -i \.gif$ 30 50% 4320 reload-into-ims
http_port 80 accel vhost vport
cache_peer 10.0.0.8 parent 80 0 no-query no-digest max-conn=32 originserver
hosts_file /etc/hosts
request_header_max_size 128 KB
ipcache_size 1024
ipcache_low 90
ipcache_high 95
#offline_mode on    ##不管你怎么刷还是ctrl+f5进行强刷不会有影响，普通的情况下如果源站挂了，客户端进行ctrl强刷，缓存是会失效的。
```
**注意：要把所有的系统时间同步再做缓存，否则会对缓存结果产生影响。**
##### Tip
- 这里的cache_peer后面可以跟源站的域名也可以跟源站的ip。我这里直接写的源站的ip，如果你要是写源站的域名的话，记得在本机的/etc/hosts中配置一下。

配置成功以后对squid进行重启，然后访问squid反向代理服务器（设置ntp同步时间的定时任务），发现代理已经成功。返回的日志信息如下：

```
[root@cache-server etc]# tail  /application/squid/var/logs/access.log  
1487894195.232      6 10.0.0.1 TCP_REFRESH_UNMODIFIED/200 77573 GET http://10.0.0.7/4.jpg - FIRST_UP_PARENT/10.0.0.8 image/jpeg
1487894258.432      5 10.0.0.1 TCP_REFRESH_UNMODIFIED/304 386 GET http://10.0.0.7/4.jpg - FIRST_UP_PARENT/10.0.0.8 -
1487894259.700      0 10.0.0.1 TCP_REFRESH_UNMODIFIED/304 386 GET http://10.0.0.7/4.jpg - FIRST_UP_PARENT/10.0.0.8 -
1487894260.369      1 10.0.0.1 TCP_REFRESH_UNMODIFIED/304 386 GET http://10.0.0.7/4.jpg - FIRST_UP_PARENT/10.0.0.8 -
1487894287.578      1 10.0.0.1 TCP_REFRESH_UNMODIFIED/304 386 GET http://10.0.0.7/4.jpg - FIRST_UP_PARENT/10.0.0.8 -
1487894288.384      0 10.0.0.1 TCP_REFRESH_UNMODIFIED/304 386 GET http://10.0.0.7/4.jpg - FIRST_UP_PARENT/10.0.0.8 -
1487894289.968      5 10.0.0.1 TCP_CLIENT_REFRESH_MISS/200 77453 GET http://10.0.0.7/4.jpg - FIRST_UP_PARENT/10.0.0.8 image/jpeg
1487894290.011      1 10.0.0.1 TCP_MISS/404 798 GET http://10.0.0.7/favicon.ico - FIRST_UP_PARENT/10.0.0.8 text/html
1487894291.651      5 10.0.0.1 TCP_CLIENT_REFRESH_MISS/200 77453 GET http://10.0.0.7/4.jpg - FIRST_UP_PARENT/10.0.0.8 image/jpeg
1487894291.688      0 10.0.0.1 TCP_MISS/404 798 GET http://10.0.0.7/favicon.ico - FIRST_UP_PARENT/10.0.0.8 text/html
```
通过curl查看header头：

```
[root@cache-server etc]# curl -I -s 10.0.0.7/1.jpg| grep -i X-cache
X-Cache: HIT from img01.etiantian.org
[root@cache-server etc]# curl -I -s 10.0.0.7/2.jpg| grep -i X-cache
X-Cache: HIT from img01.etiantian.org
[root@cache-server etc]# curl -I -s 10.0.0.7/3.jpg| grep -i X-cache
X-Cache: HIT from img01.etiantian.org
[root@cache-server etc]# curl -I -s 10.0.0.7/4.jpg| grep -i X-cache
X-Cache: HIT from img01.etiantian.org
[root@cache-server etc]# curl -I -s 10.0.0.7/5.jpg| grep -i X-cache
X-Cache: MISS from img01.etiantian.org
```
#### 日志分析
首先看一下配置文件中默认的日志格式：

```
#  TAG: logformat
#       Usage:
#
#       logformat <name> <format specification>
#
#       Defines an access log format.
#
#       The <format specification> is a string with embedded % format codes
#
#       % format codes all follow the same basic structure where all but
#       the formatcode is optional. Output strings are automatically escaped
#       as required according to their context and the output format
#       modifiers are usually not needed, but can be specified if an explicit
#       output format is desired.
#
#               % ["|[|'|#] [-] [[0]width] [{argument}] formatcode
#
#               "       output in quoted string format
#               [       output in squid text log format as used by log_mime_hdrs
#               #       output in URL quoted format
#               '       output as-is
#
#               -       left aligned
#               width   field width. If starting with 0 the
#                       output is zero padded
#               {arg}   argument such as header name etc
#
#       Format codes:
#
#               >a      Client source IP address
#               >A      Client FQDN
#               >p      Client source port
#               <A      Server IP address or peer name
#               la      Local IP address (http_port)
#               lp      Local port number (http_port)
#               ts      Seconds since epoch
#               tu      subsecond time (milliseconds)
#               tl      Local time. Optional strftime format argument
#                       default %d/%b/%Y:%H:%M:%S %z
#               tg      GMT time. Optional strftime format argument
#                       default %d/%b/%Y:%H:%M:%S %z
#               tr      Response time (milliseconds)
#               >h      Request header. Optional header name argument
#                       on the format header[:[separator]element]
#               <h      Reply header. Optional header name argument
#                       as for >h
#               un      User name
#               ul      User name from authentication
#               ui      User name from ident
#               us      User name from SSL
#               Ss      Squid request status (TCP_MISS etc)
#               Sh      Squid hierarchy status (DEFAULT_PARENT etc)
#               mt      MIME content type
#               rm      Request method (GET/POST etc)
#               ru      Request URL
#               rp      Request URL-Path excluding hostname
#               rv      Request protocol version
#               et      Tag returned by external acl
#               ea      Log string returned by external acl
#               <st     Reply size including HTTP headers
#               >st     Request size including HTTP headers
#               st      Request+Reply size including HTTP headers
#               <sH     Reply high offset sent
#               <sS     Upstream object size
#               %       a literal % character
#
#       The default formats available (which do not need re-defining) are:
#
#logformat squid %ts.%03tu %6tr %>a %Ss/%03Hs %<st %rm %ru %un %Sh/%<A %mt
#logformat squidmime %ts.%03tu %6tr %>a %Ss/%03Hs %<st %rm %ru %un %Sh/%<A %mt [%>h] [%<h]
#logformat common %>a %ui %un [%tl] "%rm %ru HTTP/%rv" %Hs %<st %Ss:%Sh
#logformat combined %>a %ui %un [%tl] "%rm %ru HTTP/%rv" %Hs %<st "%{Referer}>h" "%{User-Agent}>h" %S
s:%Sh
#
#Default:
# none
```
设置日志格式：

```
access_log /application/squid3.0/var/logs/access.log combined
logformat combined %{X-Forwarded-For}>h %ui %un [%tl] "%rm %ru HTTPP/%rv" %Hs %<st "%{Referer}>h" "%{
User-Agent}>h" %Ss:%Sh
```
然后访问后查看日志：

```
[root@cache-server etc]# tail -f /application/squid/var/logs/access.log
1487902472.069      2 10.0.0.1 TCP_REFRESH_UNMODIFIED/304 386 GET http://10.0.0.7/4.jpg - FIRST_UP_PARENT/10.0.0.8 -
1487902474.810      2 10.0.0.1 TCP_REFRESH_UNMODIFIED/304 386 GET http://10.0.0.7/4.jpg - FIRST_UP_PARENT/10.0.0.8 -
1487902475.652      1 10.0.0.1 TCP_REFRESH_UNMODIFIED/304 386 GET http://10.0.0.7/4.jpg - FIRST_UP_PARENT/10.0.0.8 -
1487902480.350      1 10.0.0.1 TCP_REFRESH_UNMODIFIED/304 385 GET http://10.0.0.7/3.jpg - FIRST_UP_PARENT/10.0.0.8 -
1487902493.632      1 10.0.0.1 TCP_REFRESH_UNMODIFIED/304 385 GET http://10.0.0.7/2.jpg - FIRST_UP_PARENT/10.0.0.8 -
1487902498.371      2 10.0.0.1 TCP_REFRESH_UNMODIFIED/304 385 GET http://10.0.0.7/1.jpg - FIRST_UP_PARENT/10.0.0.8 -
1487902500.072      1 10.0.0.1 TCP_REFRESH_UNMODIFIED/304 385 GET http://10.0.0.7/1.jpg - FIRST_UP_PARENT/10.0.0.8 -
```


日志缓存编码：

access.log日志缓存编码| 说明
---|---
TCP_HIT | Squid发现请求的资源貌似新鲜的拷贝，并将其立即发送到客户端
TCP_MISS | Squid没有请求资源的cache拷贝
TCP_REFRESH_HIT | squid发现请求的资源貌似陈旧的拷贝，并发送确认请求到源站，源站返回304（未修改）响应，提示squid的拷贝仍然是新鲜的
TCP_REF_FAIL_HIT | squid发现请求的资源貌似陈旧的拷贝，并发送确认请求到源站，然而源站服务器响应失败，或者返回的响应squid不能理解，在此情况下，squid发送现有的cache拷贝（很可能是陈旧的）到客户端
TCP_REFRESH_MISS | Squid发现请求资源貌似陈旧的拷贝，并发送确认请求到源站，源站响应了新的内容弄，只是这个cache拷贝确实是过期了
TCP_CLIENT_REFERSH_MISS | Squid发现了请求资源的拷贝，但是客户端的请求包含了cache-control：no-cache命令，squid转发客户端的请求到原始服务器强迫cache确认，就比如我们在浏览器使用ctrl+F5
TCP_IMS_HIT | 客户端发送确认请求，squid发现更近来的，貌似新鲜的请求资源的拷贝，squid发送更新的内容到客户端，而不联系源站，F5
TCP_SWAPFAIL_MISS | squid发现请求资源的有效拷贝，但从磁盘装载它失败，这时squid发送请求到原始服务器，就如同这是个cache丢失一样
TCP_NEGATIVE_HIT | 在对原始服务器的请求导致HTTP错误的时候，Squid也会cache这个响应，在短时间内对这些资源的重复请求，导致了否命中，negative_ttl指令控制这些错误被cache的时间数量，值得注意的是，这些错误只在内存中cache，不会被写入磁盘，下列状态码可能导致否定的cache：204,305,400,403,404,405,414,500,501,502，503,504
TCP_MEM_HIT | Squid在内存cache里发现请求资源的有效拷贝，并将其立即发往客户端。注意这点并非精确的呈现了所有从内存服务的响应。例如，某些cache在内存里，但要求确认的响应，会以TCP_REFRESH_HIT等形式记录。
TCP_DENIED | 因为http_access或者http_reply_access规则，客户端的情被拒绝了。注意被http_access拒绝的请求在第9域的值是NONE，然而被http_reply_access拒绝的请求，在相应的地方有一个有效值。
TCP_OFFLINE_HIT | 当offline_mode激活的是时候，squid对任何cache响应返回cache命中，而不用考虑它的新鲜程度
TCP_REDIRECT | 重定向程序告诉squid产生一个http重定向到新的URI。正常的，squid不会记录这些重定向，假如要这样做，必须在编译squid前，手工定义LOG_TCP_REDIRECTS预处理命令
