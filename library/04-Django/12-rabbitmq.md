# Rabbitmq

>www.cnblogs.com/alex3714/articles/5248247.html

**队列解决了两个问题**

- 同步：同步的排队等待会造成资源的浪费，但是相对的有点就是能够保证任务被及时执行。

- 解耦
- 异步
  - 优点：解决排队问题。相反的，同步的就是不能解决排队问题。解决了资源浪费的问题
  - 缺点：不能保证任务被及时的执行。相反的，同步的优点就是能够保证被及时执行。我怎么判断内容是被正确的人拿走了，而不是被偷走了呢？事实上这个人拿了内容以后是有一个处理和确认机制的。
  - 应用场景：比如买票和出票的过程，不是买了就能出票，整个过程是异步的。

**队列的作用**

1. 存储消息，数据
2. 保证消息顺序
3. 保证数据的交付

pv、uv：page view，user visit，uv的判定基准是什么；qps

**为什么用Rabbitmq而不用Python的queue**

- 因为Python的Queue不能跨进程

## Rabbitmq

### 安装

**Erlang**

> https://packages.erlang-solutions.com/erlang/

rabbitmq-server依赖于erlang环境，因此在安装Rabbitmq之前先要确保你的epel源以及erlang环境是正常的。

```shell
# 安装repo
wget https://packages.erlang-solutions.com/erlang-solutions-1.0-1.noarch.rpm
rpm -Uvh erlang-solutions-1.0-1.noarch.rpm

# 或者手动添加repo源也是可以的。这两种方式任选其一
rpm --import https://packages.erlang-solutions.com/rpm/erlang_solutions.asc
# 添加到/etc/yum.repo.d/下
[erlang-solutions]
name=CentOS $releasever - $basearch - Erlang Solutions
baseurl=https://packages.erlang-solutions.com/rpm/centos/$releasever/$basearch
gpgcheck=1
gpgkey=https://packages.erlang-solutions.com/rpm/erlang_solutions.asc
enabled=1

# 安装erlang，选择其中一种方式就可以，具体区别可以在上面的连接查看详细内容
yum install erlang -y
yum install esl-erlang -y
```

**安装rabbitmq**

```shell
# 导入key
rpm --import https://github.com/rabbitmq/signing-keys/releases/download/2.0/rabbitmq-release-signing-key.asc

# 更新repo
[root@centos7test ~]# cat /etc/yum.repos.d/rabbitmq.repo 
[bintray-rabbitmq-server]
name=bintray-rabbitmq-rpm
baseurl=https://dl.bintray.com/rabbitmq/rpm/rabbitmq-server/v3.7.x/el/7/
gpgcheck=0
repo_gpgcheck=0
enabled=1

# 安装
yum -y install rabbitmq-server

# 创建rabbitmq-server的用户(记得先开启rabbitmq-server)
sudo rabbitmqctl add_user lamber lamber123

# 配置权限，允许从外面访问
sudo rabbitmqctl set_permissions -p / lamber ".*" ".*" ".*"

- conf:允许用户修改配置信息
- write:
```

**安装pika**

```shell
# pika是python用来连接rabbitmq的东西
pip install pika 或者 easy_install pika
```

###  

> rabbitmq是一个独立的组件，可以起在一个端口上供使用者使用。rabbitmq中存在多个队列供不同的程序调用，因为每一个程序的消息是独立的；

5672是rabbitmq的端口号，

启动rabbitmq-server

```shell
rabbitmq-server
```

查看队列，显示当前的队列列表

```shell
rabbitmqctl list_queues
```

Python端的生产者源码：

```python
# 生产者
# 1、端口，ip，认证信息
# 2、创建队列
# 3、往队列里发消息

import pika

credentials = pika.PlainCredentials('lamber', 'lamber123')
connection = pika.BlockingConnection(pika.ConnectionParameters(host='192.168.56.100', credentials=credentials))
channel = connection.channel()

# 声明queue，队列的名称为hello
channel.queue_declare(queue='hello')

# 可以开始发消息了。exchange，指定使用什么过滤器，因为消息插入队列必须经过过滤器，它不可能直接插入到队列中
# 因此即使现在不适用也要指定一个，空指的是默认的exchange
# routing_key是路由，其实就是走哪个队列，body即内容。
channel.basic_publish(exchange='',
                      routing_key='hello',
                      body='Hello World!')
print(" [x] Sent 'Hello World!'")
connection.close()



[root@centos7test ~]# rabbitmqctl list_queues
Timeout: 60.0 seconds ...
Listing queues for vhost / ...
hello   1
```

Python端的消费者源码：

```shell
# 消费者
# 1、端口，ip，认证信息
# 2、从指定队列里获取消息
import pika

credentials = pika.PlainCredentials('lamber', 'lamber123')
connection = pika.BlockingConnection(pika.ConnectionParameters(host='192.168.56.100', credentials=credentials))
channel = connection.channel()

# 你可能会问为什么要再定义一次队列，如果你能够确定这个队列确实存在那么你应该避免再次定义。
# 如果send.py程序之前运行过，但是我们还不能确认，哪个程序先运行的。这种情况下同时在两个程序里执行以下这个操作是不错的实践
channel.queue_declare(queue='hello')

def callback(ch, method, properties, body):
    """
    回调函数，当收到消息以后会调用的函数
    :param ch: channel
    :param method: 请求的方式
    :param properties: 参数
    :param body: 信息的内容
    :return:
    """
    # <BlockingChannel impl=<Channel number=1 OPEN conn=<SelectConnection OPEN socket=('192.168.56.1', 54795)->('192.168.56.100', 5672) params=<ConnectionParameters host=192.168.56.100 port=5672 virtual_host=/ ssl=False>>>>
    # print(ch)
    # <Basic.Deliver(['consumer_tag=ctag1.1ad1df223f174bc8a98e170e750e5584', 'delivery_tag=2', 'exchange=', 'redelivered=False', 'routing_key=hello'])>
    # print(method)
    # <BasicProperties>
    # print(properties)
    # print(" [x] Received %r" % body)
    print(body)


channel.basic_consume(callback,
                      queue='hello',
                      no_ack=True)

print(' [*] Waiting for messages. To exit press CTRL+C')
# 开始取消息，出于阻塞模式
channel.start_consuming()
```



如何保证消息完整的交付或者被处理掉？这里用到了三个参数：

1. no_ack：默认是确认机制，除非你设置为`no_ack=True`。

2. 生产者这一段加上

   ```python
   channel.basic_publish(exchange='',
                         routing_key='hello',
                         # 消息持久化的操作
                         properties=pika.BasicProperties(delivery_mode=2, ),
                         body='Hello World!')
   ```

3. 消费者端，消息处理完毕的时候，发送确认包

   ```python
   def callback(ch, method, properties, body):
       print(body)
       # 手动向rabbitmq-server进行确认，消费者确认以后，服务端才会删掉这条消息
       ch.basic_ack(delivery_tag=method.delivery_tag)
   ```



如果rabbitmq-server宕了，该怎么办？生成队列的时候加上持久的参数

```python
# 队列持久化参数durable，队列一定要在第一次生成的时候设置durable
channel.queue_declare(queue='hello', durable=True)
```

因此队列和消息要想重启的时候内容都存在，那么durable和delivery_mode就需要全部设置上才行。

### 消息广播

默认情况下，如果一个队列有多个消费者，那么多个消费者是轮询的去取消息的。一人一个这样的去取，不过这样其实不是很好的一个方式，因为没有考虑到消费者的处理能力，有的消费者处理快，有的消费者处理的慢，如果按照这样的轮询去分发的话那么就会造成处理慢的消费者的消息的积压而处理快的反而闲着没事做的情况。因此这里有一个消息公平分发的问题。

针对这个分发的问题，我们可以在各个的消费者端配置`prefetch=1`，意思就是告诉rabbitmq在我这个消费者当前信息还没处理完的时候就不要给我发送新的消息了



