# Squid
>缓存服务器（又可以称为代理服务器），即用来存储（介质为内存和硬盘）用户访问的网页，图片，文件等等细信息的专用服务器。这种服务器不仅可以使用户最快的得到他们想要的信息，而且可以大大减少服务端网络传输的数量。缓存服务器往往也是代理服务器，对于网站的用户来说，缓存服务器和代理服务器是不可见的，即在用户看来所有的网站信息都来自其正在访问的网站，而实际上可能是缓存服务器正在提供访问数据。目前国内常用的的缓存服务器有：squid，varnish，Nginx，ats。

Squid官网网站 [http://www.squid-cache.org](http://www.squid-cache.org)

## Web缓存相关概念
### cache命中
cache命中指的是cache server每次从它的缓存里满足客户端HTTP请求时发生。cache命中率，是所有客户端HTTP请求中命中的比例。Web缓存典型的命中率在30%~60%之间。另一个相似的度量单位叫做字节命中率，描绘了cache提供服务的数据容量（字节数）。
#### 如何提高命中率？
* apache nginx可以设置expires的cache-control缓冲头
* 动静分离，静态化，对静态文件走CDN
* mysql cache让缓存靠前
### cache丢失
cache丢失在cache server不能从它的换村里满足客户端HTTP请求的时候发生。cache丢失的原因有很多种。
- 当第一次接收到用户请求的第一个新资源的时候，就会产生一个cache丢失。那么如何解决第一次命中？
    - 预热或者预取，后端生成数据后统一推到前端。
- 存储空间满或者对象自身过期，cache server会自动清除这些缓存对象以释放空间给新的对象。因此为了避免这个问题可以加大内存和磁盘，或者过期时间设置的长点；参数设置，缓存的参数设置的大一些，最大缓存对象2M。分资源缓存，比如1M的，10M的100M的，页面和视频进行分拆（通过acl或者正则匹配抛给不同的pools）。
- 还有可能是客户访问的资源不可到达。原始服务器会指示cache server怎样处理用户响应，比如会提示数据不能被缓存，或在有限的时间内才被重复使用等等。
### cache确认
cache确认保证cache server不对访问的用户返回过期的数据。在重复使用缓存对象的时候，cache server需要经常从原始服务器确认它。假如服务器只是squid的拷贝仍然有效，数据就发送出去，否则，squid更新它的缓存拷贝，并且转发给客户。当用户更新了数据到数据库或者存储服务器的时候，就可以从业务角度主动调用该接口清除该对象缓存的指令。

## Squid服务

### Squid的用途
- 用于放置在web服务器的前面，缓存网站web服务器的相关数据，这样用户请求缓存服务器就可以直接返回数据给用户了，从而提升了用户访问网站的体验，从另一方面也减轻了web服务器，数据库服务器的，图片文件存储服务器等业务的压力。这种应用也成为1反向代理业务。
- 用于放置在企业内部关键出网位置或者共享网络的前端，缓存内部上网用户的数据，域名系统和其他网络搜索数据等。这样会大大的节约公司的带宽，这种应用被称之为正向代理（普通代理或者透明代理）
- 通过放在网络的关键位置过滤网络流量和访问数据，提升整个网络的安全性，比如可以监控以及限制内部企业员工的上网行为，可以和iptables配合做为办公网的网关。
- 用作局域网通过代理上网

### 透明代理
所谓透明代理是相对于代理服务器而言，客户端不需要做任何和代理服务器相关的设置和操作，对于用户而言，感受不到代理服务器的存在，所以称之为透明代理，即把代理服务器部署在核心的上网出口，当用户上网浏览页面的时候，会交给代理服务器向外请求，如果结合iptables可以实现代理+网关+内容过滤+流量安全控制等完整的上网解决方案。

### 反向代理
普通代理方式是代理内部网络用户访问Internet，反向代理服务器是指的代理服务器来接受来自internet上的请求，然后将请求转发给内部网络上的服务器，并将从内部服务器上得到的结果返回给internet上请求链接的客户端，此时代理服务武器对外就表现为一个服务器。

## Squid部署
>磁盘和内存的关联，因为squid对每个缓存响应使用少数内存，因此在磁盘空间和内存要求之间有一定的联系，基本规则是，每个G次哦按空间需要32M内存，这样，512M内存的系统能支持16G的磁盘缓存。根据情况不同，实际情况也不一样，内存需求依赖于如下的事实：缓存目标大小，CPU体系（32为或64位），同时在线的用户数量和你使用的特殊功能。

### 虚拟机测试环境
- 内存：大于等于512M
- 硬盘：8-16G或更高
- VM：1-2个牟其中一个部署缓存服务器，一个部署web服务器做测试使用。

名称 | 接口 | IP | 用途
---|---|---|---|
Squid server | eth0 | 10.0.0.7 | 外网管理IP，用于WAN数据转发
Web Server | eth0 | 10.0.0.8 | 外网管理IP，用于WAN数据转发

#### 软件下载安装

```
yum -y install openssl-devel
wget http://www.squid-cache.org/Versions/v3/3.0/squid-3.0.STABLE20.tar.gz
tar xf squid-3.0.STABLE20.tar.gz
cd /tools/squid-3.0.STABLE20

```
#### 编译参数：

```
[root@web02 squid-3.0.STABLE20]# ./configure --prefix=/application/squid3.0 \
--enable-async-io=100 \
--with-pthreads \
--enable-storeio="aufs,diskd,ufs" \
--enable-removal-policies="heap,lru" \
--enable-icmp \
--enable-delay-pools \
--enable-useragent-log \
--enable-referer-log \
--enable-kill-parent-hack \
--enable-cachemgr-hostname=localhost \
--enable-arp-acl \
--enable-default-err-language=English \
--enable-err-languages="Simplify_Chinese English" \
--disable-poll \
--disable-wccp \
--disable-wccpv2 \
--disable-internal-dns \
--enable-basic-auth-helpers="NCSA" \
--enable-stacktrace \
--with-large-files \
--disable-mempools \
--with-filedescriptors=64000 \
--enable-ssl \
--enable-x-accelerator-vary \
--disable-snmp \
--with-aio \
--enable-linux-netfilter \
--enable-linux-tproxy
```
#### 安装

```
make && make install
[root@cache-server application]# ln -s /application/squid3.0/ /application/squid
```


#### 关于编译参数的说明

```
--prefix=/application/squid3.0 \                     
##指定安装位置是哪里默认是/usr/local/squid
--enable-async-io=100 \
##使用100个线程进行同步IO
--with-pthreads \
##使用POSIX（可移植性操作系统接口）线程
--enable-storeio="aufs,diskd,ufs" \                  
##支持ufs和aufs文件存储
--enable-removal-policies="heap,lru" \
##指定排除元素，排除元素是squid需要腾出空间给新的cache目标，用以排除旧的目标的机制，squid在2.5的时候支持3个排除元素：最少近期使用（LRU）、贪婪对偶大小（GDS）、最少经常使用（LFU）
--enable-icmp \                                      
##squid利用icmp消息来确定回环试件尺寸，非常像ping程序。目的是激活netdb，必须使用--enable-icmp选项来配置squiid，也必须以超级用户权限来安装pinger程序。
--enable-delay-pools \
##启用延迟池，，延迟池是squid用于传输形状或带宽限制的技术。该池由大量的客户端IP地址组成，当来自这些客户端的请求处理cache丢失状态，它们的响应可能被人工延迟
--enable-useragent-log \
##该选项用来激活来自客户请求的HTTP用户代理头的日志
--enable-referer-log \
##激活客户请求的HTTP referer日志
--enable-kill-parent-hack \
##Useful for hackers only
--enable-cachemgr-hostname=localhost \
--enable-arp-acl \
##squid在一些操作系统中支持ARP，或者acl，该代码使用非标准的函数接口来执行arp访问控制列表，所以它被默认禁止，假如你在linux或solaris上使用squid，你可能用上这个功能
--enable-default-err-language=English \
##设置error_directory指令的默认值
--enable-err-languages="Simplify_Chinese English" \
##指定复制到安装目录($prefix/share/errors)的语言，不指定安装所有
--disable-poll \                                    
##强制使用“poll()”函数扫描文件描述符
--disable-wccp \
##禁用wccp协议
--disable-wccpv2 \
##禁用wccp协议v2
--disable-internal-dns \
##禁用内部dns
--enable-basic-auth-helpers="NCSA" \
##设置基础帮助名单
--enable-stacktrace \
##启用崩溃追踪，squid崩溃后会自动记录cache.log
--with-large-files \
##启用大文件服务
--disable-mempools \
--with-filedescriptors=64000 \
##默认文件描述符是65535
--enable-ssl \
--enable-x-accelerator-vary \
##该高级功能可能在squid被配置成加速器的时候使用，他建议squid在响应请求时，从后台原始服务器中寻找X-Acceleerator-Vary头
--disable-snmp \
--with-aio \
--enable-linux-netfilter \
--enable-linux-tproxy
##上面这两个参数在
```
