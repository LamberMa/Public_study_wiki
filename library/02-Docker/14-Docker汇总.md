Docker解决了打包和隔离的问题，但是在集群当中运行docker我们要需要更多的问题去解决，这些docker是没有给出解决方案的。

- 调度的问题，容器该在哪里问题
- 生命周期和健康状况，保证容器没有错误的运行
- 服务发现，比如容器在哪，该如何进行通信
- 监控，查看现在容器是否运行正常呢？
- 认证的问题，谁能访问我的容器？
- 容器聚合，如何将多个互相关联的容器聚合成一个功能？

k8s在集群中，多个主机之间管理容器化应用的开源系统。它使得部署容器化，微服务应用变的更加简单。

- 开源Docker容器编排系统
- 轻量级，简单
- 公有云，私有云以及混合云中部署
- 模块化，可插拔化（允许将三方应用接入到k8s中），可挂接（可以接受k8s的相关的时间并做进一步处理），可组合（可以任意的选择k8s中的一些功能组合成一个功能系统）
- 提供了容器的自动回复，自动重启，自动复制。

## Kubectl

```shell
# 获取当前集群中的node工作节点
kubectl get nodes

# 获取当前k8s集群发生的事件
kubectl get events
```

## Pods

> 在k8s中创建，调度以及管理的最小单元其实并不是Docker容器，而是Pods，Pods是共存的一组容器的集合，在一个Pods中可以有一个容器，可以存在多个容器。在同一个pods的容器共享PID，网络，IPC以及UTS命名空间。共享了PID的命名空间，可以让容器之间看到彼此的进程，使用了同一个网络命名空间，可以让一个pods的容器使用同样的ip地址和端口，或者使用localhost来进行互相访问。使用了同一个IPC的命名空间，同一个pods的容器应用可以使用systemv-ipc或者posix的消息队列的方式进行通信。共享同一个UTS命名空间，使得一个pods内的容器，共享一个主机名。同时在一个pods内的容器还可以共享存储卷。K8s设计pods的目的是为了更好的进行资源的共享，以及容器间的通信，便于管理。Pods是一个短暂存在的对象，Pods的声明周期可以分为以下几个状态。Pending表示，pods已经被系统接受，但是一个或者多个容器镜像还没有被创建。这包括容器被调度之前的时间和下载容器镜像的时间。Running，表示pods已经被部署到节点上，并且所有的节点已经被创建。Successed，表示pods中的容器都已经被成功停止，并且不会被重启。Failed，表示pods中所有的容器都被停止了，并且至少有一个容器在停止的时候出现了错误。

```shell
kubectl create -f yaml文件

kubectl get pods
READY：是k8s提供的一个服务可用性的检测，0表示容器启动，服务仍然没有正常启动。

kubectl delete pods pods名称
```

> volumes
>
> - 数据持久化
> - Pod中容器共享数据
> - 生命周期，当pods停止退出的时候，这个volumes也会停止退出，当容器crash的时候volumes并不会直接退出。
> - 支持多种类型的数据卷，emptyDir，hostpath，gcePersistentDisk，awsElasticBlockStore，nfs，iscsi，glusterfs，secrets

volumn的yaml参考：

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: redis
spec:
  containers:
  - name: redis
    image: redis
    volumnMounts:
    - name: redis-persistent-storage
      mountPath: /data/redis
  volumes:
  - name: redis-persistent-storage
    emptyDir: {}
```

查看更详细输出：

```shell
kubectl get pods redis -o yaml
```

## Labels

- 用以标识对象（比如pod）的键值对
- 组织并选择对象子集

声明一个带labels的pods。

```yaml
apiVersion: v1
kind:Pod
metadata:
  name: nginx
  labels:
    app: nginx
spec:
  container:
  - name: nginx
    image: nginx
    ports:
    - containerPort: 80
```

如何展现对应的lable的pods的子集

```shell
kubectl get pods -l app=nginx
```

## Replication Controllers(RC)

- 确保在任一时刻运行指定数目的pod
- 容器重新调度（多个节点）
- 规模调整
- RC可以通过一个接一个一点一点替换的方法实现在线升级。当旧的版本pods为0的时候可以删除旧的rc。需要注意的是，我们使用的新版本和旧版本的两个rc，需要至少有一处不同的label以标记不同版本的pods。
- 多发布版本跟踪，通过设置不同的label结合rc去实现。

controller的yaml文件参考

```yaml
apiVersion: v1
kind: ReplicationController
metadata: 
  name: nginx-controller
spec:
  replicas: 2
  # selector identifies the set of Pods that this
  # replication controllers is responsible for managing
  selector:
    app: nginx
  # podTemplate defines the "cookie cutter" used for creating
  # new pods when necessary
  template:
    metadata:
      labels:
        # Important: these labels need to match the selector above
        # The api server enforces this constraint
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx
        ports:
        - containerPort: 80
```

```shell
kubectl create -f rc.yaml
# 查看
kubectl get rc
```

## Services

- 抽象一系列Pod并定义其访问规则
- 固定IP地址和dns域名
- 通过环境变量和DNS发现服务
- 简单的负责均衡
- 外部服务（ClusterIP，NodePort，LoadBalancer）

service的yaml文件参考

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  ports:
  - port: 8000 # the port that this service should serve on 
    # the container on each pod to connect to,can be a name
    # (eg,'www') or a number (eg.80)
    targetPort: 80
    protocol: TCP
  # just like the selector in the replication controller
  # but this time it identifies the set of pods to load balance traffic to
  selector:
    app: nginx
```

![image-20180531154552206](/var/folders/8l/g95nllln61j4ly_zm_tqj2m40000gn/T/abnerworks.Typora/image-20180531154552206.png)

![image-20180531154844840](/var/folders/8l/g95nllln61j4ly_zm_tqj2m40000gn/T/abnerworks.Typora/image-20180531154844840.png)

![image-20180531154852938](/var/folders/8l/g95nllln61j4ly_zm_tqj2m40000gn/T/abnerworks.Typora/image-20180531154852938.png)

