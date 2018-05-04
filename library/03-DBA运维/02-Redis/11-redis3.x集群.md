# Redis集群

> - 3.0支持
> - 由多个redis服务器足证的分布式网络服务集群
> - 每一个redis服务器成为节点node，节点之间会互相通信，两两相连。
> - redis集群无中心节点，没有一个主从的概念，不建议节点数量太多，可能会受到网络io的影响。

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
> gem install redis
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
> 3、安装一个新的版本并使用
> rvm install 2.4.1
> rvm use 2.4.1
> ```
>
> 