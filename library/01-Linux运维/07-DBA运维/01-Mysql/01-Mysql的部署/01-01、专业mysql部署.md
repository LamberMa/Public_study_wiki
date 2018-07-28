# 专家级Mysql部署

> 工欲善其事必先利其器，因此在玩转mysql之前一定要进行合理的Mysql的部署和优化，了解其启动原理等，本文针对Mysql的部署做分步骤的阐述和整理。

## 1、软件准备

目前oracle的mysql的最新的版本是mysql5.7.20.我们可以选择这一个版本进行安装，较旧版来说新版本修复了很多的bug信息，下载网站我们可以去mysql的[官方网站](https://dev.mysql.com)去寻找最新的安装包下载。

Mysql的安装方式不唯一，可以使用编译好的二进制包，可以使用cmake进行手动编译，亦或是yum，rpm方式的安装都是可以的，这里使用编译好的二进制包的方式进行部署。yum方式不做过多的赘述，如果需要了解cmake安装方式的请到第二篇文章查看。

首先需要做的就是下载一个最新版本的符合自身系统的安装包：

```shell
[root@maxiaoyu opt]# ls
mysql-5.7.20-linux-glibc2.12-x86_64.tar.gz
```

## 2、硬件环境的优化

虚拟机或者云端的就不赘述，如果是物理机的还要在硬件和系统层面进行一些优化，因为机器在默认出厂的时候cpu和内存默认的都是节能模式，因此首要应该做的就是改成高性能模式。

- 关闭numa
  - [numa的取舍](http://www.cnblogs.com/yjf512/archive/2012/12/10/2811823.html)，可以查看这一篇文章对numa有一个简单的理解，Mysql属于那种既占用CPU又吃内存的应用，因此建议是关闭掉numa
  - [如何关闭掉numa](http://www.dataguru.cn/thread-462113-1-1.html)，[numa特性禁用](http://www.cnblogs.com/wjoyxt/p/4804081.html).
    - 硬件层：在bios设置中关闭掉
    - OS层：在启动的时候设置关闭掉numa
    - 可以用numactl命令将内存分配策略修改为interleave（交叉）

在OS层我们可以设置启动的时候关闭，直接修改grub.conf文件即可：

```shell
vim /boot/grub/grub.conf
```

![](http://omk1n04i8.bkt.clouddn.com/17-11-6/63141757.jpg)

- 网络优化&/etc/security/limits.conf 

```shell
[root@maxiaoyu opt]# ulimit -a 
core file size          (blocks, -c) 0
data seg size           (kbytes, -d) unlimited
scheduling priority             (-e) 0
file size               (blocks, -f) unlimited
pending signals                 (-i) 7285
max locked memory       (kbytes, -l) 64
max memory size         (kbytes, -m) unlimited
open files                      (-n) 65535
pipe size            (512 bytes, -p) 8
POSIX message queues     (bytes, -q) 819200
real-time priority              (-r) 0
stack size              (kbytes, -s) 8192
cpu time               (seconds, -t) unlimited
max user processes              (-u) 7285
virtual memory          (kbytes, -v) unlimited
file locks                      (-x) unlimited
```

修改ulimit

```shell
echo -e '* soft nproc 65535\n* hard nproc 65535\n* soft nofile 65535\n* hard nofile 65535\n' >> /etc/security/limits.conf
```

修改一些内核参数：

```shell
# 在/etc/sysctl.conf后面添加如下内容
net.ipv4.tcp_max_syn_backlog = 819200
net.core.netdev_max_backlog = 400000
net.core.somaxconn = 4096
net.ipv4.tcp_tw_reuse=1
net.ipv4.tcp_tw_recycle=0
# 添加完成以后手动生效
sysctl -p
```

同时有一个需要注意的是，如果你的机器是开启的多实例的话建议修改一下`max user processes`这个参数，这个参数我们可以在刚才的ulimit -a中查看到，或者我们可以使用ulimit -u去单独查看这个参数的值，那么这个值代表什么意思呢？

这个ulimit -u是用来限制每个用户的最大processes数量。如果ulimit -u进行了限制那么每个linux用户可以派生出来的process就会被限制再这个数值之内。在mysql多实例的时候就很可能会受到这个参数的影响而导致根本无法链接，具体设置可以参考：http://blog.csdn.net/bbaiggey/article/details/51004817

- Swap优化：直接禁用，现在的数据库独立服务器的配置普遍已经很高了，按照之前的一些说法，swap要分内存的1.5~2倍，如果遇到64gb或者128gb内存的情况下，分1.5~2倍其实是很不理智的一个选择，现在内存大多数情况已经够用，因此swap是可以直接禁用掉的，如果要分的话建议分配不超过4g。

- IO优化：针对不同的盘使用不同的策略可以带来不同的优化效果。

  查看对应的磁盘的IO调度策略可以通过如下的方式查看：

  ```shell
  [root@DBServer1 ~]# cat /sys/block/sda/queue/scheduler 
  noop anticipatory deadline [cfq]
  ```

  被括号括起来的就是当前的IO调度策略。那么对于不同的磁盘建议的调度策略如下：

  - SAS：deadline
  - SSD：noop

- 文件系统：关于数据目录毫不犹豫的使用xfs格式的。

- selinux和iptables：selinux建议禁掉，如果你的mysql完全跑内网，那么iptables可以也不用开

  ​

## 3、Mysql的安装

> 基础环境优化完毕以后，就可以进行Mysql数据库的安装了。当然这里使用的是二进制安装包的方式进行安装，如果你使用rpm安装的话这一切都会自动的为你搞定，因为默认的配置都给你设置好了，缺点就是你没办法进行自定义的调整配置。
>
> 当然你也可以把rpm解包，重新做相应的脚本以及再次做rpm包。

### 创建账户

```shell
groupadd mysql
useradd -g mysql -d /usr/local/mysql -s /sbin/nologin -M mysql
id mysql
```

### 软件基本安装

```shell
mkdir /opt/mysql
cd /opt/mysql
tar xf mysql-5.7.20-linux-glibc2.12-x86_64.tar.gz 
cd /usr/local
ln -s /opt/mysql/mysql-5.7.20-linux-glibc2.12-x86_64/ /usr/local/mysql5.7.20
chown -R mysql.mysql mysql5.7.20/
```

### 数据目录创建

```shell
cd /data
mkdir -p 3330/{data,logs,tmp}
```

### 配置文件准备

```shell
# 准备配置文件，你默认的也好，自定义的也好
[root@maxiaoyu 3330]# pwd
/data/3330
[root@maxiaoyu 3330]# ls -l my.cnf
-rw-r--r-- 1 root root 4014 Nov  6 11:58 my.cnf
```

### 初始化Mysql

```mysql
# 5.7的初始化方式
cd /usr/local/mysql5.7.20/
./bin/mysqld --defaults-file=/etc/my.cnf --initialize

# 5.6,5.5,5.1的初始化方式
./script/mysql_db_install
./bin/mysql_db_install
```

### 启动

```shell
# 数据库这里可以设置开启自启，但是一般不建议这么做，如果出问题了，应该先排查问题然后再手动重启。
cp support-files/mysql.server /etc/init.d/mysql
/etc/init.d/mysql start

# 设置开机自启的方式（不建议）
chkconfig add mysql

# 手工启动
/usr/local/mysql/bin/mysqld --defaults-file=/etc/my.cnf &
/usr/local/mysql/bin/mysqld_safe --defaults-file=/etc/my.cnf &
```

### 检查错误日志查看是否正常

启动起来以后还要修改环境变量，是否启动正常从以下几个角度排查

- 起来以后确认进程在不在
- 确认加载的配置文件对不对？
- 看错误日志。查看有没有error信息

### 链接数据库

```shell
# 默认第一次会生成一个随机密码，我们可以在errorlog里看到
cat /data/mysql/mysql3306/data/error.log | grep password 看密码
mysql -S /tmp/mysql3306.sock -p
# 修改密码，这是必要的
>alter user user() identified by 'new_pass';
```

### 关闭数据库

```shell
# 利用系统脚本关闭
/etc/init.d/mysql stop

# 利用mysqladmin关闭，加上-h参数甚至可以关闭掉远端的mysql
mysqladmin -S /tmp/mysql.sock -p shutdown

# 在mysql5.7.19以后多了一个可以在mysql命令行直接打shutdown关闭的命令。
mysql>shutdown;
```

## 4、Mysql安装过程中遇到的问题小结

### 4.1、手贱授权错目录咋整

前面提到了要给mysql的目录授权为属主是mysql，用户组也是mysql，假如说授权错误，比如直接授权给了根目录改咋整，这个时候一定不要退出，否则很可能你就再也登不上来了。具体问题可以参考Linux系统权限修复：http://www.cnblogs.com/xdxhg/p/6139818.html

### 4.2、依赖缺失

```shell
# 查看库的依赖
[root@DBServer1 ~]# ldd /home/mysql/db9018/bin/mysqld 
        linux-vdso.so.1 =>  (0x00007fffdd7ff000)
        libpthread.so.0 => /lib64/libpthread.so.0 (0x0000003c4c800000)
        librt.so.1 => /lib64/librt.so.1 (0x0000003c4cc00000)
        libcrypt.so.1 => /lib64/libcrypt.so.1 (0x0000003c5aa00000)
        libdl.so.2 => /lib64/libdl.so.2 (0x0000003c4c000000)
        libstdc++.so.6 => /usr/lib64/libstdc++.so.6 (0x0000003c53000000)
        libm.so.6 => /lib64/libm.so.6 (0x0000003c4d000000)
        libgcc_s.so.1 => /lib64/libgcc_s.so.1 (0x0000003c52400000)
        libc.so.6 => /lib64/libc.so.6 (0x0000003c4c400000)
        /lib64/ld-linux-x86-64.so.2 (0x0000003c4bc00000)
        libfreebl3.so => /lib64/libfreebl3.so (0x0000003c5ae00000)
```

### 4.3、Selinux没有关闭

```shell
# 临时关闭
setenforce 0 
# 修改配置文件永久关闭，需重启
[root@innerManager1 ~]# cat /etc/sysconfig/selinux 

# This file controls the state of SELinux on the system.
# SELINUX= can take one of these three values:
#     enforcing - SELinux security policy is enforced.
#     permissive - SELinux prints warnings instead of enforcing.
#     disabled - No SELinux policy is loaded.
SELINUX=enforcing
# SELINUXTYPE= can take one of these two values:
#     targeted - Targeted processes are protected,
#     mls - Multi Level Security protection.
SELINUXTYPE=targeted 

将SELINUX=enforcing改为disabled即可
```

### 4.4、文件目录权限不对

```shell
# 如果出现permission denied的相关错误日志就要考虑一下是不是你的权限分配错误了？
chown -R mysql.mysql /data/mysql
```

### 4.5、datadir非空

当datadir不是空的时候，初始化会出现错误，因此确保初始化的时候datadir是空目录。

### 4.6 磁盘空间不够

```shell
df -h
```

### 4.7 初始化参数不对！

参数写错了这个问题其实看似简单但是有时候操作者会有意无意的忽略掉，所以说对待这种问题的时候最好还是看看错误日志，可以立即打醒你。

```shell
cat /data/mysql/data/error.log | grep ERR
```

## 5、遇到问题该怎么处理？

- 查看error.log

大部分的日志错误都是可以在error.log中查看到的，直接去监控错误日志即可。

- 把日志打开
- 启动不起来的话利用mysqld手工启动一下查看
- 利用strace再现一下启动过程

```shell
# 我们使用mysqld的方式去手动启动mysql
strace /usr/local/mysql/bin/mysqld --defaults-file=/etc/my.cnf
# strace的结果是很长的，但是我们需要看的内容并不是很多，记住以下的几个用法即可阅读
- execve相当于调用系统外部命令的一个命令
- mmap相当于把数据读取到内存里面
- access是访问一个文件
- open是打开一个文件
- fstat查看文件状态

execve("/usr/local/mysql/bin/mysqld", ["/usr/local/mysql/bin/mysqld", "--defaults-file=/etc/my.cnf"], [/* 18 vars */]) = 0
brk(0)                                  = 0x37bc000
mmap(NULL, 4096, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f45615b7000
access("/etc/ld.so.preload", R_OK)      = -1 ENOENT (No such file or directory)
open("/etc/ld.so.cache", O_RDONLY|O_CLOEXEC) = 3
fstat(3, {st_mode=S_IFREG|0644, st_size=79083, ...}) = 0
mmap(NULL, 79083, PROT_READ, MAP_PRIVATE, 3, 0) = 0x7f45615a3000
close(3)                                = 0
# 简单的来看一段，可以发现系统的一开始调用了我们的命令，将对应的内容映射到内存中去，然后访问了对应的so库文件，查看文件状态，映射到内存中，接下来的操作基本都是读取各种库文件       
```

通过strace还可以看到加载配置文件的过程（如果指定了defaults-file这个参数，只会读取指定的这个配置文件）：

![](http://omk1n04i8.bkt.clouddn.com/17-11-6/57224031.jpg)

默认的配置文件的读取顺序：

```shell
[root@maxiaoyu 15:29:19 /root]
#mysqld --verbose --help | grep my.cnf
/etc/my.cnf /etc/mysql/my.cnf /usr/local/mysql/etc/my.cnf ~/.my.cnf 
# 可以看到如果没有指定配置文件的位置的话默认会从上面的四个位置读取配置文件。
```

查看加载表结构的过程：

![](http://omk1n04i8.bkt.clouddn.com/17-11-6/77738193.jpg)

mysql5.7的io模型是基于poll的，当看到如下的字样的时候就代表mysql已经启动成功了

```
poll[{fd=33,events=POLLIN},{fd=36,events=POLLIN}],2,-1
```

### 5.1、查看报错代码的意思

如果查看ERROR里面的code代码不知道什么意思的时候该如何处理？

```shell
[root@maxiaoyu 15:35:34 /root]
#/usr/local/mysql/bin/perror 11
OS error code  11:  Resource temporarily unavailable

[root@maxiaoyu 15:35:58 /root]
#/usr/local/mysql/bin/perror 13
OS error code  13:  Permission denied

[root@maxiaoyu 15:36:05 /root]
#/usr/local/mysql/bin/perror 24
OS error code  24:  Too many open files

[root@maxiaoyu 15:36:12 /root]
#/usr/local/mysql/bin/perror 27
OS error code  27:  File too large

[root@maxiaoyu 15:36:14 /root]
#/usr/local/mysql/bin/perror 28
OS error code  28:  No space left on device
```



