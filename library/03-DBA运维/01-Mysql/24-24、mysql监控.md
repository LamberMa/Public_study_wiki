# Mysql的监控

## 1、监控的意义

- 监控更偏重于趋势分析
  - 通过监控的数据展现了了解趋势增长情况
  - 监控程序采集的数据指标也可以用当前DB的性能分析
- 监控分为：
  - 趋势分析类：zabbix，其他等
  - 当前指标分析类：top，iostat，dstat，pt-ioprofile，mysqladmin
    - dstat：一款由Python编写的脚本工具，可以去好好读读dstat的脚本，从中会有所收获的，下载地址如下：http://dstat.sourcearchive.com/
    - pt-ioprofile：这是一个percona提供的工具，属于percona-tools中的一个工具。可以定义mysqld进程进行分析，分析哪个io调用比较高，它可以进行排序并显示出来。pt-ioprofile依赖strace，因此需要安装strace。percona-tools安装如下：



google也开源出来一个监控插件叫[cadvisor](https://github.com/google/cadvisor)，这个是用Go语言写的。

## 2、常用监控工具

### 2.1、top

- user的cpu占用高，常常是因为索引不合理或者是大量的order by，group by的处理
- io_wait高，通常是因为系统io不给力，造成CPU等待，或者随机IO过重，可以使用pt-ioprofile去查看一下到底是谁占用比较高。直接在命令行输入pt-ioprofile就可以。
- sys占用高，一般是因为numa没有关闭；如果不敢确定的话可以使用`pref top`去看一下，
- st占用高，多出现于虚拟化环境，通常是虚拟化环境资源竞争过于严重。如果用的云厂商的话直接投诉云厂商就可以了。

### 2.2、vmstat

si：swap-in、so：swap-out，vmstat中的r和b，r是正在运行的，b是等待io的。如果b比较大的话就需要pt-ioprofile去查一下了。



iops是什么？IO吞吐量是什么？

iops：每秒钟的io处理能力。其中包含了读和写。

iostat：yum -y install sysstat