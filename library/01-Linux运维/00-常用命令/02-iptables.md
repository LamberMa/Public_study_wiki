# Iptables

## 了解防火墙

关闭两项功能：

1、selinux，ids（生产中也是关闭的）

2、iptables（生产中看情况，内网关闭外网打开）

大并发的情况下不能开iptables，影响性能，采用硬件防火墙。

/var/log/messages 出现`kernel：nf_conntrack：table full，dropping packet.`该如何解决这个问题（参考下面的解决方案）

上述结果会让业务访问很慢

大流量下重启 CentOS6 上的 iptables 应注意 [nf_conntrack table full](<http://www.bitbi.biz/blog/2013/06/03/e5a4a7e6b581e9878fe4b88be9878de590af-centos6-e4b88ae79a84-iptables-e5ba94e6b3a8e6848f-nf_conntrack-table-full/>)：

```shell
net.netfilter.nf_conntrack_max = 25000000
net.netfilter.nf_conntrack_max = 25000000
net.netfilter.nf_conntrack_tcp_timeout_established = 180
net.netfilter.nf_conntrack_tcp_timeout_time_wait = 120
net.netfilter.nf_conntrack_tcp_timeout_close_wait = 60
net.netfilter.nf_conntrack_tcp_timeout_fin_wait = 120
```

安全优化：

1、尽可能不给服务器配置外网IP，可以通过代理转发.

2、并发不是特别大情况在外网IP的环境，开启防火墙

其他：http://edu.51cto.com/course/course_id-772.html

防火墙介绍：

iptables又称为Netfilter，其实原名就是Netfilter只不过人们习惯上叫iptables。它是一款开源的开放的基于包过滤的防火墙工具，它强大，灵活，可以对流入和流出服务器的数据包进行很精细的控制，特别是它可以在一台非常低的硬件配置下跑的非常好。Iptables工作在OSI七层的二层，三层，四层。如果重新编译内核，Iptables也可以支持7层控制（squid+Iptables）

