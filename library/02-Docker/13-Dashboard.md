# Kubernetes Dashboard

## coredns.yaml

```
[root@linux-node1 ~]# cat coredns.yaml 
apiVersion: v1
kind: ServiceAccount
metadata:
  name: coredns
  namespace: kube-system
  labels:
      kubernetes.io/cluster-service: "true"
      addonmanager.kubernetes.io/mode: Reconcile
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  labels:
    kubernetes.io/bootstrapping: rbac-defaults
    addonmanager.kubernetes.io/mode: Reconcile
  name: system:coredns
rules:
- apiGroups:
  - ""
  resources:
  - endpoints
  - services
  - pods
  - namespaces
  verbs:
  - list
  - watch
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  annotations:
    rbac.authorization.kubernetes.io/autoupdate: "true"
  labels:
    kubernetes.io/bootstrapping: rbac-defaults
    addonmanager.kubernetes.io/mode: EnsureExists
  name: system:coredns
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: system:coredns
subjects:
- kind: ServiceAccount
  name: coredns
  namespace: kube-system
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: coredns
  namespace: kube-system
  labels:
      addonmanager.kubernetes.io/mode: EnsureExists
data:
  Corefile: |
    .:53 {
        errors
        health
        kubernetes cluster.local. in-addr.arpa ip6.arpa {
            pods insecure
            upstream
            fallthrough in-addr.arpa ip6.arpa
        }
        prometheus :9153
        proxy . /etc/resolv.conf
        cache 30
    }
---
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: coredns
  namespace: kube-system
  labels:
    k8s-app: coredns
    kubernetes.io/cluster-service: "true"
    addonmanager.kubernetes.io/mode: Reconcile
    kubernetes.io/name: "CoreDNS"
spec:
  replicas: 2
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
  selector:
    matchLabels:
      k8s-app: coredns
  template:
    metadata:
      labels:
        k8s-app: coredns
    spec:
      serviceAccountName: coredns
      tolerations:
        - key: node-role.kubernetes.io/master
          effect: NoSchedule
        - key: "CriticalAddonsOnly"
          operator: "Exists"
      containers:
      - name: coredns
        image: coredns/coredns:1.0.6
        imagePullPolicy: IfNotPresent
        resources:
          limits:
            memory: 170Mi
          requests:
            cpu: 100m
            memory: 70Mi
        args: [ "-conf", "/etc/coredns/Corefile" ]
        volumeMounts:
        - name: config-volume
          mountPath: /etc/coredns
        ports:
        - containerPort: 53
          name: dns
          protocol: UDP
        - containerPort: 53
          name: dns-tcp
          protocol: TCP
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
            scheme: HTTP
          initialDelaySeconds: 60
          timeoutSeconds: 5
          successThreshold: 1
          failureThreshold: 5
      dnsPolicy: Default
      volumes:
        - name: config-volume
          configMap:
            name: coredns
            items:
            - key: Corefile
              path: Corefile
---
apiVersion: v1
kind: Service
metadata:
  name: coredns
  namespace: kube-system
  labels:
    k8s-app: coredns
    kubernetes.io/cluster-service: "true"
    addonmanager.kubernetes.io/mode: Reconcile
    kubernetes.io/name: "CoreDNS"
spec:
  selector:
    k8s-app: coredns
  clusterIP: 10.1.0.2
  ports:
  - name: dns
    port: 53
    protocol: UDP
  - name: dns-tcp
    port: 53
    protocol: TCP
```

## 创建CoreDNS
```
[root@linux-node1 ~]# kubectl create -f coredns.yaml 

[root@linux-node1 ~]# kubectl get pod -n kube-system
NAME                                    READY     STATUS    RESTARTS   AGE
coredns-77c989547b-9pj8b                1/1       Running   0          6m
coredns-77c989547b-kncd5                1/1       Running   0          6m

[root@linux-node1 ~]# kubectl get deployment -n kube-system
NAME      DESIRED   CURRENT   UP-TO-DATE   AVAILABLE   AGE
coredns   2         2         2            2           2m

[root@linux-node1 ~]# kubectl get service -n kube-system
NAME      TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)         AGE
coredns   ClusterIP   10.1.0.2     <none>        53/UDP,53/TCP   3m

# 在有kube-proxy的位置查看转发
[root@linux-node2 ~]# ipvsadm -Ln
IP Virtual Server version 1.2.1 (size=4096)
Prot LocalAddress:Port Scheduler Flags
  -> RemoteAddress:Port           Forward Weight ActiveConn InActConn
TCP  10.1.0.1:443 rr persistent 10800
  -> 192.168.56.11:6443           Masq    1      1          0         
TCP  10.1.0.2:53 rr
  -> 10.2.40.9:53                 Masq    1      0          0         
  -> 10.2.79.8:53                 Masq    1      0          0         
TCP  10.1.225.31:80 rr
  -> 10.2.40.6:80                 Masq    1      0          0         
  -> 10.2.40.7:80                 Masq    1      0          0         
  -> 10.2.40.8:80                 Masq    1      0          0         
  -> 10.2.79.6:80                 Masq    1      0          0         
  -> 10.2.79.7:80                 Masq    1      0          0         
UDP  10.1.0.2:53 rr
  -> 10.2.40.9:53                 Masq    1      0          0         
  -> 10.2.79.8:53                 Masq    1      0          0 
  
  
[root@linux-node1 ~]# kubectl get pod -n kube-system       
NAME                       READY     STATUS    RESTARTS   AGE
coredns-77c989547b-54hwk   1/1       Running   0          5m
coredns-77c989547b-gf54w   1/1       Running   0          5m


# 起容器
[root@linux-node1 ~]# kubectl run dns-test --rm -it --image=alpine /bin/sh 
If you don't see a command prompt, try pressing enter.
/ # ping dcgamer.top
PING dcgamer.top (124.193.0.2): 56 data bytes
64 bytes from 124.193.0.2: seq=0 ttl=127 time=7.602 ms
64 bytes from 124.193.0.2: seq=1 ttl=127 time=5.979 ms
64 bytes from 124.193.0.2: seq=2 ttl=127 time=5.164 ms
64 bytes from 124.193.0.2: seq=3 ttl=127 time=5.314 ms

# 查看日志
[root@linux-node1 dashboard]# kubectl get pod -n kube-system
NAME                                    READY     STATUS              RESTARTS   AGE
coredns-77c989547b-54hwk                1/1       Running             0          15m
coredns-77c989547b-gf54w                1/1       Running             0          15m
kubernetes-dashboard-66c9d98865-spkfj   0/1       ContainerCreating   0          12s
[root@linux-node1 dashboard]# kubectl logs pod/coredns-77c989547b-54hwk -n kube-system
.:53
CoreDNS-1.0.6
linux/amd64, go1.10, 83b5eadb
2018/05/30 12:22:51 [INFO] CoreDNS-1.0.6
2018/05/30 12:22:51 [INFO] linux/amd64, go1.10, 83b5eadb
```

## 创建Dashboard

```
[root@linux-node1 dashboard]# ll
total 28
-rw-r--r-- 1 root root  515 May 17 10:09 admin-token.yaml
-rw-r--r-- 1 root root  357 May 17 06:26 admin-user-sa-rbac.yaml
-rw-r--r-- 1 root root  330 May 17 10:07 dashboard-admin.yaml
-rw-r--r-- 1 root root 4901 May 17 06:26 kubernetes-dashboard.yaml
-rw-r--r-- 1 root root  458 May 17 06:26 ui-admin-rbac.yaml
-rw-r--r-- 1 root root  477 May 17 06:26 ui-read-rbac.yaml

[root@linux-node1 dashboard]# kubectl create -f .
clusterrolebinding.rbac.authorization.k8s.io "admin" created
serviceaccount "admin" created
serviceaccount "admin-user" created
clusterrolebinding.rbac.authorization.k8s.io "admin-user" created
clusterrolebinding.rbac.authorization.k8s.io "kubernetes-dashboard" created
secret "kubernetes-dashboard-certs" created
serviceaccount "kubernetes-dashboard" created
role.rbac.authorization.k8s.io "kubernetes-dashboard-minimal" created
rolebinding.rbac.authorization.k8s.io "kubernetes-dashboard-minimal" created
deployment.apps "kubernetes-dashboard" created
service "kubernetes-dashboard" created
clusterrole.rbac.authorization.k8s.io "ui-admin" created
rolebinding.rbac.authorization.k8s.io "ui-admin-binding" created
clusterrole.rbac.authorization.k8s.io "ui-read" created
rolebinding.rbac.authorization.k8s.io "ui-read-binding" created


# 监听了node port。映射到了node节点的25106，记得是node节点的25106，不是master，因为master没有起kube-proxy
[root@linux-node1 dashboard]# kubectl get service -n kube-system
NAME                   TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)         AGE
coredns                ClusterIP   10.1.0.2     <none>        53/UDP,53/TCP   18m
kubernetes-dashboard   NodePort    10.1.13.1    <none>        443:25106/TCP   3m

# 记得访问https的地址
https://192.168.100.12:25106/
```

```
[root@linux-node1 ~]# kubectl create -f dashboard/
```

```
# 执行这个命令获取令牌，登录仪表盘，输入令牌
kubectl -n kube-system describe secret $(kubectl -n kube-system get secret | grep admin-user | awk '{print $1}')
```

