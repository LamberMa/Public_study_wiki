# Tomcat基础部署

## 统一用户

```
[root@web01 tools]# useradd -u 601 tomcat
[root@web01 tools]# passwd tomcat
Changing password for user tomcat.
New password: 
BAD PASSWORD: it is based on a dictionary word
BAD PASSWORD: is too simple
Retype new password: 
passwd: all authentication tokens updated successfully.
[root@web01 tools]# id tomcat
uid=601(tomcat) gid=601(tomcat) groups=601(tomcat)
```

## 部署JDK和Tomcat


```
[root@web01 tools]# tar xf jdk-8u121-linux-x64.tar.gz 
[root@web01 tools]# mv jdk1.8.0_121/ /usr/local/
[root@web01 tools]# ln -s /usr/local/jdk1.8.0_121/ /usr/local/jdk
[root@web01 tools]# tar xf apache-tomcat-8.5.13.tar.gz 
[root@web01 tools]# mv apache-tomcat-8.5.13 /usr/local/
[root@web01 tools]# ln -s /usr/local/apache-tomcat-8.5.13/ /usr/local/tomcat
```

### 设置环境变量

```
export JAVA_HOME=/usr/local/jdk
export PATH=$JAVA_HOME/bin:$JAVA_HOME/jre/bin:$PATH
export CLASSPATH=.$CLASSPATH:$JAVA_HOME/lib:$JAVA_HOME/jre/lib:$JAVA_HOME/lib/tools.jar
export TOMCAT_HOME=/usr/local/tomcat/

添加到profile文件中
[root@web01 local]# source /etc/profile
```

确认tomcat的版本号：

```
[tomcat@lamber tomcat]$ ./bin/version.sh 
Using CATALINA_BASE:   /usr/local/tomcat
Using CATALINA_HOME:   /usr/local/tomcat
Using CATALINA_TMPDIR: /usr/local/tomcat/temp
Using JRE_HOME:        /usr/local/jdk
Using CLASSPATH:       /usr/local/tomcat/bin/bootstrap.jar:/usr/local/tomcat/bin/tomcat-juli.jar
Server version: Apache Tomcat/8.5.16
Server built:   Jun 21 2017 17:01:09 UTC
Server number:  8.5.16.0
OS Name:        Linux
OS Version:     2.6.32-042stab093.5
Architecture:   amd64
JVM Version:    1.8.0_121-b13
JVM Vendor:     Oracle Corporation
```

## 启动tomcat


```
[root@web01 ~]# chown -R tomcat.tomcat /usr/local/jdk /usr/local/tomcat/
[root@web01 ~]# su - tomcat
[tomcat@web01 ~]$ java -version
java version "1.8.0_121"
Java(TM) SE Runtime Environment (build 1.8.0_121-b13)
Java HotSpot(TM) 64-Bit Server VM (build 25.121-b13, mixed mode)
```
注意所有的web服务器在初始化的时候一定要修改ulimit

```
[tomcat@web01 ~]$ /usr/local/tomcat/bin/startup.sh 
Using CATALINA_BASE:   /usr/local/tomcat
Using CATALINA_HOME:   /usr/local/tomcat
Using CATALINA_TMPDIR: /usr/local/tomcat/temp
Using JRE_HOME:        /usr/local/jdk
Using CLASSPATH:       /usr/local/tomcat/bin/bootstrap.jar:/usr/local/tomcat/bin/tomcat-juli.jar
Tomcat started.

[tomcat@web01 ~]$ netstat -lntup | grep 8080
(Not all processes could be identified, non-owned process info
 will not be shown, you would have to be root to see it all.)
tcp        0      0 :::8080                     :::*                        LISTEN      7764/java 
```
配置管理用户

```
[tomcat@web01 conf]$ vim tomcat-users.xml 
<role rolename="manager-gui" />
<role rolename="admin-gui" />
<user username="tomcat" password="redhat" roles="manager-gui,admin-gui" />
```
重启Tomcat

```
[tomcat@web01 tomcat]$ bin/shutdown.sh 
Using CATALINA_BASE:   /usr/local/tomcat
Using CATALINA_HOME:   /usr/local/tomcat
Using CATALINA_TMPDIR: /usr/local/tomcat/temp
Using JRE_HOME:        /usr/local/jdk
Using CLASSPATH:       /usr/local/tomcat/bin/bootstrap.jar:/usr/local/tomcat/bin/tomcat-juli.jar
[tomcat@web01 tomcat]$ bin/startup.sh 
Using CATALINA_BASE:   /usr/local/tomcat
Using CATALINA_HOME:   /usr/local/tomcat
Using CATALINA_TMPDIR: /usr/local/tomcat/temp
Using JRE_HOME:        /usr/local/jdk
Using CLASSPATH:       /usr/local/tomcat/bin/bootstrap.jar:/usr/local/tomcat/bin/tomcat-juli.jar
Tomcat started.
```
如果写一个重启脚本的话就是先kill tomcat然后等待20~30s，看看有没有杀掉进程，如果没有杀掉就采用强制手段kill -9。然后清空temp和work目录下的临时文件。

简易版本tomcat启动脚本：

```
[tomcat@web01 bin]$ cat tomcat.sh 
#!/bin/sh
TOMCAT_PATH=/usr/local/tomcat

usage(){
  echo "Usage: $0 [start|stop]"
}
status(){
 ps -ef | grep java | grep tomcat | grep -v grep
}

start(){
  /usr/local/tomcat/bin/startup.sh
}

stop(){
  TPID=$(ps -ef | grep java | grep tomcat | grep -v grep | awk '{print $2}')
  kill -9 $TPID
  sleep 5;

  TSTAT=$(ps -ef | grep java | grep tomcat | grep -v grep | awk '{print $2}')
     if [ -z $TSTAT ];then
       echo "tomcat stop"
     else 
       kill -9 $TSTAT
     fi

cd $TOMCAT_PATH
rm temp/* -rf
rm work/* -rf
}

main(){
case $1 in
  start)
     start
     ;;
  stop)
     stop
     ;;
  status)
     status
     ;;
  *)
     usage
     ;;
esac

}

main $1;
```
我们去访问tomcat对应的界面：

![](http://omk1n04i8.bkt.clouddn.com/17-4-15/88556304-file_1492222305346_4c4b.jpg)

但是直接访问的话会报错403，因此需要对以下文件进行相应的改动，比如我要访问manager页面：

```
[tomcat@web01 ~]$ cd /usr/local/tomcat/webapps/manager/META-INF
[tomcat@web01 META-INF]$ vim context.xml 
allow="10.0.0.*" />
修改访问权限
```
如果你想要访问的话这个访问权限是必须开启的，默认是127.0.0.x。也就是只能本机，所以不改的话直接403，连输入账号密码的机会都没有。但是这个有些是不安全的，因此建议只留下Server status，其他的关闭或者直接移动到别的地方去。

## Tomcat安全管理规范

- 用户设置统一
- 内部地址下载
- 版本统一