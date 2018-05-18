# Docker-Registry

> DockerFile建议通过git来保存，



实验环境可以操作的，生产不建议这样去操作的内容：

- 容器停止后就自动删除：docker run —rm centos /bin/echo "hello world"
- 杀死所有正在运行的服务器：docker kill $(docker ps -a -q)
- 删除所有已经停止的容器：docker rm $(docker ps -a -q)
- 删除所有未打标签的镜像：docker rmi $(docker images -q -f dangling=true)





Docker registry功能比较单一，没有web界面。

Nginx + Docker registry 验证https（自签名证书）：

1. 手动创建证书

```shell
[root@localhost registry]# openssl req -x509 -days 3650 -nodes -newkey rsa:2048 -keyout ./docker-registry.key -out ./docker-registry.crt
Generating a 2048 bit RSA private key
...............................................................+++
...+++
writing new private key to './docker-registry.key'
-----
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Country Name (2 letter code) [XX]:
State or Province Name (full name) []:
Locality Name (eg, city) [Default City]:
Organization Name (eg, company) [Default Company Ltd]:
Organizational Unit Name (eg, section) []:
Common Name (eg, your name or your server's hostname) []:reg.unixhot.com
Email Address []:
[root@localhost registry]# ll
总用量 8
-rw-r--r--. 1 root root 1289 5月  11 20:39 docker-registry.crt
-rw-r--r--. 1 root root 1708 5月  11 20:39 docker-registry.key
```

2. 安装httpd-tools htpasswd实现验证功能

```shell
# htpasswd是httpd-tools工具集中的工具，因此首先要安装httpd-tools
yum install -y httpd-tools
# 创建使用-c参数，加密码不要使用-c，指定用户为demo
[root@localhost registry]# htpasswd -c /opt/registry/docker-registry.htpasswd demo
New password: 
Re-type new password: 
Adding password for user demo
```

3. nginx proxy https  （有一个现成的镜像），启动一个docker-registry的容器，proxy到这里。

```shell
# --link可以让容器之间可以互访
docker run -d -p 443:443 \
--name docker-registry-proxy \
-e REGISTRY_HOST="docker-registry" \
-e REGISTRY_PORT="5000" \
-e SERVER_NAME="reg.unixhot.com" \
--link docker-registry:docker-registry \
-v /opt/registry/docker-registry.htpasswd:/etc/nginx/.htpasswd:ro \
-v /opt/registry:/etc/nginx/ssl:ro \
containersol/docker-registry-proxy
```

4. docker 配置使用证书

```shell
# 在/etc/hosts中针对reg.unixhot.com做域名的映射
192.168.56.101  reg.unixhot.com
# 配置docker使用证书，如果说不买证书的话那么所有的需要连接的服务器都要配置这一部分
# 将自签名证书放到/etc/docker下面
cd /etc/docker
mkdir -p certs.d/reg.unixhot.com
cd certs.d/reg.unixhot.com
cp /opt/registry/docker-registry.crt ca.crt
# 检测docker是否可以进行登录
[root@localhost ~]# docker login reg.unixhot.com
Username: demo
Password: 
Login Succeeded
```

5. 登录，push镜像

```shell
# Push镜像第一件需要做的事情就是打标签，这个标签是给docker入库我们创建这个registry的时候打的标签
[root@localhost ~]# docker tag unixhot/centos reg.unixhot.com/unixhot/centos
# push镜像到仓库
[root@localhost ~]# docker push reg.unixhot.com/unixhot/centos
The push refers to repository [reg.unixhot.com/unixhot/centos]
1e11f9cfa6aa: Pushed 
43e653f84b79: Pushed 
latest: digest: sha256:e0bf9b8009fdea481f4546d7139aa3beeabbe799d489843f1c6a61339ef11271 size: 3768
```

6. 查看，传上去了以后只能通过提供的api进行查看。

```shell
# 使用docker images也能查看到
[root@localhost ~]# curl -X GET https://demo:demo@reg.unixhot.com/v2/_catalog -k
{"repositories":["unixhot/centos"]}
```



如果是购买的证书的话只需要上述的第二步和第三步以及第五步即可。手动创建和配置docker使用证书就过了。



```shell
[root@localhost opt]# mkdir registry
[root@localhost opt]# cd registry/
[root@localhost registry]# docker run -d --name docker-registry -v /opt/registry/:/tmp/registry-dev registry:2.2.1
Unable to find image 'registry:2.2.1' locally
2.2.1: Pulling from library/registry
8387d9ff0016: Pull complete 
3b52deaaf0ed: Pull complete 
4bd501fad6de: Pull complete 
a3ed95caeb02: Pull complete 
b1f99b5938be: Pull complete 
82c34c0ec017: Pull complete 
5426c0c1c293: Pull complete 
Digest: sha256:30adb707d1b4d2ad694c38da3ea1e7d303fdbdce2538ab0372afe6f1523ae3c8
Status: Downloaded newer image for registry:2.2.1
4b19999b188ce8ed1a0ea7eab52c36a9a3e17ce78147f24a99d04d39624d9d87
```



## 使用Habor构建企业级Docker Registry



### 安装

```shell
# 安装过程中要用到docker-compose，这个玩意是用python写的，所以用pip来安装
yum -y install python-pip
pip install docker-compose
```

