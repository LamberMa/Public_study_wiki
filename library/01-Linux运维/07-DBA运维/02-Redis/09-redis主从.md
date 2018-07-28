# Redis主从

> - 一个redis服务可以由多个该服务的复制品，这个redis服务成为master，其它的复制品为slave
> - 只要网络连接正常，master就会一直把自己的数据更新同步给slave，保持主从同步
> - 只有master可以执行写命令，slave只能执行读命令

## 主从复制的创建

- 配置当前服务器为某redis服务器的slave，在启动的时候。

```shell
redis-server --port 端口 --slaveof <master-ip> <master-port>
```

- slaveof host port 命令将当前服务器状态从master修改为别的服务器的slave

```shell
# 将服务器转换为slave
slaveof 192.168.1.1 6379   
# 将服务器重新恢复到master，不会丢弃已经同步的数据
salveof no one
```

- 配置方式：启动的时候，服务器读取配置文件，并自动成为指定服务器的从服务器。

```shell
slaveof <masterip> <masterport>
slaveof 127.0.0.1 6379
```

- master可以设置密码，设置密码后，需要需要填写密码

```shell
masterauth <passord>
```

- 设置slave大于多少后才允许写入

```shell
min-slaves-to-write <number of slaves>
```

- 设置从服务器的延迟不大于xx

```shell
min-slaves-max-lag <number of seconds>
```

可以看到主从复制的设置方式其实是及其简单的，直接配置一下就可以了。

- 一个master可以有多个slave，首次的复制是全量的，后续的是增量的。
- slave下线只是读请求的性能下降，因为slave一般是只读。
- master下线，写请求无法执行
- 可以手动在一台从机上执行slaveof no one，然后再其它redis上使用slaveof指向这个新的master，实现数据的同步。不过这个过程是纯手动的，如果想要实现自动就需要Sentine哨兵，实现故障转移FailOver操作。
- info replication可以查看主从状态。

### 主从方案

- 一主双从
- 薪火相传，比如ABC，A是B的master，B是C的master。B在角色上是salve，不过在info replication中也是可以看到C这个slave的。

## 哨兵

> 哨兵Sentinel是由官方提供的一个高可用的方案，可以用它来管理多个redis服务的实例，当我们在make编译完成以后会生成一个redis-sentinel的程序文件。Redis Sentinel是一个分布式系统，可以在一个架构中运行多个Sentinel进程

### 启动Sentinel

1. 将src目录下产生的redis-sentinel程序拷贝到`$REDIS_HOME/bin`目录下

2. 期待用一个运行在Sentinel模式下的redis服务实例

   ```shell
   # 第一种方法
   redis-sentinel
   # 第二种方法
   redis-server config路径 --sentinel
   ```

#### Tip

- Sentinel会不断检查Master和slave是否正常
- 每一个Sentinel可以监控任意多个master和该master下的slave

![](http://omk1n04i8.bkt.clouddn.com/18-5-3/22700090.jpg)

当然哨兵本身就是一个单点，存在单点故障。因此我们可以搭建一个Sentinel的集群

### Sentinel网络

> 监控同一个master的Sentinel会自动连接，组成一个分布式的Sentinel网络，互相通信并交换彼此关于被监视服务器的信息。

![](http://omk1n04i8.bkt.clouddn.com/18-5-3/90204474.jpg)

- 当一个Sentinel认为被监视的服务器已经下线时，它会向网络中的其他Sentinel进行确认，判断该服务器是否真的已经下线
- 如果下线的服务器为master，那么Sentinel网络将对下线master服务器进行故障转移，通过将下线的master的某一个slave提升为新的master，并让其它的slave的复制指向新的master，以此来让系统重新回到上线的状态。故障机修复以后自动成为slave。

![](http://omk1n04i8.bkt.clouddn.com/18-5-3/6339105.jpg)

### Sentinel配置文件

- 至少包含一个监控配置选项，用于指定被监控的master的相关信息

  ```shell
  sentinel monitor <name> <ip> <port> <quorum>
  - name : 给监控的主服务器起一个名称
  - ip ：ip地址
  - port ： 端口
  - quorum ：仲裁，需要几台Sentinel同意才判定有效
  举例：
  # 表示master的ip为127.0.0.1，端口为6379的主服务器设置名称为master，仲裁数目为2，表示将这个master判定为下线失效，需要至少两个Sentinel统一，如果多数sentinel同意才会执行故障转移
  sentinel monitor mymaster 127.0.0.1 6379 2
  ```

- 不需要给Sentinel配置从的信息，因为master是知道的，Sentinel会根据master的配置自动发现master的slaves。

- Sentinel的默认端口为26379

#### 配置举例

**配置项**

```shell
port 26379
sentinel monitor m1 192.168.56.101 6379 1
sentinel auth-pass m1 testpass
# 超过3w毫秒后认为主机宕机
sentinel down-after-milliseconds m1 30000
sentinel parallel-syncs m1 1
# 当主从切换多久后认为主从切换失败
sebtinel failover-timeout m1 180000
```

我准备了两台机器，一台192.168.56.101，一台192.168.56.102，101上起了6379.6380.6381三个实例，然后也在102上起了一个实例，其中101的6379是master，其他的都是slave。启动以后哨兵会去自动发现master的slaves这个其实在日志里我们就可以看到，可以很直接的体现：

```shell
# Sentinel runid is 7e5e9e712ad101aeb577042106a5cc8ffddbb45a
# +monitor master m1 127.0.0.1 6379 quorum 1
* +slave slave 127.0.0.1:6380 127.0.0.1 6380 @ m1 127.0.0.1 6379
* +slave slave 127.0.0.1:6381 127.0.0.1 6381 @ m1 127.0.0.1 6379
* +slave slave 192.168.56.102:6379 192.168.56.102 6379 @ m1 127.0.0.1 6379
```

现在手动把master停掉可以发现哨兵的日志立即就有反应，这样的报错会间隔一段时间，有这样一个过程：

```shell
# Connection with master lost.
* Caching the disconnected master state.
* Connecting to MASTER 127.0.0.1:6379
* MASTER <-> SLAVE sync started
# Error condition on socket for SYNC: Connection refused
```

当哨兵真的认为这个master已经挂掉了的时候就会开始采取提主的操作：

```shell
# +sdown master m1 127.0.0.1 6379
+odown master m1 127.0.0.1 6379 #quorum 1/1
# +new-epoch 1
# +try-failover master m1 127.0.0.1 6379
# +vote-for-leader 7e5e9e712ad101aeb577042106a5cc8ffddbb45a 1
# +elected-leader master m1 127.0.0.1 6379
# +failover-state-select-slave master m1 127.0.0.1 6379
# +selected-slave slave 127.0.0.1:6380 127.0.0.1 6380 @ m1 127.0.0.1 6379
* +failover-state-send-slaveof-noone slave 127.0.0.1:6380 127.0.0.1 6380 @ m1 127.0.0.1 6379
* +failover-state-wait-promotion slave 127.0.0.1:6380 127.0.0.1 6380 @ m1 127.0.0.1 6379
* Discarding previously cached master state.
* MASTER MODE enabled (user request)
* Connecting to MASTER 127.0.0.1:6379
* MASTER <-> SLAVE sync started
# Error condition on socket for SYNC: Connection refused
# +promoted-slave slave 127.0.0.1:6380 127.0.0.1 6380 @ m1 127.0.0.1 6379
# +failover-state-reconf-slaves master m1 127.0.0.1 6379
* +slave-reconf-sent slave 127.0.0.1:6381 127.0.0.1 6381 @ m1 127.0.0.1 6379
* Discarding previously cached master state.
* SLAVE OF 127.0.0.1:6380 enabled (user request)
* Connecting to MASTER 127.0.0.1:6380
* MASTER <-> SLAVE sync started
* Non blocking connect for SYNC fired the event.
* Master replied to PING, replication can continue...
* Partial resynchronization not possible (no cached master)
* Slave 127.0.0.1:6381 asks for synchronization
* Full resync requested by slave 127.0.0.1:6381
* Starting BGSAVE for SYNC with target: disk
* Background saving started by pid 6474
* Full resync from master: 2b29611014608aa041ec4b36b1ddb35dc7172ea7:1
* DB saved on disk
* RDB: 0 MB of memory used by copy-on-write
* Background saving terminated with success
* Synchronization with slave 127.0.0.1:6381 succeeded
* MASTER <-> SLAVE sync: receiving 41 bytes from master
* MASTER <-> SLAVE sync: Flushing old data
* MASTER <-> SLAVE sync: Loading DB in memory
* MASTER <-> SLAVE sync: Finished with success
* +slave-reconf-inprog slave 127.0.0.1:6381 127.0.0.1 6381 @ m1 127.0.0.1 6379
* +slave-reconf-done slave 127.0.0.1:6381 127.0.0.1 6381 @ m1 127.0.0.1 6379
* +slave-reconf-sent slave 192.168.56.102:6379 192.168.56.102 6379 @ m1 127.0.0.1 6379
* +slave-reconf-inprog slave 192.168.56.102:6379 192.168.56.102 6379 @ m1 127.0.0.1 6379
# +failover-end-for-timeout master m1 127.0.0.1 6379
# +failover-end master m1 127.0.0.1 6379
* +slave-reconf-sent-be slave 192.168.56.102:6379 192.168.56.102 6379 @ m1 127.0.0.1 6379
* +slave-reconf-sent-be slave 127.0.0.1:6380 127.0.0.1 6380 @ m1 127.0.0.1 6379
# +switch-master m1 127.0.0.1 6379 127.0.0.1 6380
* +slave slave 127.0.0.1:6381 127.0.0.1 6381 @ m1 127.0.0.1 6380
* +slave slave 192.168.56.102:6379 192.168.56.102 6379 @ m1 127.0.0.1 6380
* +slave slave 127.0.0.1:6379 127.0.0.1 6379 @ m1 127.0.0.1 6380
# +sdown slave 127.0.0.1:6379 127.0.0.1 6379 @ m1 127.0.0.1 6380
```

#### 注意事项

- 注意不要在哨兵中写127.0.0.1这种的地址，如果哨兵真的开始切换地址以后从机有可能找不到master。

## 总结

- 主从复制，解决了读请求的分担，从节点下线，会使得读请求能力有所下降
- Master只有一个，存在单点问题
- Sentinel会在master下线后自动执行failover操作，提升一台slave为master，并让其他的slaves重新成为新的master的slaves。
- 主从复制+哨兵Sentinel只解决了读性能和高可用问题，但是并没有解决写性能安全和瓶颈，同时也没有应对应用动态切换地址的方案。