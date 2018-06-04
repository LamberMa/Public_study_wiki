- Flannel要使用etcd
- Flannel给每一个node分配出来的ip地址段都不一样。

1.为Flannel生成证书

```
[root@linux-node1 ~]# vim flanneld-csr.json
{
  "CN": "flanneld",
  "hosts": [],
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

2.生成证书
```
[root@linux-node1 ~]# cfssl gencert -ca=/opt/kubernetes/ssl/ca.pem \
   -ca-key=/opt/kubernetes/ssl/ca-key.pem \
   -config=/opt/kubernetes/ssl/ca-config.json \
   -profile=kubernetes flanneld-csr.json | cfssljson -bare flanneld
```
3.分发证书
```
[root@linux-node1 ~]# cp flanneld*.pem /opt/kubernetes/ssl/
[root@linux-node1 ~]# scp flanneld*.pem 192.168.56.12:/opt/kubernetes/ssl/
[root@linux-node1 ~]# scp flanneld*.pem 192.168.56.13:/opt/kubernetes/ssl/
```

4.下载Flannel软件包
```
[root@linux-node1 ~]# cd /usr/local/src
# wget
 https://github.com/coreos/flannel/releases/download/v0.10.0/flannel-v0.10.0-linux-amd64.tar.gz
 
[root@linux-node1 src]# tar zxf flannel-v0.10.0-linux-amd64.tar.gz
[root@linux-node1 src]# cp flanneld mk-docker-opts.sh /opt/kubernetes/bin/
复制到linux-node2节点
[root@linux-node1 src]# scp flanneld mk-docker-opts.sh 192.168.56.12:/opt/kubernetes/bin/
[root@linux-node1 src]# scp flanneld mk-docker-opts.sh 192.168.56.13:/opt/kubernetes/bin/
复制对应脚本到/opt/kubernetes/bin目录下。
[root@linux-node1 ~]# cd /usr/local/src/kubernetes/cluster/centos/node/bin/
[root@linux-node1 bin]# cp remove-docker0.sh /opt/kubernetes/bin/
[root@linux-node1 bin]# scp remove-docker0.sh 192.168.56.12:/opt/kubernetes/bin/
[root@linux-node1 bin]# scp remove-docker0.sh 192.168.56.13:/opt/kubernetes/bin/
```

5.配置Flannel
```
[root@linux-node1 ~]# vim /opt/kubernetes/cfg/flannel
FLANNEL_ETCD="-etcd-endpoints=https://192.168.56.11:2379,https://192.168.56.12:2379,https://192.168.56.13:2379"
FLANNEL_ETCD_KEY="-etcd-prefix=/kubernetes/network"
FLANNEL_ETCD_CAFILE="--etcd-cafile=/opt/kubernetes/ssl/ca.pem"
FLANNEL_ETCD_CERTFILE="--etcd-certfile=/opt/kubernetes/ssl/flanneld.pem"
FLANNEL_ETCD_KEYFILE="--etcd-keyfile=/opt/kubernetes/ssl/flanneld-key.pem"
复制配置到其它节点上
[root@linux-node1 ~]# scp /opt/kubernetes/cfg/flannel 192.168.56.12:/opt/kubernetes/cfg/
[root@linux-node1 ~]# scp /opt/kubernetes/cfg/flannel 192.168.56.13:/opt/kubernetes/cfg/
```

6.设置Flannel系统服务
```
[root@linux-node1 ~]# vim /usr/lib/systemd/system/flannel.service
[Unit]
Description=Flanneld overlay address etcd agent
After=network.target
Before=docker.service

[Service]
EnvironmentFile=-/opt/kubernetes/cfg/flannel
ExecStartPre=/opt/kubernetes/bin/remove-docker0.sh
ExecStart=/opt/kubernetes/bin/flanneld ${FLANNEL_ETCD} ${FLANNEL_ETCD_KEY} ${FLANNEL_ETCD_CAFILE} ${FLANNEL_ETCD_CERTFILE} ${FLANNEL_ETCD_KEYFILE}
ExecStartPost=/opt/kubernetes/bin/mk-docker-opts.sh -d /run/flannel/docker

Type=notify

[Install]
WantedBy=multi-user.target
RequiredBy=docker.service
复制系统服务脚本到其它节点上
# scp /usr/lib/systemd/system/flannel.service 192.168.56.12:/usr/lib/systemd/system/
# scp /usr/lib/systemd/system/flannel.service 192.168.56.13:/usr/lib/systemd/system/
```

## Flannel CNI集成
下载CNI插件
```
https://github.com/containernetworking/plugins/releases
wget https://github.com/containernetworking/plugins/releases/download/v0.7.1/cni-plugins-amd64-v0.7.1.tgz
[root@linux-node1 ~]# mkdir /opt/kubernetes/bin/cni
[root@linux-node1 src]# tar zxf cni-plugins-amd64-v0.7.1.tgz -C /opt/kubernetes/bin/cni
# scp -r /opt/kubernetes/bin/cni/* 192.168.56.12:/opt/kubernetes/bin/cni/
# scp -r /opt/kubernetes/bin/cni/* 192.168.56.13:/opt/kubernetes/bin/cni/
```
创建Etcd的key
```shell
# 创建pod的网段是什么，要在etcd配置上，flannel会从etcd来取然后分配
/opt/kubernetes/bin/etcdctl --ca-file /opt/kubernetes/ssl/ca.pem --cert-file /opt/kubernetes/ssl/flanneld.pem --key-file /opt/kubernetes/ssl/flanneld-key.pem \
      --no-sync -C https://192.168.56.11:2379,https://192.168.56.12:2379,https://192.168.56.13:2379 \
mk /kubernetes/network/config '{ "Network": "10.2.0.0/16", "Backend": { "Type": "vxlan", "VNI": 1 }}' >/dev/null 2>&1
```
启动flannel
```
[root@linux-node1 ~]# systemctl daemon-reload
[root@linux-node1 ~]# systemctl enable flannel
[root@linux-node1 ~]# chmod +x /opt/kubernetes/bin/*
[root@linux-node1 ~]# systemctl start flannel
```
查看服务状态
```
[root@linux-node1 ~]# systemctl status flannel
```

## 配置Docker使用Flannel
```
[root@linux-node1 ~]# vim /usr/lib/systemd/system/docker.service
[Unit] #在Unit下面修改After和增加Requires
After=network-online.target firewalld.service flannel.service
Wants=network-online.target
Requires=flannel.service

[Service] #增加EnvironmentFile=-/run/flannel/docker
Type=notify
EnvironmentFile=-/run/flannel/docker
ExecStart=/usr/bin/dockerd $DOCKER_OPTS
```
将配置复制到另外两个阶段
```
# scp /usr/lib/systemd/system/docker.service 192.168.56.12:/usr/lib/systemd/system/
# scp /usr/lib/systemd/system/docker.service 192.168.56.13:/usr/lib/systemd/system/
```
重启Docker
```
[root@linux-node1 ~]# systemctl daemon-reload
[root@linux-node1 ~]# systemctl restart docker
```

## 创建第一个K8s应用

1.创建一个测试用的deployment

```
[root@linux-node1 ~]# kubectl run net-test --image=alpine --replicas=2 sleep 360000
```

2.查看获取IP情况

```
[root@linux-node1 ~]# kubectl get pod -o wide
NAME                        READY     STATUS    RESTARTS   AGE       IP          NODE
net-test-5767cb94df-q92md   1/1       Running   0          35s       10.2.40.2   192.168.56.13
net-test-5767cb94df-s76nb   1/1       Running   0          35s       10.2.79.2   192.168.56.12
```

3.测试联通性

```
ping 10.2.40.2
ping 10.2.79.2
```

书写deployement

```
[root@linux-node1 ~]# vim nginx-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.10.3
        ports:
        - containerPort: 80
```

创建

```
[root@linux-node1 ~]# kubectl create -f nginx-deployment.yaml 
deployment.apps "nginx-deployment" created

[root@linux-node1 ~]# kubectl get deployment
NAME               DESIRED   CURRENT   UP-TO-DATE   AVAILABLE   AGE
net-test           2         2         2            2           6m
nginx-deployment   3         3         3            0           31s
```

查看详情：

```
[root@linux-node1 ~]# kubectl describe deployment nginx-deployment
Name:                   nginx-deployment
Namespace:              default
CreationTimestamp:      Wed, 30 May 2018 07:35:06 -0400
Labels:                 app=nginx
Annotations:            deployment.kubernetes.io/revision=1
Selector:               app=nginx
Replicas:               3 desired | 3 updated | 3 total | 0 available | 3 unavailable
StrategyType:           RollingUpdate
MinReadySeconds:        0
RollingUpdateStrategy:  25% max unavailable, 25% max surge
Pod Template:
  Labels:  app=nginx
  Containers:
   nginx:
    Image:        nginx:1.10.3
    Port:         80/TCP
    Host Port:    0/TCP
    Environment:  <none>
    Mounts:       <none>
  Volumes:        <none>
Conditions:
  Type           Status  Reason
  ----           ------  ------
  Available      False   MinimumReplicasUnavailable
  Progressing    True    ReplicaSetUpdated
OldReplicaSets:  <none>
NewReplicaSet:   nginx-deployment-75d56bb955 (3/3 replicas created)
Events:
  Type    Reason             Age   From                   Message
  ----    ------             ----  ----                   -------
  Normal  ScalingReplicaSet  1m    deployment-controller  Scaled up replica set nginx-deployment-75d56bb955 to 3
```

查看pod

```shel
kubectl describe pod nginx-deployment-75d56bb955-djxmq
```

```
[root@linux-node1 ~]# kubectl get pod
NAME                                READY     STATUS    RESTARTS   AGE
net-test-5767cb94df-q92md           1/1       Running   0          10m
net-test-5767cb94df-s76nb           1/1       Running   0          10m
nginx-deployment-75d56bb955-djxmq   1/1       Running   0          4m
nginx-deployment-75d56bb955-dm4xs   1/1       Running   0          4m
nginx-deployment-75d56bb955-l674f   1/1       Running   0          4m
```

```
[root@linux-node1 ~]# kubectl get pod -o wide
NAME                                READY     STATUS    RESTARTS   AGE       IP          NODE
net-test-5767cb94df-q92md           1/1       Running   0          11m       10.2.40.2   192.168.56.13
net-test-5767cb94df-s76nb           1/1       Running   0          11m       10.2.79.2   192.168.56.12
nginx-deployment-75d56bb955-djxmq   1/1       Running   0          5m        10.2.40.4   192.168.56.13
nginx-deployment-75d56bb955-dm4xs   1/1       Running   0          5m        10.2.40.3   192.168.56.13
nginx-deployment-75d56bb955-l674f   1/1       Running   0          5m        10.2.79.3   192.168.56.12

[root@linux-node1 ~]# curl --head http://10.2.40.4
HTTP/1.1 200 OK
Server: nginx/1.10.3
Date: Wed, 30 May 2018 11:40:55 GMT
Content-Type: text/html
Content-Length: 612
Last-Modified: Tue, 31 Jan 2017 15:01:11 GMT
Connection: keep-alive
ETag: "5890a6b7-264"
Accept-Ranges: bytes
```

更新deployment

```shell
# --record记录历史日志
kubectl set image deployment/nginx-deployment nginx=nginx:1.12.2 --record
```

查看更新后的deployment

```shell
kubectl get deployment -o wide
```

查看更新历史

```shell
kubectl rollout history deployment/nginx-deployment
```

查看具体某一个版本的升级历史

```shell
kubectl rollout history deployment/nginx-deployment --revision=1
```

快速回滚到上一个版本

```shell
kubectl rollout undo deployment/nginx-deployment
```

在这个过程中会发现过程中每次pod的ip都会发生变化。因此不能去访问pod的ip，要去访问service：

```
[root@linux-node1 ~]# vim nginx-service.yaml
kind: Service
apiVersion: v1
metadata:
  name: nginx-service
spec:
  selector:
    app: nginx
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
    

[root@linux-node1 ~]# kubectl create -f nginx-service.yaml 
service "nginx-service" created


# 这个拿到的就是vip，可以帮我们做负载均衡。
# 记住只有node节点，装了kube-proxy的才能访问，比如你的k8s master没装kube-proxy那就不能访问的
[root@linux-node1 ~]# kubectl get service
NAME            TYPE        CLUSTER-IP    EXTERNAL-IP   PORT(S)   AGE
kubernetes      ClusterIP   10.1.0.1      <none>        443/TCP   1h
nginx-service   ClusterIP   10.1.225.31   <none>        80/TCP    29s

# 当前副本是3个，快速扩容到5个
kubectl scale deployment nginx-deployment --replicas 5
```

