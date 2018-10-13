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
# 如果send.py程序之前运行过，但是我们还不能确认，哪个程序先运行的，假如你执行消费者的时候生产者没有存在，此时说明这个队列还没有被声明，这个时候是会报错的。这种情况下同时在两个程序里执行以下这个操作是不错的实践
# 如果已经存在的队列重复声明的时候会进行检查，如果有的话就不会声明了，其实相当于一种确认机制。
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

### 消息单播

默认情况下，如果一个队列有多个消费者，那么多个消费者是轮询的去取消息的。一人一个这样的去取，不过这样其实不是很好的一个方式，因为没有考虑到消费者的处理能力，有的消费者处理快，有的消费者处理的慢，如果按照这样的轮询去分发的话那么就会造成处理慢的消费者的消息的积压而处理快的反而闲着没事做的情况。因此这里有一个消息公平分发的问题。

针对这个分发的问题，我们可以在各个的消费者端配置`prefetch=1`，意思就是告诉rabbitmq在我这个消费者当前信息还没处理完的时候就不要给我发送新的消息了

### 消息的发布与订阅

之前的例子都基本都是1对1的消息发送和接收，即消息只能发送到指定的queue里，但有些时候你想让你的消息被所有的Queue收到，类似广播的效果，这时候就要用到exchange了，

An exchange is a very simple thing. On one side it receives messages from producers and the other side it pushes them to queues. The exchange must know exactly what to do with a message it receives. Should it be appended to a particular queue? Should it be appended to many queues? Or should it get discarded. The rules for that are defined by the *exchange type.*

Exchange在定义的时候是有类型的，以决定到底是哪些Queue符合条件，可以接收消息



- fanout: 所有bind到此exchange的queue都可以接收消息

- direct: 通过routingKey和exchange决定的那个唯一的queue可以接收消息

- topic:所有符合routingKey(此时可以是一个表达式)的routingKey所bind的queue可以接收消息

  ```
  表达式符号说明：#代表一个或多个字符，*代表任何字符
  例：#.a会匹配a.a，aa.a，aaa.a等
     *.a会匹配a.a，b.a，c.a等
       注：使用RoutingKey为#，Exchange Type为topic的时候相当于使用fanout　
  ```


headers: 通过headers 来决定把消息发给哪些queue，这个非常少用到。

到目前为止，这个消息是单播，也就是被一个人消费掉就没了，但是不是广播；

**消息的发布者（生产者）**

```python
# 其实这个手可以发现，并没有声明队列了，在basic_publish中routing_key也没有指定了。
# 代表着我只需要把消息发送到exchange就可以了，exchange再把消息发送到队列里。
import pika
import sys
 
connection = pika.BlockingConnection(pika.ConnectionParameters(
        host='localhost'))
channel = connection.channel()
 
channel.exchange_declare(exchange='logs',
                         type='fanout')
 
message = ' '.join(sys.argv[1:]) or "info: Hello World!"
channel.basic_publish(exchange='logs',
                      routing_key='',
                      body=message)
print(" [x] Sent %r" % message)
connection.close()
```

**消息的订阅者（消费者）**

```python
import pika
 
connection = pika.BlockingConnection(pika.ConnectionParameters(
        host='localhost'))
channel = connection.channel()
 
channel.exchange_declare(exchange='logs',
                         type='fanout')

# 其实现在已经不需要队列了，因此手动声明队列的方式就显的很多余了。此时如下的这个操作就会自动为你生成队列，不用了以后会自动删掉。exclusive指的是唯一的，排他的。类似于数据库中的unique=True。其实就是指定生成一个名字唯一的队列名。不指定queue名字,rabbit会随机分配一个名字,exclusive=True会在使用此queue的消费者断开后，自动将queue删除，这里返回的result其实就是一个queue的对象。
result = channel.queue_declare(exclusive=True) 
# 获取queue的名字
queue_name = result.method.queue
# 把queue绑定到对应的exchange上。当没有任何一个队列绑定到exchange的时候消息会丢失，exchange并不负责对消息进行存储。应用场景比如新浪微博等等。虽然新浪微博用的不一定是rabbitmq。只有当前登录的用户才能收到消息，可以排除僵尸粉，应用场景登录的才有这样就可以做资源的节省，避免不必要的浪费。
channel.queue_bind(exchange='logs',
                   queue=queue_name)
 
print(' [*] Waiting for logs. To exit press CTRL+C')
 
def callback(ch, method, properties, body):
    print(" [x] %r" % body)
 
channel.basic_consume(callback,
                      queue=queue_name,
                      no_ack=True)
 
channel.start_consuming()
```

### 消息组播



**Publisher**

```python
import pika
import sys
 
connection = pika.BlockingConnection(pika.ConnectionParameters(
        host='localhost'))
channel = connection.channel()
 
channel.exchange_declare(exchange='direct_logs',
                         type='direct')

# 可以人工指定你把消息发送到哪个组里
severity = sys.argv[1] if len(sys.argv) > 1 else 'info'
message = ' '.join(sys.argv[2:]) or 'Hello World!'
# 组播的时候routing_key就不是空了。
channel.basic_publish(exchange='direct_logs',
                      routing_key=severity,
                      body=message)
print(" [x] Sent %r:%r" % (severity, message))
connection.close()
```

**subscriber**

```python
import pika
import sys
 
connection = pika.BlockingConnection(pika.ConnectionParameters(
        host='localhost'))
channel = connection.channel()
 
channel.exchange_declare(exchange='direct_logs',
                         type='direct')
 
result = channel.queue_declare(exclusive=True)
queue_name = result.method.queue

# 指定接收哪个分组的消息
severities = sys.argv[1:]
if not severities:
    sys.stderr.write("Usage: %s [info] [warning] [error]\n" % sys.argv[0])
    sys.exit(1)

# 循环绑定，对于组播来讲，就是你想收机组消息就绑定几组。
# 订阅与发布一定是你绑定了而且在线，如果你离线了，对不起你是收不到的。
# 这个很像广播电台，你打开了，你能听现在的，之前的你是收不到的。
for severity in severities:
    channel.queue_bind(exchange='direct_logs',
                       queue=queue_name,
                       routing_key=severity)
 
print(' [*] Waiting for logs. To exit press CTRL+C')
 
def callback(ch, method, properties, body):
    print(" [x] %r:%r" % (method.routing_key, body))
 
channel.basic_consume(callback,
                      queue=queue_name,
                      no_ack=True)
 
channel.start_consuming()
```

### RPC

snmp，不需要远程装一个客户端来执行了。



**RPC Server**

```python
# 1.定义好fib函数
# 2.声明接收指令的队列名，rpc_queue
# 3.监听队列，收到消息后，调用fib函数。
# 4.把fib执行结果，发送回客户端指定的reply_to队列。
import pika
import time
connection = pika.BlockingConnection(pika.ConnectionParameters(
        host='localhost'))
 
channel = connection.channel()
 
channel.queue_declare(queue='rpc_queue')
 
def fib(n):
    if n == 0:
        return 0
    elif n == 1:
        return 1
    else:
        return fib(n-1) + fib(n-2)
 
def on_request(ch, method, props, body):
    n = int(body)
 
    print(" [.] fib(%s)" % n)
    response = fib(n)
 
    ch.basic_publish(exchange='',
                     # 客户端传过来的队列：props.reply_to
                     routing_key=props.reply_to,
                     # 同时还要带上uuid
                     properties=pika.BasicProperties(correlation_id = \
                                                         props.correlation_id),
                     body=str(response))
    # 确认执行完毕。
    ch.basic_ack(delivery_tag = method.delivery_tag)
 
channel.basic_qos(prefetch_count=1)
channel.basic_consume(on_request, queue='rpc_queue')
 
print(" [x] Awaiting RPC requests")
channel.start_consuming()
```

**RPC Client**

```python
# 1.声明一个队列，作为reply_to返回消息结果的杜烈
# 2.发消息到队列，消息里带一个唯一标识符uid，reply_to
# 3.监听reply_to的队列，直到有结果返回。
import pika
import uuid
 
class FibonacciRpcClient(object):
    def __init__(self):
        credentials = pika.PlainCredentials('lamber', 'lamber123')
        parameters = pika.ConnectionParameters(host='192.168.56.100', credentials=credentials)
        self.connection = pika.BlockingConnection(pika.ConnectionParameters(
                host='localhost'))
 		
        self.channel = self.connection.channel()
        # 初始化一个消息队列。也就是replay_to
        result = self.channel.queue_declare(exclusive=True)
        # queue_name
        self.callback_queue = result.method.queue
        # 声明监听（只是声明）到reply_to队列收到消息以后执行回调函数on_response
        self.channel.basic_consume(self.on_response, no_ack=True,
                                   queue=self.callback_queue)
 
    def on_response(self, ch, method, props, body):
        # 收到队列结果以后执行的函数
        # props端返回的消息结果
        if self.corr_id == props.correlation_id:
            self.response = body
 
    def call(self, n):
        # 返回值
        self.response = None
        # 设置唯一标识符也就是uid，可以使用uuid模块，也可以使用当前时间戳生成md5都可以
        self.corr_id = str(uuid.uuid4())
        self.channel.basic_publish(exchange='',
                                   routing_key='rpc_queue',
                                   # 带着唯一标识符和队列这个reply_to和correlation_id
                                   # 这个是内置参数，所以名字这是写好的，别随便改。
                                   properties=pika.BasicProperties(
                                         reply_to = self.callback_queue,
                                         correlation_id = self.corr_id,
                                         ),
                                   body=str(n))
        while self.response is None:
            # 不同于start_consuming，下面的用法是非阻塞的。
            # 检测队列里有没有新消息。收到消息以后触发调用回调函数。
            self.connection.process_data_events()
        return int(self.response)
 
fibonacci_rpc = FibonacciRpcClient()
 
print(" [x] Requesting fib(30)")
response = fibonacci_rpc.call(30)
print(" [.] Got %r" % response)
```

### 规则播



```
# 代表所有
kern.* 代表以kern开头的
```

