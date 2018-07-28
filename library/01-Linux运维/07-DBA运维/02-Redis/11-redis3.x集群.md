# Redis集群

> - 3.0支持
> - 由多个redis服务器足证的分布式网络服务集群
> - 每一个redis服务器成为节点node，节点之间会互相通信，两两相连。
> - redis集群无中心节点，没有一个主从的概念，不建议节点数量太多，可能会受到网络io的影响。
> - redis集群不支持那些需要同时处理多个键的redis命令，因为执行这些命令需要在多个redis节点之间移动数据，并且高负载的情况下，这些命令将降低redis集群的性能，并导致不可预测的行为。

## Redis集群节点复制

- redis集群的每个节点都有两种角色可以选择，主节点，master node。从节点，slave node。其中主节点用于存储数据，而从节点是某一个主节点的复制品。
- 当用户需要处理更多读请求的时候，添加从节点可以扩展系统的读性能。因为redis集群重用了单机redis复制特性的代码，所以集群的复制行为和我们之前介绍的单机复制特性行为是完全一致的。所以一般搭建就是6个node，3主3从。

![](http://omk1n04i8.bkt.clouddn.com/18-5-4/82220774.jpg)

## Redis集群故障转移

- Redis集群的主节点内置了类似redis哨兵的节点故障检测和自动故障转移功能，当集群中的某个主节点下线的时候，集群中的其他在线节点会注意到这一点，并对已下线的主节点进行故障转移。
- 集群进行故障转移的方法和redis哨兵进行故障转移的方法进本一样，不同的是在集群里面，故障转移是由集群中其他的主节点负责进行的，所以集群不必另外使用redis哨兵。

![](http://omk1n04i8.bkt.clouddn.com/18-5-4/80981446.jpg)

## Redis集群分片

- 集群将整个数据库分为16384个槽位（slot），key会存放在这些槽位中的一个，key的槽位的计算公式为（slot_number=crc16(key)%16384），其中crc16位16位的循环冗余校验和函数。
- 集群中的每一个主节点都可以处理0个至16383个槽，当16384个槽为都有某个节点在负责处理的时候集群进入上线状态，并开始处理客户端发送的数据命令请求。

### Example

- 三个主节点7000、7001、7002平均分片16384个slot槽位
- 节点7000分到0~5460
- 节点7001分到5461~10922
- 节点7002分到10923~16383

## Redis集群的重定向

由于redis集群没有中心节点，所以请求会发给任意的主节点。主节点只会处理自己负责的槽位的命令请求，针对其他槽位的命令请求，该主节点会返回客户端一个redirect错误，客户端根据错误中包含的地址和端口重新向正确的负责的主节点发起命令请求。

![](http://omk1n04i8.bkt.clouddn.com/18-5-4/6189858.jpg)

## 搭建Redis集群

- 创建多个主节点
- 为每一个节点指派slot，将多个节点连接起来，组成一个集群。
- 槽位分片完成以后，集群进入上线状态。
- 6个节点，3个主节点，每一个主节点有一个从节点。
- 在应用端可以写一个列表，愿意连接哪个就连接哪个

### 安装新版redis

```shell
# 编译安装过程
cd /tools/
wget http://download.redis.io/releases/redis-4.0.9.tar.gz
tar xf redis-4.0.9.tar.gz 
cd redis-4.0.9
make
mkdir /usr/local/redis4
make PREFIX=/usr/local/redis4 install

# 修改环境变量过程
vim ~/.bash_profile
# 添加上这么一行
export PATH=$PATH:/usr/local/redis4/bin
# 生效环境变量
. ~/.bash_profile
查看生效结果
# which redis-cli
/usr/local/redis4/bin/redis-cli
```

查看编译生成的redis的bin目录

```shell
# 哨兵和sever整合到一起去了
[root@localhost bin]# ll
total 21860
-rwxr-xr-x. 1 root root 2451872 May  3 10:23 redis-benchmark
-rwxr-xr-x. 1 root root 5770168 May  3 10:23 redis-check-aof
-rwxr-xr-x. 1 root root 5770168 May  3 10:23 redis-check-rdb
-rwxr-xr-x. 1 root root 2616976 May  3 10:23 redis-cli
lrwxrwxrwx. 1 root root      12 May  3 10:23 redis-sentinel -> redis-server
-rwxr-xr-x. 1 root root 5770168 May  3 10:23 redis-server
```

准备6个实例，为每一个实例新建一个目录用来保存各自的配置文件

```shell
mkdir -p clustertest/700{0..5}
```

在对应的每一个目录一下新建redis的配置文件，内容如下：

```shell
cluster-enabled yes
# 端口随着每个实例的变动而更改
port 7000
logfile /root/clustertest/7000/redis.log
daemonize yes
cluster-config-file /root/clustertest/7000/nodes.conf
cluster-node-timeout 5000
pidfile "/root/clustertest/7000/redis7000.pid"
```

文件目录：

```shell
[root@DB102 22:38:19 /root/clustertest]
#tree .
.
├── 7000
│   └── redis.conf
├── 7001
│   └── redis.conf
├── 7002
│   └── redis.conf
├── 7003
│   └── redis.conf
├── 7004
│   └── redis.conf
└── 7005
    └── redis.conf
```

启动实例，这里有一个值得注意的点就是在配置文件里我没有指定nodes.conf，那么nodes.conf就会生成在运行redis-server的当前目录，所以需要切换到对应的700x目录里面去运行，否者多个实例启动nodes.conf会冲突，如果不想这样的话就在每一个redis.conf中指定nodes.conf的位置：`cluster-config-file nodes.conf`

```shell
redis-server redis.conf
```

查看端口：

```shell
// 其中700x是客户端端口，1700x是彼此交互用的端口，这个交互用的端口会在cluster-enable=yes的时候启动起来。
[root@DB102 23:30:13 /root/clustertest/7003]
#ss -tanl | grep 700
LISTEN     0      128          *:17002                    *:*                  
LISTEN     0      128          *:17003                    *:*                  
LISTEN     0      128          *:17004                    *:*                  
LISTEN     0      128          *:17005                    *:*                  
LISTEN     0      128          *:7000                     *:*                  
LISTEN     0      128          *:7001                     *:*                  
LISTEN     0      128          *:7002                     *:*                  
LISTEN     0      128          *:7003                     *:*                  
LISTEN     0      128          *:7004                     *:*                  
LISTEN     0      128          *:7005                     *:*                  
LISTEN     0      128          *:17000                    *:*                  
LISTEN     0      128          *:17001                    *:*                  
LISTEN     0      128         :::17002                   :::*                  
LISTEN     0      128         :::17003                   :::*                  
LISTEN     0      128         :::17004                   :::*                  
LISTEN     0      128         :::17005                   :::*                  
LISTEN     0      128         :::7000                    :::*                  
LISTEN     0      128         :::7001                    :::*                  
LISTEN     0      128         :::7002                    :::*                  
LISTEN     0      128         :::7003                    :::*                  
LISTEN     0      128         :::7004                    :::*                  
LISTEN     0      128         :::7005                    :::*                  
LISTEN     0      128         :::17000                   :::*                  
LISTEN     0      128         :::17001                   :::* 
```

### 创建集群

> 脚本槽位分配通过redis-trib这个脚本来进行分配，但是这个脚本是ruby写的，所以还要安装ruby的环境。
>
> ```shell
> yum -y install ruby rubygems
> # ruby用于连接redis的一个组件
> gem install redis
> # 如果说卡住不动可能是镜像源问题，切换一下镜像源
> gem sources --add https://gems.ruby-china.org/ --remove https://rubygems.org/
> gem sources -l
> # 或者将gem的redis安装包下载下来进行本地的安装，也是没有问题的
> gem install --local redis-x.x.x.gem
>
> # 在centos7中有可能会遇到如下的报错：
> #gem install redis
> Fetching: redis-4.0.1.gem (100%)
> ERROR:  Error installing redis:
>         redis requires Ruby version >= 2.2.2.
>         
> # 这是因为centos7的yum库的ruby版本支持到2.0.0，因此需要自己需要自己去升级一下
> #ruby --version
> ruby 2.0.0p648 (2015-12-16) [x86_64-linux]
> ```
>
> 升级ruby的版本
>
> ```shell
> # 使用rvm的方式来更新ruby
> 1、安装rvm
> gpg2 --keyserver hkp://keys.gnupg.net --recv-keys D39DC0E3
> curl -L get.rvm.io | bash -s stable
>
> # find / -name rvm -print
> /usr/local/rvm
> /usr/local/rvm/src/rvm
> /usr/local/rvm/src/rvm/bin/rvm
> /usr/local/rvm/src/rvm/lib/rvm
> /usr/local/rvm/src/rvm/scripts/rvm
> /usr/local/rvm/bin/rvm
> /usr/local/rvm/lib/rvm
> /usr/local/rvm/scripts/rvm
>
> source /usr/local/rvm/scripts/rvm
>
> 2、查看rvm库中已知的ruby版本
> #rvm list known 
> # MRI Rubies
> [ruby-]1.8.6[-p420]
> [ruby-]1.8.7[-head] # security released on head
> [ruby-]1.9.1[-p431]
> [ruby-]1.9.2[-p330]
> [ruby-]1.9.3[-p551]
> [ruby-]2.0.0[-p648]
> [ruby-]2.1[.10]
> [ruby-]2.2[.7]
> [ruby-]2.3[.4]
> [ruby-]2.4[.1]
> ……………………………………省略后续的内容
>
> 3、安装一个新的版本并使用，设置默认版本
> rvm install 2.4.1
> rvm use 2.4.1
> rvm use 2.4.1 --default
>
> 4、移除旧版的ruby
> rvm remove 2.0.0
>
> 5、查看ruby版本，然后再执行上面的安装就没问题了
> #ruby --version
> ruby 2.4.1p111 (2017-03-22 revision 58053) [x86_64-linux]
> ```

找到redis源码包中的src中的redis-trib.rb文件

```shell
[root@DB102 03:36:46 /tools/redis-4.0.9/src]
#pwd
/tools/redis-4.0.9/src

[root@DB102 03:36:55 /tools/redis-4.0.9/src]
#ll redis-trib.rb 
-rwxrwxr-x. 1 root root 65991 3月  27 00:04 redis-trib.rb
```

执行redis-trib.rb文件，简单说明一下，其中`--replicas 1`指定副本数有1，也就后面跟的6个实例里三主三从。

```shell
# create表示希望创建一个新的集群
./redis-trib.rb create --replicas 1 127.0.0.1:7000 127.0.0.1:7001 127.0.0.1:7002 127.0.0.1:7003 127.0.0.1:7004 127.0.0.1:7005

>>> Creating cluster
>>> Performing hash slots allocation on 6 nodes...
Using 3 masters:
127.0.0.1:7000
127.0.0.1:7001
127.0.0.1:7002
Adding replica 127.0.0.1:7004 to 127.0.0.1:7000
Adding replica 127.0.0.1:7005 to 127.0.0.1:7001
Adding replica 127.0.0.1:7003 to 127.0.0.1:7002
>>> Trying to optimize slaves allocation for anti-affinity
[WARNING] Some slaves are in the same host as their master
M: 5ced0e3831b746e8d260abd3cad99f2bd5f746a4 127.0.0.1:7000
   slots:0-5460 (5461 slots) master
M: fc49467f603f0e1ba1bb0f4affc20db1d6d2cc01 127.0.0.1:7001
   slots:5461-10922 (5462 slots) master
M: 35ed50b89426faeb20b50a13854775c4c72bbb5f 127.0.0.1:7002
   slots:10923-16383 (5461 slots) master
S: f582f464475f45be65234e387c8b47375dce07d2 127.0.0.1:7003
   replicates 35ed50b89426faeb20b50a13854775c4c72bbb5f
S: b74bdc8c4e6d0eb8827f8dfb263ff27f68c51945 127.0.0.1:7004
   replicates 5ced0e3831b746e8d260abd3cad99f2bd5f746a4
S: 59b4d618cc6d3afa148a0eb550cde759a8664151 127.0.0.1:7005
   replicates fc49467f603f0e1ba1bb0f4affc20db1d6d2cc01
Can I set the above configuration? (type 'yes' to accept): yes
>>> Nodes configuration updated
>>> Assign a different config epoch to each node
>>> Sending CLUSTER MEET messages to join the cluster
Waiting for the cluster to join....
>>> Performing Cluster Check (using node 127.0.0.1:7000)
M: 5ced0e3831b746e8d260abd3cad99f2bd5f746a4 127.0.0.1:7000
   slots:0-5460 (5461 slots) master
   1 additional replica(s)
M: fc49467f603f0e1ba1bb0f4affc20db1d6d2cc01 127.0.0.1:7001
   slots:5461-10922 (5462 slots) master
   1 additional replica(s)
S: f582f464475f45be65234e387c8b47375dce07d2 127.0.0.1:7003
   slots: (0 slots) slave
   replicates 35ed50b89426faeb20b50a13854775c4c72bbb5f
M: 35ed50b89426faeb20b50a13854775c4c72bbb5f 127.0.0.1:7002
   slots:10923-16383 (5461 slots) master
   1 additional replica(s)
S: b74bdc8c4e6d0eb8827f8dfb263ff27f68c51945 127.0.0.1:7004
   slots: (0 slots) slave
   replicates 5ced0e3831b746e8d260abd3cad99f2bd5f746a4
S: 59b4d618cc6d3afa148a0eb550cde759a8664151 127.0.0.1:7005
   slots: (0 slots) slave
   replicates fc49467f603f0e1ba1bb0f4affc20db1d6d2cc01
[OK] All nodes agree about slots configuration.
>>> Check for open slots...
>>> Check slots coverage...
[OK] All 16384 slots covered.
```

到此为止所有的槽位都被分配完毕了。可以看到slave的中声明的它是谁的从机。查看replicates就可以

### 连接集群

```shell
# 此时使用-p连接谁都行，因为有重定向，-c指的是集群模式，我们可以在设置key的过程看到重定向的日志。所以说其实连接谁并没有所谓。使用keys *查看的话只能查看当前机器拥有的，但是直接get的话是会触发重定向去集群中的其他机器获取的。
#redis-cli -p 7002 -c
127.0.0.1:7002> keys *
(empty list or set)
127.0.0.1:7002> set name lamber
-> Redirected to slot [5798] located at 127.0.0.1:7001
OK
127.0.0.1:7001> set k1 v1
-> Redirected to slot [12706] located at 127.0.0.1:7002
OK

#redis-cli -p 7000 -c
127.0.0.1:7000> get name
-> Redirected to slot [5798] located at 127.0.0.1:7001
"lamber"
```

### 测试集群故障迁移

从上面分配主从的结果可以看到，7004端口的redis是7000redis的从机，我们现在把7000端口的机器干掉查看状况。同时监控7004的日志。

```shell
* Connecting to MASTER 127.0.0.1:7000
* MASTER <-> SLAVE sync started
# Error condition on socket for SYNC: Connection refused
* Connecting to MASTER 127.0.0.1:7000
* MASTER <-> SLAVE sync started
# Error condition on socket for SYNC: Connection refused
* Connecting to MASTER 127.0.0.1:7000
* MASTER <-> SLAVE sync started
# Error condition on socket for SYNC: Connection refused
* Connecting to MASTER 127.0.0.1:7000
* MASTER <-> SLAVE sync started
# Error condition on socket for SYNC: Connection refused
* Connecting to MASTER 127.0.0.1:7000
* MASTER <-> SLAVE sync started
# Error condition on socket for SYNC: Connection refused
* Marking node 5ced0e3831b746e8d260abd3cad99f2bd5f746a4 as failing (quorum reached).
# Cluster state changed: fail
* Connecting to MASTER 127.0.0.1:7000
* MASTER <-> SLAVE sync started
# Start of election delayed for 586 milliseconds (rank #0, offset 696).
# Error condition on socket for SYNC: Connection refused
# Starting a failover election for epoch 7.
# Failover election won: I'm the new master.
# configEpoch set to 7 after successful failover
# Setting secondary replication ID to b99aa1d840d2595474737cbfed4bb0839fa205a7, valid up to offset: 697. New replication ID is 9051b056c1c9b176719449cead1a74162fa51076
* Discarding previously cached master state.
# Cluster state changed: ok
```

从上面的日志里可以看出，当7000断掉了以后从机是立即有所响应并尝试重连的。尝试多次以后通过投票将7000这个redis定义为失效。然后从机7004提升为master，而当我们把7000再次起来的时候7000会落地为从机，并不会去进行争抢。

假如说将一个主干掉了，然后从起来了，但是这个由从提起来的主也挂了，此时相当于三分之一的槽位失效了，此时cluster会失效停止服务，无法进行数据的写入的。

### 动态扩容

重新分片

```shell
./redis-trib.rb reshared 127.0.0.1:7000
```

增加新的节点

```shell
./redis-trib.rb add-node 127.0.0.1:7006 127.0.0.1:7000
```

变成某一个实例的从

```shell
127.0.0.1:7006>cluster replicate 3c3aasddfasfd………………
```

删除一个节点

```shell
# 删除master节点之前首先要使用reshard移除master的全部slot，然后再删除当前节点
redis-trib.rb del-node ip:port '<node-id>'
```



### 集群维护

- 集群状态查看

  ```shell
  redis-cli -p 7000 cluster nodes | grep master
  ```

- 故障转移

  ```shell
  redis-cli -p 7000 debug segfault
  ```

  ​



## 问题

- 在客户端到底应该去连接谁？虽然cluster有重定向的功能，但是恰巧连接的这个节点挂了该怎么办？
- 重新分片是否会造成数据丢失？
- 为什么要重新分片（比如单片key的数据太大。）