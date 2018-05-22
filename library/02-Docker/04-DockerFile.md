# DockerFile

> Dockerfile是为快速构建docker image而设计的，当你使用dockerbuild 命令的时候，docker 会读取当前目录下的命名为Dockerfile(首字母大写)的纯文本文件并执行里面的指令构建出一个docker image。这比SaltStack的配置管理要简单的多，不过还是要掌握一些简单的指令。 Dockerfile 由一行行命令语句组成，并且支持以#开头的注释行。指令是不区分大小写的，但是通常我们都大写。

下面我们通过构建一个Nginx的镜像来学习Dockerfile. 首先实现创建好目录，我这在opt下创建目录dockerfile，然后在dockerfile目录下创建nginx目录，在nginx目录下新建一个Dockerfile文件。Dcockerfile这个文件的首字母要大写，不然有可能不会被识别。

```shell
[root@linux-node1 ~]# cd /opt/
[root@linux-node1 opt]# cd dockerfile/
[root@linux-node1 dockerfile]# cd nginx/
[root@linux-node1 nginx]# echo "nginx in Docker ,hahahah" >index.html
[root@linux-node1 nginx]# cat Dockerfile 
# This Dockerfile is used to practice 
# Version: 1.0
# Author: lamber

# Base Image
FROM centos

# Who will take care of this image
MAINTAINER lamber 1020561033@qq.com

# Prepare Epel
RUN rpm -ivh https://mirrors.aliyun.com/epel/epel-release-latest-7.noarch.rpm

# Install Nginx and deal with the config file
RUN yum -y install nginx && yum clean all
RUN echo "daemon off;" >> /etc/nginx/nginx.conf
ADD index.html /usr/share/nginx/html/index.html

# Run
EXPOSE 80
CMD ["nginx"]
```

说明：

- FROM：这个镜像的妈是谁，指定基础镜像，除了注释外的第一行必须是他。如果本地没有这个镜像，它会给你pull下来。
- MAINTAINER：告诉别人谁负责养他，指定维护者的信息
- RUN：你想让他干啥，在命令前面加上RUN就可以了。
- ADD：给它点创业资金，copy文件进去，会自动解压
- WORKDIR：我是cd，今天刚化了妆（设置当前的工作目录）
- VOLUME：给它一个存放行李的地方，设置卷，挂载主机目录
- EXPOSE：它要打开的门是啥，指定对外的端口
- CMD：奔跑吧，兄弟，指定容器启动后要干的事情，这里双引一下，单引可能出现问题。。。。

构建docker镜像（后面那个点就是在当前目录，意思是告诉docker去哪里找这个dockerfile，一个点就是在当前目录找dockerfile，这个你也可以写绝对路径也是ok的），然后创建容器：

```shell
[root@linux-node1 nginx]# docker build -t mynginx:v2 .
[root@linux-node1 nginx]# docker images
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
mynginx             v2                  5104f2ed9887        5 seconds ago       280.7 MB
nginx/mynginx       v1                  81f1607bb8a0        32 minutes ago      355 MB
docker.io/nginx     latest              5e69fe4b3c31        3 days ago          182.5 MB
docker.io/centos    latest              98d35105a391        2 weeks ago         192.5 MB
[root@linux-node1 nginx]# docker run --name mynginxv2 -d -p 82:80 mynginx:v2 nginx
a1efc632ba6d2412c3bc9fded592ca289c0f6c14dd1832118fc52539a2c1123f
```

起来以后我们就可以在网页端进行测试了！

## 附录：Dockerfile指令详解

下面我们来分别介绍下上面使用到的命令：

#### FROM

- 格式：FROM `<image>` 或FROM `<image>:<tag>`。
- 解释：FROM是Dockerfile里的第一条指令（必须是），后面跟有效的镜像名（如果该镜像你的本地仓库没有则会从远程仓库Pull取）。然后后面的其它指令FROM的镜像中执行。

#### MAINTAINER

- 格式：MAINTAINER  `<name>`
- 解释：指定维护者信息。

#### RUN

格式：RUN `<command>` 或 RUN ["executable", "param1", "param2"]。 解释：运行命令，命令较长使可以使用\来换行。推荐使用上面数组的格式

#### CMD

```
格式：
   CMD ["executable","param1","param2"] 使用 exec 执行，推荐方式；
   CMD command param1 param2 在 /bin/sh 中执行，提供给需要交互的应用；
   CMD ["param1","param2"] 提供给ENTRYPOINT的默认参数；
```

解释： CMD指定容器启动是执行的命令，每个Dockerfile只能有一条CMD命令，如果指定了多条，只有最后一条会被执行。如果你在启动容器的时候也指定的命令，那么会覆盖Dockerfile构建的镜像里面的CMD命令。

#### ENTRYPOINT

```
格式：
   ENTRYPOINT ["executable", "param1","param2"]
   ENTRYPOINT command param1 param2（shell中执行）。
```

解释：和CMD类似都是配置容器启动后执行的命令，并且不可被 docker run 提供的参数覆盖。 每个 Dockerfile 中只能有一个ENTRYPOINT，当指定多个时，只有最后一个起效。ENTRYPOINT没有CMD的可替换特性，也就是你启动容器的时候增加运行的命令不会覆盖ENTRYPOINT指定的命令。

所以生产实践中我们可以同时使用ENTRYPOINT和CMD，例如：

```
ENTRYPOINT ["/usr/bin/rethinkdb"]
CMD ["--help"]
```

#### USER

- 格式：USER daemon
- 解释：指定运行容器时的用户名和UID，后续的RUN指令也会使用这里指定的用户。

#### EXPOSE

- 格式：EXPOSE `<port> [<port>…]`
- 解释：设置Docker容器内部暴露的端口号，如果需要外部访问，还需要启动容器时增加-p或者-P参数进行分配。

#### ENV

```
格式：
ENV <key> <value>
ENV <key>=<value> ...
```

解释：设置环境变量，可以在RUN之前使用，然后RUN命令时调用，容器启动时这些环境变量都会被指定

#### ADD

```
格式：
   ADD <src>... <dest>
   ADD ["<src>",... "<dest>"]
```

解释：将指定的<src>复制到容器文件系统中的<dest> 所有拷贝到container中的文件和文件夹权限为0755,uid和gid为0 如果文件是可识别的压缩格式，则docker会帮忙解压缩

#### VOLUME

- 格式：VOLUME ["/data"]
- 解释：可以将本地文件夹或者其他container的文件夹挂载到container中。

#### WORKDIR

- 格式：WORKDIR/path/to/workdir
- 解释：切换目录，为后续的RUN、CMD、ENTRYPOINT 指令配置工作目录。

可以多次切换(相当于cd命令)， 也可以使用多个WORKDIR 指令，后续命令如果参数是相对路径，则会基于之前命令指定的路径。

```
例如
WORKDIR /a
WORKDIR b
WORKDIR c
RUN pwd
则最终路径为 /a/b/c。
```

#### ONBUILD

ONBUILD 指定的命令在构建镜像时并不执行，而是在它的子镜像中执行

#### ARG

- 格式：ARG `<name>[=<default value>]`
- 解释：ARG指定了一个变量在docker build的时候使用，可以使用--build-arg  `<varname>=<value>`来指定参数的值，不过如果构建的时候不指定就会报错。

参考自运维社区：https://mp.weixin.qq.com/s/A8KSp3zmpL_u9a2aYv8WYw