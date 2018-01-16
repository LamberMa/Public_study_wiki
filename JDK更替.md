# JDK更替摘要

- 操作日期：2017/11/24
- 操作人：龙信运维1

> 旧版JDK：
>
> - 版本号：1.7.0_131
> - 路径：/usr/bin/java.1.7_2017-11-24 （仅作重命名操作，便于回滚）
>
> 新版JDK：
>
> - 版本号：1.8.0_144
> - 路径：/lhdata/packages/jdk1.8.0_144
> - 软连接：/usr/local/jdk
>
> 操作主机（移动审批客户端服务器）：
>
> - 192.168.11.33
> - 192.168.11.34
> - 192.168.11.35
>
> 环境变量(/etc/profile)，修改全局变量，81~83行：
>
> ```shell
> export JAVA_HOME=/usr/local/jdk
> export PATH=$JAVA_HOME/bin:$JAVA_HOME/jre/bin:$PATH
> export CLASSPATH=.$CLASSPATH:$JAVA_HOME/lib:$JAVA_HOME/jre/lib:$JAVA_HOME/lib/tools.jar
> ```
>
> 结果：
>
> ```shell
> [root@pc208 ~]# java -version
> java version "1.8.0_144"
> Java(TM) SE Runtime Environment (build 1.8.0_144-b01)
> Java HotSpot(TM) 64-Bit Server VM (build 25.144-b01, mixed mode)
> ```