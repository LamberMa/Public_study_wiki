Redis主从

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



