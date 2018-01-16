# Mysql常见高可用架构

> 常见Mysql高可用大纲
>
> - 基于主从的高可用
> - 基于DRBD+Heartbeat的高可用
> - 官方推荐的Mysql NDB Cluster
> - 基于PXC模型的高可用
> - 基于Proxy模型的高可用
> - Mysql 5.7 Group Replication高可用
> - 基于多源复制高可用
> - 自主实现mysql高可用
> - 业界DB四层架构设计

## 1、基于复制的高可用

**传统的复制模型：**

- statement
- mixed
- row

如果你的mysql版本是5.6以上的话毫不犹豫的建议使用GTID+ROW的形式

### 1.1、基于Keepalived实现主从故障切换



### 1.2、基于MHA的高可用

> 作者已经放弃了对mha的维护了



### 1.3、基于DNS或介入服务的高可用

