# Docker

> Docker是docker.Inc公司开源的一个基于LXC（Linux Container）技术上构建的Container容器引擎，源代码托管在Github上，基于Go语言并遵从Apache2.0协议开源。

## 1、镜像的获取

就像github一样，docker也有自己的一个仓库，存储了各种各样的docker镜像，我们可以去从仓库里去搜索我们要找的镜像。

### 1.1、搜索镜像

```shell
COMAND:

$ sudo docker search TERM

OPTIONS:

--automated=false     是否仅显示自动创建的镜像  
--no-trunc=false      是否截断输出  
-s, --stars=0         仅显示至少有x颗星的镜像  

示例:

[root@maxiaoyu ~]# docker search nginx
INDEX       NAME                    DESCRIPTION               STARS     OFFICIAL   AUTOMATED
docker.io   docker.io/nginx    Official build of Nginx.       7127        [OK]   
```

我这里截取了搜索出结果的第一行，当然如果你实际搜索的话会有很多行的内容的，其中包含了官方的以及各种自制的。

- NAME：镜像名称


- DESCRIPTION：也就是镜像的描述，


- STARS类似于github里面的stars，表示点赞和热度。


- OFFICIAL：指docker标准库, 由docker 官方建立. 用户建立的image则会有userid的prefix.


- automated builds ：则是通过代码版本管理网站结合docker hub提供的接口生成的, 例如github, bitbucket, 你需要注册docker hub, 然后使用github或bitbucket的在账户链接到docker hub, 然后就可以选择在github或bitbucket里面的项目自动build docker image, 这样的话只要代码版本管理网站的项目有更新, 就会触发自动创建image.对于的image属于什么版本，下面的“[OK]”就会打在什么地方

### 1.2、获取镜像

获取镜像的方式有两种，一种是直接去pull我们刚才用docker search搜索到的镜像：

```shell
[root@maxiaoyu ~]# docker pull docker.io/nginx   
Using default tag: latest
Trying to pull repository docker.io/library/nginx ... 
latest: Pulling from docker.io/library/nginx
bc95e04b23c0: Pull complete 
110767c6efff: Pull complete 
f081e0c4df75: Pull complete 
Digest: sha256:004ac1d5e791e705f12a17c80d7bb1e8f7f01aa7dca7deee6e65a03465392072
[root@maxiaoyu ~]# docker images
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
docker.io/nginx     latest              1e5ab59102ce        2 weeks ago         108.3 MB
docker.io/centos    latest              328edcd84f1b        12 weeks ago        192.5 MB
```

当然从docker官方的镜像源下载还是挺慢的，我们可以切换一些国内的镜像源，国内的镜像源的访问速度还是较为客观的，比如阿里的，或者DaoCloud。当然我们还有另外一种就是从别人导出的镜像直接导入，当然首先你要获取一个镜像包。

```shell
docker load --input centos.tar
或者
docker load < nginx.tar
```

我们也可以通过docker的导出功能将我们pull下来的image导出成一个tar包，生成的tar包会保存在当前的目录：

```shell
[root@linux-node1 ~]# docker save -o centos.tar centos
```

使用docker inspect去查看image的内容：

```shell
[root@maxiaoyu ~]# docker images                          
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
docker.io/nginx     latest              1e5ab59102ce        2 weeks ago         108.3 MB
docker.io/centos    latest              328edcd84f1b        12 weeks ago        192.5 MB
[root@maxiaoyu ~]# docker inspect docker.io/nginx:latest       
[
    {
        "Id": "sha256:1e5ab59102ce46c277eda5ed77affaa4e3b06a59fe209fe0b05200606db3aa7a",
        "RepoTags": [
            "docker.io/nginx:latest"
        ],
        "RepoDigests": [
            "docker.io/nginx@sha256:004ac1d5e791e705f12a17c80d7bb1e8f7f01aa7dca7deee6e65a03465392072"
        ],
        "Parent": "",
        "Comment": "",
        "Created": "2017-10-10T00:26:17.56397833Z",
        "Container": "95219599af11973e48035ec6002e8f7e6b47cbb95acc6669e47e72605a4cbb58",
        "ContainerConfig": {
            "Hostname": "95219599af11",
            "Domainname": "",
            "User": "",
            "AttachStdin": false,
            "AttachStdout": false,
            "AttachStderr": false,
            "ExposedPorts": {
                "80/tcp": {}
            },
            "Tty": false,
            "OpenStdin": false,
            "StdinOnce": false,
            "Env": [
                "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
                "NGINX_VERSION=1.13.5-1~stretch",
                "NJS_VERSION=1.13.5.0.1.13-1~stretch"
            ],
            "Cmd": [
                "/bin/sh",
                "-c",
                "#(nop) ",
                "CMD [\"nginx\" \"-g\" \"daemon off;\"]"
            ],
            "ArgsEscaped": true,
            "Image": "sha256:4a0ecd1e8734031c4c84ceb6944b5b5acb0a07d38173ae287fefc739b047e289",
            "Volumes": null,
            "WorkingDir": "",
            "Entrypoint": null,
            "OnBuild": [],
            "Labels": {
                "maintainer": "NGINX Docker Maintainers \u003cdocker-maint@nginx.com\u003e"
            },
            "StopSignal": "SIGTERM"
        },
        "DockerVersion": "17.06.2-ce",
        "Author": "",
        "Config": {
            "Hostname": "",
            "Domainname": "",
            "User": "",
            "AttachStdin": false,
            "AttachStdout": false,
            "AttachStderr": false,
            "ExposedPorts": {
                "80/tcp": {}
            },
            "Tty": false,
            "OpenStdin": false,
            "StdinOnce": false,
            "Env": [
                "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
                "NGINX_VERSION=1.13.5-1~stretch",
                "NJS_VERSION=1.13.5.0.1.13-1~stretch"
            ],
            "Cmd": [
                "nginx",
                "-g",
                "daemon off;"
            ],
            "ArgsEscaped": true,
            "Image": "sha256:4a0ecd1e8734031c4c84ceb6944b5b5acb0a07d38173ae287fefc739b047e289",
            "Volumes": null,
            "WorkingDir": "",
            "Entrypoint": null,
            "OnBuild": [],
            "Labels": {
                "maintainer": "NGINX Docker Maintainers \u003cdocker-maint@nginx.com\u003e"
            },
            "StopSignal": "SIGTERM"
        },
        "Architecture": "amd64",
        "Os": "linux",
        "Size": 108275923,
        "VirtualSize": 108275923,
        "GraphDriver": {
            "Name": "devicemapper",
            "Data": {
                "DeviceId": "11",
                "DeviceName": "docker-253:1-1447633-6801bdaac04c59364ede2bdeb133df3b6ed5d958c34931479740cd9946456d50",
                "DeviceSize": "10737418240"
            }
        },
        "RootFS": {
            "Type": "layers",
            "Layers": [
                "sha256:cec7521cdf36a6d4ad8f2e92e41e3ac1b6fa6e05be07fa53cc84a63503bc5700",
                "sha256:453fc2d51e11412f191e21f29cd098cc912995076b1bbf0931f228adc33b039d",
                "sha256:a1a53f8d99b57834ca1d6370a3988d4bbd4a5235d5ff3741d0d6ecdd099872d7"
            ]
        }
    }
]
```

docker下载的image会放到/var/lib/docker目录中(默认如此, 如果启动docker时使用-g指定其他目录的话, 那么会放到其他目录)

### 1.3、如何删除镜像？

```shell
[root@maxiaoyu ~]# docker images
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
docker.io/nginx     latest              1e5ab59102ce        2 weeks ago         108.3 MB
docker.io/centos    latest              328edcd84f1b        12 weeks ago        192.5 MB
[root@maxiaoyu ~]# docker rmi 1e5ab59102ce
Untagged: docker.io/nginx:latest
Untagged: docker.io/nginx@sha256:004ac1d5e791e705f12a17c80d7bb1e8f7f01aa7dca7deee6e65a03465392072
Deleted: sha256:1e5ab59102ce46c277eda5ed77affaa4e3b06a59fe209fe0b05200606db3aa7a
Deleted: sha256:182a54bd28aa918a440f7edd3066ea838825c3d6a08cc73858ba070dc4f27211
Deleted: sha256:a527b2a06e67cab4b15e0fd831882f9e6a6485c24f3c56f870ac550b81938771
Deleted: sha256:cec7521cdf36a6d4ad8f2e92e41e3ac1b6fa6e05be07fa53cc84a63503bc5700
```

实际上是按照image的id去删除的，当然如果你的image属于被其他容器引用的情况下的话是无法删除的。会收到如下的报错信息：

```shell
[root@maxiaoyu ~]# docker rmi 328edcd84f1b
Error response from daemon: conflict: unable to delete 328edcd84f1b (must be forced) - image is being used by stopped container 1284da16efeb
```

## 2、创建第一个容器

```shell
[root@maxiaoyu ~]# docker run --name myfirstdocker -i -t centos /bin/bash
[root@2ce82d7a275e /]# uname -a
Linux 2ce82d7a275e 3.10.0-514.26.2.el7.x86_64 #1 SMP Tue Jul 4 15:04:05 UTC 2017 x86_64 x86_64 x86_64 GNU/Linux
[root@2ce82d7a275e /]# ps aux
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1  0.0  0.1  11764  1888 ?        Ss   09:40   0:00 /bin/bash
root        14  0.0  0.0  47436  1676 ?        R+   09:44   0:00 ps aux
```

这样就新建了一个容器，我们也随之会进入到容器的界面。docker容器的启动，即使没有把镜像pull下来，在执行如上的命令的时候依然可以执行，因为docker发现你没有这个镜像的时候会帮你把镜像pull下来。接下来看看如上的几个参数都代表什么意思：

- --name:指定这个生成的容器的名字，当然如果不指定的话name也会自动生成，我们指定名字只不过是为了更方便的去管理我们的容器。
- -i：允许标准输入 ，即确保容器的STDIN是开启的。可以看到，运行命令以后我们进入到了容器中，进程为PID的是/bin/bash，也就是刚才我们指定要运行的命令。因此docker其实是为进程执行隔离作用的，虚拟机是给操作系统做隔离的。
- -t：开启一个tty伪终端。

> 以上操作其实是经历了这样一个过程：
>
> 1. 执行上面操作首先会在系统本地去找有没有对应的这样一个image，如果没有的话那么就会去Docker Hub Registry去找，一旦找到以后就回去下载然后保存到本地宿主机器。
> 2. Docker利用这个image创建了一个容器，这个容器拥有自己的网络，ip，以及桥接外部网络的接口。
> 3. 我们告诉这个容器要去执行什么命令（/bin/bash）

当前我们是在容器的内部，通过`ps aux`我们可以得知，pid的大树根并不是init（centos7的树根并不是init），而是我们运行的/bin/bash，如果此时我们使用exit退出容器的话，那么此时的容器就会被关掉。

```shell
[root@2ce82d7a275e /]# exit
exit
[root@maxiaoyu ~]# docker ps -a
CONTAINER ID  IMAGE    COMMAND      CREATED         STATUS                   PORTS     NAMES     
2ce82d7a275e  centos  "/bin/bash"  10 minutes ago  Exited (0) 5 seconds ago       myfirstdocker
```

Docker其实是单进程的，他需要一个进程在前台跑着，因此如果这个程序执行完了，那么整个容器也就退出了，就像我们刚才执行/bin/bash后进入到容器，当exit退出的时候这个进程结束以后整个容器也就跟着一起退出了。

那么如何启动已经关闭的容器呢？

**方法一**

```shell
docker start docker_name

比如（这样就一直跑起来了）：
[root@maxiaoyu ~]# docker start myfirstdocker
myfirstdocker
```

**方法二**

```shell
[root@maxiaoyu ~]# docker attach myfirstdocker
[root@2ce82d7a275e /]# 
# 这样就是直接进到容器里面去了，不过exit以后容器还是会停止，因此一般不会去这么操作的
```

**方法三**

```shell
# 生产中建议使用的方法
[root@maxiaoyu ~]# yum -y install util-linux
[root@maxiaoyu ~]# docker start mydocker
mydocker
# 获取当前的docker的pid，如果获取到的pid=0，说明你这个容器没起来。
[root@maxiaoyu ~]# docker inspect -f "{{ .State.Pid}}" mydocker
13500
[root@maxiaoyu ~]# nsenter -t 13500 -m -u -i -n -p 
# 使用这种方法进入容器，即使退出的话仍然可以保证容器是开启的，进程并不会结束，docker ps能看到
[root@1284da16efeb /]# exit
logout
# 那么为什么即使exit出去也不会退出容器呢？
[root@1284da16efeb /]# ps aux
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1  0.0  0.0  11764  1676 ?        Ss+  10:01   0:00 /bin/bash
root        26  0.0  0.1  15192  1996 ?        S    10:05   0:00 -bash
root        39  0.0  0.0  50868  1816 ?        R+   10:05   0:00 ps aux
# 主要原因是因为多了一个-bash的进程，因此退出当前的进程这个docker不会退出，因为仍然还有一个/bin/bash的进程正在运行，因此整个容器是并不会退出的。
```

查看一下nsenter的帮助信息：

```shell
[root@maxiaoyu ~]# nsenter --help

Usage:
 nsenter [options] <program> [<argument>...]

Run a program with namespaces of other processes.

Options:
 -t, --target <pid>     target process to get namespaces from
 -m, --mount[=<file>]   enter mount namespace
 -u, --uts[=<file>]     enter UTS namespace (hostname etc)
 -i, --ipc[=<file>]     enter System V IPC namespace
 -n, --net[=<file>]     enter network namespace
 -p, --pid[=<file>]     enter pid namespace
 -U, --user[=<file>]    enter user namespace
 -S, --setuid <uid>     set uid in entered namespace
 -G, --setgid <gid>     set gid in entered namespace
     --preserve-credentials do not touch uids or gids
 -r, --root[=<dir>]     set the root directory
 -w, --wd[=<dir>]       set the working directory
 -F, --no-fork          do not fork before exec'ing <program>
 -Z, --follow-context   set SELinux context according to --target PID

 -h, --help     display this help and exit
 -V, --version  output version information and exit

For more details see nsenter(1).
```

因此我们可以针对第三种生产中使用的方法去写一个小教本然后通过批量部署分发后使用：

```shell
[root@maxiaoyu ~]# cat docker_in.sh 
#!/bin/bash

# Use nsenter to access docker 

docker_in (){
   NAME_ID=$1
   PID=$(docker inspect -f "{{ .State.Pid}}" $NAME_ID)
   nsenter -t $PID -m -u -i -n -p
}

docker_in $1
[root@maxiaoyu ~]# chmod +x docker_in.sh
```



