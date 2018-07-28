# Twitter-TwemProxy

>- 主从对写压力没有分担，因此考虑可以使用多个节点进行分担，将请求分担到不同的节点处理
>- 分片sharding，多借点分担的思路就是关系型数据库处理大表水平切分的思路。
>
>![](/var/folders/8l/g95nllln61j4ly_zm_tqj2m40000gn/T/abnerworks.Typora/image-201805040949289.png)

## Twemproxy

> Twitter开发的，用来代理用户的读写请求。
>
> - Twitter开发的代理服务器，它兼容redis也兼容memcached，允许用户将多个redis服务器添加到一个服务器池（pool）里面，并通过用户选择的**散列函数**和**分布函数**，将来自客户端的命令请求分发给服务池中的各个服务器
> - 通过使用twemproxy我们可以将数据库分片到多态redis服务器上面，并使用这些服务器来分担系统压力以及数据库容量：在服务器硬件条件相同的情况下，对于一个包含n台redis服务器的池来说，池中每台平均处理1/N的客户端请求
> - 向池里添加更多服务器可以线性的扩展系统处理命令请求的能力，以及系统能够保存的数据量。之所以这么说是客户端写请求过来的时候twemproxy会计算一个key的散列值，每一个服务器会有一个自己散列值对应的的范围，如果这个key的散列值范围在对应的服务器范围内，那么请求就到对应的服务器上。
> - 一个代理存在单点故障

![](http://omk1n04i8.bkt.clouddn.com/18-5-4/22811802.jpg)

## Twemproxy安装

> Github:https://github.com/twitter/twemproxy

安装步骤：

```shell
# 如果说yum安装的相关软件包的版本过低的话需要自己手动编译安装。
yum -y install autoconf automake libtool
tar xf nutcracker-0.4.1.tar.gz
cd nutcracker-0.4.1
mkdir /usr/local/twemproxy
./configure --prefix=/usr/local/twemproxy
make && make install
```

新建一个配置文件，在当前目录下就可以，配置内容如下：

```shell
[root@DB102 20:41:49 /root/nutcracker-0.4.1]
#vim tp.yml
sxt:
  listen: 192.168.56.101:22121
  hash: fnv1a_64
  distribution: ketama
  auto_eject_hosts: true
  redis: true
  server_retry_timeout: 2000
  server_failure_limit: 3
  servers:
    - 192.168.56.101:6379:1
    - 192.168.56.101:6380:1
    - 192.168.56.101:6381:1
```

启动twemproxy之前先确保redis都起来了。

```shell
[root@DB102 20:45:56 /root/nutcracker-0.4.1]
#ps -ef | grep redis | grep -v grep
root     18526  7402  0 20:45 pts/0    00:00:00 redis-server *:6379
root     18542  7402  0 20:45 pts/0    00:00:00 redis-server *:6380
root     18550  7402  0 20:45 pts/0    00:00:00 redis-server *:6381
```

启动twemproxy：

```shell
# 其中-d表示以daemon的方式去运行。-c指定配置文件
[root@DB102 20:47:36 /root/nutcracker-0.4.1]
#/usr/local/twemproxy/sbin/nutcracker -d -c tp.yml
```

查看服务状态

```shell
#netstat -antup | grep 22121
tcp        0      0 192.168.56.101:22121    0.0.0.0:*               LISTEN      18774/nutcracker 
```

twemproxy代理了redis协议，我们就可以直接去连接它了，记得加上-h主机。

```shell
[root@DB102 20:56:22 /root/nutcracker-0.4.1]
#redis-cli -p 22121 -h 192.168.56.101
192.168.56.101:22121> set msg 111 
OK
192.168.56.101:22121> get msg
"111"
```

最后这个数据会放到后端的一台机器上，我们现在后端代理了三台机器，会放到其中一台机器上。这里我们也看到了这个问题，就是目前几台数据是不同步的。如果其中有一个节点挂掉了，那么这个数据就访问不到了，除非你再上线这个redis才能访问到。

## Twemproxy配置

```shell
# 这个配置是yaml格式的，每一个层级固定两个空格。而且冒号后要有一个空格。
sxt:
  listen:192.168.56.201:22121
  hash:fnv1a_64
  distribution:ketama
  auto_eject_hosts:true
  redis:true
  server_retry_timeout:2000
  server_failure_limit:3
  servers:
    - 192.168.56.201:6379:1
    - 192.168.56.202:6379:1
    - 192.168.56.203:6379:1
```

- ext：server pool的名称，可以创建多个serverpool
- listen：server pool监听的地址和端口号
- hash：key的散列算法，用于将key映射为一个散列值
- distribution：key的分布算法，决定key被分布到哪一个服务器
- redis：代理redis请求，不给定这个值的时候默认代理memcached请求，true表示代理redis
- servers：pool中各个服务器的地址和端口号以及权重
- server_retry_timeout：连不上的超时时间
- auto_eject_hosts：设置为true表示当请求的散列范围对应到某个服务器，但是服务器无法访问的时候直接拒绝掉这个请求，这样效率会高一些。
- server_failure_limit：twemproxy连续n次向同一个服务器发送命令请求都遇到错误的时候，twemproxy就会将改服务器标记为下线，并交由pool中其他在线服务器采集；哦

## 整合方案

redis-mgr：通过整合复制，哨兵以及twemproxy等组件，提供了一站式的redis服务器部署，监控，迁移功能。网址`https://github.com/changyibiao/redis-mgr`。或者使用更好的方案，redis集群。

## 小结

- 扩展不是很方便，容错率低
- 代理存在单点问题
- 后端服务器数据不同步
- 前端使用proxy做代理，后端的redis可以基本根据key来进行比较均衡的分布
- 如果后端的redis挂掉以后，代理能够自动摘除，恢复后，代理还能自动识别，恢复并加入到redis分组中重新使用。
- redis挂掉以后，后端数据是否丢失依据redis本身的持久化策略配置，与twemproxy无关
- 新加redis需要重启twemproxy，并且数据不会自动重新的rebanlance，需要人工写脚本来实现。
- 如果原来有两个节点redis，后续又增加两个redis，则数据分布计算与原来的redis分布无关，现有数据如果需要分布均匀的话，需要人工单独处理。
- 如果twemproxy的后端节点数量发生变化，twemproxy相同算法的前提下，原来的数据必须重新处理分布，否则会存在找不到key值的情况。
- 不管twemproxy后端有几台redis，前端的单个twemproxy的性能最大也只能和单台redis性能差不多。
- 如同时部署多台twemproxy配置一样，客户端分别连接多台twemproxy可以在一定条件下提高性能。