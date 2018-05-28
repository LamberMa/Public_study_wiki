# ETCD集群部署

> etcd集群是整个k8s集群中负责存储的部分，所以这一块要先有。
>
> etcd的github地址：https://github.com/coreos/etcd

## 准备etcd的软件包

```shell
# 首先可以直接去这里去下载
wget https://github.com/coreos/etcd/releases/download/v3.2.18/etcd-v3.2.18-linux-amd64.tar.gz

# 解压并处理
[root@linux-node1 src]# tar zxf etcd-v3.2.18-linux-amd64.tar.gz
[root@linux-node1 src]# cd etcd-v3.2.18-linux-amd64
[root@linux-node1 etcd-v3.2.18-linux-amd64]# cp etcd etcdctl /opt/kubernetes/bin/

# 分发到其他的两个node节点
[root@linux-node1 etcd-v3.2.18-linux-amd64]# scp etcd etcdctl 192.168.56.102:/opt/kubernetes/bin/
[root@linux-node1 etcd-v3.2.18-linux-amd64]# scp etcd etcdctl 192.168.56.103:/opt/kubernetes/bin/
```

## 创建etcd证书签名请求

```shell
# 注意这里hosts应该是node1就写node1的ip，node2就写node2的ip，但是这里为了批量通用分发，所以把所有的node节点ip都写上，便于分发。
[root@linux-node1 ssl]# cat etcd-csr.json 
{
  "CN": "etcd",
  "hosts": [
    "127.0.0.1",
"192.168.56.101",
"192.168.56.102",
"192.168.56.103"
  ],
  "key": {
    "algo": "rsa",
    "size": 2048
  },
  "names": [
    {
      "C": "CN",
      "ST": "BeiJing",
      "L": "BeiJing",
      "O": "k8s",
      "OU": "System"
    }
  ]
}
```

## 生成etcd证书和私钥

```shell
[root@linux-node1 ssl]# cfssl gencert -ca=/opt/kubernetes/ssl/ca.pem \
>   -ca-key=/opt/kubernetes/ssl/ca-key.pem \
>   -config=/opt/kubernetes/ssl/ca-config.json \
>   -profile=kubernetes etcd-csr.json | cfssljson -bare etcd
2018/05/13 07:12:23 [INFO] generate received request
2018/05/13 07:12:23 [INFO] received CSR
2018/05/13 07:12:23 [INFO] generating key: rsa-2048
2018/05/13 07:12:24 [INFO] encoded CSR
2018/05/13 07:12:24 [INFO] signed certificate with serial number 259443634666846653641933831011491882088863744942
2018/05/13 07:12:24 [WARNING] This certificate lacks a "hosts" field. This makes it unsuitable for
websites. For more information see the Baseline Requirements for the Issuance and Management
of Publicly-Trusted Certificates, v.1.1.6, from the CA/Browser Forum (https://cabforum.org);
specifically, section 10.2.3 ("Information Requirements").

# 查看相关内容
[root@linux-node1 ssl]# ll etcd*
-rw-r--r--. 1 root root 1062 May 13 07:12 etcd.csr
-rw-r--r--. 1 root root  290 May 13 07:09 etcd-csr.json
-rw-------. 1 root root 1675 May 13 07:12 etcd-key.pem
-rw-r--r--. 1 root root 1436 May 13 07:12 etcd.pem
```

## 将证书移动到/opt/kubernetes/ssl目录下

```shell
# 刚才操作的/usr/local/src/ssl目录下执行操作
cp etcd*.pem /opt/kubernetes/ssl
scp etcd*.pem 192.168.56.102:/opt/kubernetes/ssl
scp etcd*.pem 192.168.56.103:/opt/kubernetes/ssl
```

## 配置ETCD的配置文件

这里有很多的ip地址，分发到其他主机以后记得修改对应的ip地址，启动以后，会占用2379和2380两个端口，我们以后如果说k8s有什么问题的话排查端口就可以知道哪一个部分出现了问题了。

```shell
[root@linux-node1 ~]# vim /opt/kubernetes/cfg/etcd.conf
#[member]
ETCD_NAME="etcd-node1"
ETCD_DATA_DIR="/var/lib/etcd/default.etcd"
#ETCD_SNAPSHOT_COUNTER="10000"
#ETCD_HEARTBEAT_INTERVAL="100"
#ETCD_ELECTION_TIMEOUT="1000"
ETCD_LISTEN_PEER_URLS="https://192.168.56.11:2380"
ETCD_LISTEN_CLIENT_URLS="https://192.168.56.11:2379,https://127.0.0.1:2379"
#ETCD_MAX_SNAPSHOTS="5"
#ETCD_MAX_WALS="5"
#ETCD_CORS=""
#[cluster]
ETCD_INITIAL_ADVERTISE_PEER_URLS="https://192.168.56.11:2380"
# if you use different ETCD_NAME (e.g. test),
# set ETCD_INITIAL_CLUSTER value for this name, i.e. "test=http://..."
ETCD_INITIAL_CLUSTER="etcd-node1=https://192.168.56.11:2380,etcd-node2=https://192.168.56.12:2380,etcd-node3=https://192.168.56.13:2380"
ETCD_INITIAL_CLUSTER_STATE="new"
ETCD_INITIAL_CLUSTER_TOKEN="k8s-etcd-cluster"
ETCD_ADVERTISE_CLIENT_URLS="https://192.168.56.11:2379"
#[security]
CLIENT_CERT_AUTH="true"
ETCD_CA_FILE="/opt/kubernetes/ssl/ca.pem"
ETCD_CERT_FILE="/opt/kubernetes/ssl/etcd.pem"
ETCD_KEY_FILE="/opt/kubernetes/ssl/etcd-key.pem"
PEER_CLIENT_CERT_AUTH="true"
ETCD_PEER_CA_FILE="/opt/kubernetes/ssl/ca.pem"
ETCD_PEER_CERT_FILE="/opt/kubernetes/ssl/etcd.pem"
ETCD_PEER_KEY_FILE="/opt/kubernetes/ssl/etcd-key.pem"
```

## 创建ETCD系统服务

```shell
[root@linux-node1 ~]# vim /etc/systemd/system/etcd.service
[Unit]
Description=Etcd Server
After=network.target

[Service]
Type=simple
WorkingDirectory=/var/lib/etcd
EnvironmentFile=-/opt/kubernetes/cfg/etcd.conf
# set GOMAXPROCS to number of processors
ExecStart=/bin/bash -c "GOMAXPROCS=$(nproc) /opt/kubernetes/bin/etcd"
Type=notify

[Install]
WantedBy=multi-user.target
```



