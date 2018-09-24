# ELK

> 最复杂就是做一个日志的同期对比
>
> 通俗的来讲，ELK就是由ElasticSerach、LogStash、Kibana三个开源软件组成的一个Stack，官方网站为：http://www.elastic.co，这三个组件对应的功能为：logstash是收集，elasticsearch为存储+搜索，kibana则是为我们提供数据的展示。ELK的主要优点可以概括为如下几个：
>
> - 处理方式灵活：elasticsearch是实时全文索引，具有强大的搜索功能。
> - 配置相对简单：elasticsearch全部使用json接口，logstash使用模块配置，kibana配置文件部分更简单
> - 检索性能高效：优秀的设计，虽然每次查询都是实时，但是也可以到百亿级数据的查询秒级响应
> - 集群线性扩展：elasticsearch和logstash都可以灵活线性扩展
> - 前端操作绚丽：kibana的前端设计绚丽，而且操作简单
>
> ELK Installing：https://www.elastic.co/guide/en/elastic-stack/current/installing-elastic-stack.html

## 认识ELK

### Elasticsearch

一个高度可扩展的开源全文搜索和分析引擎，它可以实现数据的实时全文搜索。搜索、支持分布式可实现高可用、提供API接口，可以处理大规模的日志数据，比如nginx，tomcat，系统日志等功能。

## 安装

### 环境初始化

1. 设置主机名，最对应的解析
2. 关闭防火墙和selinux
3. 根据需要挂载磁盘

## Elasticsearch

Elasticsearch提供了多种安装方式，常见的比如源码的，rpm的，以及docker的也有，甚至官方还给你提供了诸如puppet和ansible这样的脚本可以帮你安装。不过最佳实践使用yum安装是最好的。

```shell
# 环境依赖jdk，需要自己先准备好，可以直接去下载jdk或者yum安装，yum默认会帮你安装好最新的
yum -y install java

# 查看java是否安装成功
[root@web01 ~]# java -version
openjdk version "1.8.0_181"
OpenJDK Runtime Environment (build 1.8.0_181-b13)
OpenJDK 64-Bit Server VM (build 25.181-b13, mixed mode)

# 导入ElasticSearch的PGP Key
rpm --import https://artifacts.elastic.co/GPG-KEY-elasticsearch

# 添加yum仓库
[root@web01 ~]# cat /etc/yum.repos.d/elasticsearch.repo 
[elasticsearch-6.x]
name=Elasticsearch repository for 6.x packages
baseurl=https://artifacts.elastic.co/packages/6.x/yum
gpgcheck=1
gpgkey=https://artifacts.elastic.co/GPG-KEY-elasticsearch
enabled=1
autorefresh=1
type=rpm-md

# yum安装ElasticSearch

```

### LogStash

安装套路基本都是一样的，这里依旧使用yum进行安装

```shell
# 导入key，如果你之前导入过的话那么现在就不用再导入了。
rpm --import https://artifacts.elastic.co/GPG-KEY-elasticsearch

# 编辑repo文件，这个其实官方网站提供的是一套，如果安装elastcisearch的时候写好了，这里就可以忽略了。
[logstash-6.x]
name=Elastic repository for 6.x packages
baseurl=https://artifacts.elastic.co/packages/6.x/yum
gpgcheck=1
gpgkey=https://artifacts.elastic.co/GPG-KEY-elasticsearch
enabled=1
autorefresh=1
type=rpm-md

# 安装
yum -y install logstash
```

### Kibana

```shell
# 安装方式都是一样的，使用pgp key和repo文件也是一套，如果你都导入过了就可以不用导入了。
yum -y install kibana
```

