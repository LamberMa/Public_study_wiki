静态方法：与类无关，不能访问类里的任何属性和方法

类方法：只能访问类变量

属性@property：把一个方法变成一个静态属性：

- flight.status
- @status.setter
- @status.delter

反射

- getattr(obj,str)
- setattr(obj,str,val)
- hasattr(obj,str)
- delattr(obj,str)

模块的动态加载，`__import__`但是官方的建议是使用importlib

```
import importlib
importlib.import_module('lib.aa')
```

# socket

## 什么是socket

> 网络上的两个程序通过一个双向的通信连接实现数据的交换，这个连接的一端称为一个socket。
>
> 建立网络通信连接至少要一对端口号(socket)。socket本质是编程接口(API)，对TCP/IP的封装，TCP/IP也要提供可供程序员做网络开发所用的接口，这就是Socket编程接口；HTTP是轿车，提供了封装或者显示数据的具体形式；Socket是发动机，提供了网络通信的能力。
>
> Socket的英文原义是“孔”或“插座”。作为BSD UNIX的[进程通信](https://baike.baidu.com/item/%E8%BF%9B%E7%A8%8B%E9%80%9A%E4%BF%A1)机制，取后一种意思。通常也称作"[套接字](https://baike.baidu.com/item/%E5%A5%97%E6%8E%A5%E5%AD%97)"，用于描述IP地址和端口，是一个通信链的句柄，可以用来实现不同虚拟机或不同计算机之间的通信。在Internet上的[主机](https://baike.baidu.com/item/%E4%B8%BB%E6%9C%BA)一般运行了多个服务软件，同时提供几种服务。每种服务都打开一个Socket，并绑定到一个端口上，不同的端口对应于不同的服务。Socket正如其英文原意那样，像一个多孔插座。一台主机犹如布满各种插座的房间，每个插座有一个编号，有的插座提供220伏交流电， 有的提供110伏交流电，有的则提供有线电视节目。 客户软件将插头插到不同编号的插座，就可以得到不同的服务。

### 服务端和客户端的职能

#### server端需要做什么：

- 持续稳定的提供服务
- 要绑定一个唯一的地址，允许客户端可以明确的找到

看下面的例子来理解建立socket的步骤：

**Server**(以打电话为例子)

```python
#!/usr/bin/python3.6
# -*- coding: utf-8 -*-
# author:maxiaoyu
import socket

# 买个电话(sock_stream基于流的套接字就是tcp的，DGRAM：datagram,就是基于UDP的)
phone = socket.socket(socket.AF_INET,socket.SOCK_STREAM)

# 买个电话要插电话卡，有手机号(server端的ip和端口号)
phone.bind(('127.0.0.1',8080))

# 开机
phone.listen(5) # 服务端最大可以挂起的连接数

# 开始监听客户端的请求，也就是等电话,服务端会卡在这里。
conn,addr = phone.accept()

print('电话线路',conn)
print('客户端的手机号',addr)

# 从自己的缓存里收1024字节，这个是上限，也就是说一次最多能收1024，如果
# 发过来一个1个那就收一个，但是超过1024最多只能拿1024.官方建议不要超过8K（8192）
# 因此针对这个问题我们一次收一点分多次接收
data = conn.recv(1024)  # 收消息
print('客户端发过来的消息',data)

conn.send(data.upper())

conn.close()

phone.close()
```

**Client**

```
#!/usr/bin/python3.6
# -*- coding: utf-8 -*-
# author:maxiaoyu
import socket
phone = socket.socket(socket.AF_INET,socket.SOCK_STREAM)
phone.connect(('127.0.0.1',8080))
phone.send('hello'.encode('utf-8'))

data = phone.recv(1024)
print(data)
phone.close()
```

首先运行服务端然后再运行客户端：

Server端的回显：

```
电话线路 <socket.socket fd=412, family=AddressFamily.AF_INET, type=SocketKind.SOCK_STREAM, proto=0, laddr=('127.0.0.1', 8080), raddr=('127.0.0.1', 5204)>
客户端的手机号 ('127.0.0.1', 5204)
客户端发过来的消息 b'hello'
```

客户端的回显：

```
b'HELLO'
```

##### 小结

**server端要想建立一个socker需要以下几个步骤：**

- 首先建立一个socket对象，声明地址簇和协议类型

  ```
  - 地址簇（family adress）
    - AF.INET: ipv4
    - AF.INET6: ipv6
    - AF.UNIX: local
  - 协议类型（socket protocol type）
    - sock.SOCK_STREAM：tcp
    - sock.DGRAM：udp
  ```

- 要给服务端一个唯一的地址和端口来提供服务的访问

- 绑定完成以后开始启用（listen），listen(n)，n可以是任意数字，这个其实代表的是可以放在缓存区的链接数量，就好比你月初月末给中国移动打电话，接线员总是有限的，用户是远大于接线员的，你可以拨进去转人工服务，但是你未必能立即获得到服务是一个道理，人不够的时候就提示你坐席繁忙请稍后。在这里也是一样的。当然这里的这个数是不能写死的，要写到配置文件里面去控制。

- 监听客户端的请求（accept），服务端会卡在这个地方

```
conn,addr = server.accept() #conn是链接的实例化对象，addr记录客户端地址
```

- 接收客户端的消息
- 给客户端回复消息
- 关闭与客户端的链接
- 关闭服务端socket

**client端的话也无外乎几个步骤：**

- 建立一个socket对象，声明地址簇和协议类型
- 我要链接的服务器的地址和端口
- 给服务端发消息
- 接收服务端消息
- 关闭客户端socket

### 针对上面的程序做一下小优化

- 当客户端退出的时候服务端也会被干掉

服务端应该提供的是持续的稳定的服务，但是现在的话只要客户端被断开以后服务端也会被强制reset（因为conn对象被干掉了），这是不符合要求的。为了避免这个问题我们加一个try …… except，因为客户端什么时候断开链接是不可控的。

```python
while True: # 通信循环
    try:# 应对windows系统
        # 如果再linux上的话客户端断掉并不会干掉server
        # server会一直收空，然后发也是空
        # 陷入死循环
        data = conn.recv(1024)  # 收消息
        if not data: break # 应对linux系统
        print('客户端发过来的消息',data)
        conn.send(data.upper())
    except Exception:
        print('链接已被关闭')
        break

conn.close()
```

因此加上一个try except，异常类型是用万能异常来捕捉。这样在windows上就没问题了，但是再linux上有问题，linux的server端程序并不会崩掉，而是recv会无限次数的接收空值，相当于一个死循环，为了避免这个问题，因此我们可以加一个判断，如果接收的是空的那么就跳出通信循环的逻辑。

但是跳出是可以正常跳出了，但是此时server端的还是正常的结束掉了，这依然不符合要求，因此在通讯循环的基础上需要套一个链接的循环，你这个客户端关闭了要允许我接收其他客户端的链接：

```python
while True: # 链接循环
    conn,addr = phone.accept()

    print('电话线路',conn)
    print('客户端的手机号',addr)

    while True: # 通信循环
        try:# 应对windows系统
            # 如果再linux上的话客户端断掉并不会干掉server
            # server会一直收空，然后发也是空
            # 陷入死循环
            data = conn.recv(1024)  # 收消息
            if not data: break # 应对linux系统
            print('客户端发过来的消息',data)
            conn.send(data.upper())
        except Exception:
            print('链接已被关闭')
            break

    conn.close()

phone.close()
```

- 当客户端键入空值的时候会被卡住！

***为什么会被卡住，首先说不管是客户端还是服务端，send和receive去实现网络间沟通的原理其实很简单，都是和本地缓存中收发的。***因为不管是send还是receive其实最后都是要通过电脑的网卡进行数据的收发，网卡是硬件是通过操作系统去调用的，其实我们编写的程序无外乎就是调用操作系统，让操作系统去进行数据的收发，我们的send是发给操作系统，receive也是从操作系统的缓存中去取，这是数据的收发。

服务端为了能够对客户端发过来的消息进行持续性的接收，应该设置一个循环，因此通讯部分代码可以加到一个循环里。

```python
while True: # 通信循环
        data = conn.recv(1024)  # 收消息
        if not data: break # 应对linux系统
        print('客户端发过来的消息',data)
        conn.send(data.upper())
```

客户端也是

```python
while True:
    msg = input('>> ')
    phone.send(msg.encode('utf-8'))
    # 如果输入为空的话，服务端会一直在recv这里，不会给客户端send
    # 客户端没收到，在自己系统的缓存里找也找不到就会卡主。
    data = phone.recv(1024)
    # print(data)
# phone.close()
```

那么如果输入空的话就会卡住，为什么会卡住？因为服务端本身会一直卡在recv的阶段目的就是为了随时接受客户端的消息，客户端发了一个空，服务端啥也没收到也就不会返回任何值，于是客户端就永远的卡在了recv这个步骤。为了避免这个问题其实加一个判断就可以了，修改如下：

```python
while True:
    msg = input('>> ')
    if not msg:continue
    phone.send(msg.encode('utf-8'))
    # 如果输入为空的话，服务端会一直在recv这里，不会给客户端send
    # 客户端没收到，在自己系统的缓存里找也找不到就会卡主。
    data = phone.recv(1024)
    print(data)
# phone.close()
```

### 使用socket模拟ssh

server端：

```python
#!/usr/bin/python3.6
print('=====模拟ssh小程序=====')
import socket 
import subprocess

# to make a new socket obj
new_ssh = socket.socket(socket.AF_INET,socket.SOCK_STREAM)
new_ssh.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

# Bind Addr&Port
# new_ssh.setsockopt(socket.SOL_SOCKET)
new_ssh.bind(('23.110.64.224',8888))

# start the socket
new_ssh.listen(10)

# start to listen
while True:
    conn,addr = new_ssh.accept()
    print('当前客户端地址为',addr)
    while True:
        try:
            data = conn.recv(1024)
            if not data: break
            print('客户端输入的命令为：',data.decode('utf-8'))
            s_data = subprocess.Popen(data.decode('utf-8'),
                                      shell=True,
                                      stdout = subprocess.PIPE,
                                      stderr = subprocess.PIPE)
                conn.send(s_data.stdout.read())
                conn.send(s_data.stderr.read())
        except Exception:
            print('当前客户端链接已被关闭')
            break
    conn.close()
new_ssh.close()
```

client

```python
#!/usr/bin/python3.6
# -*- coding: utf-8 -*-
# author:maxiaoyu
import socket
phone = socket.socket(socket.AF_INET,socket.SOCK_STREAM)
phone.connect(('23.110.64.224',8888))

while True:
    msg = input('>> ')
    if not msg:continue
    phone.send(msg.encode('utf-8'))
    # 如果输入为空的话，服务端会一直在recv这里，不会给客户端send
    # 客户端没收到，在自己系统的缓存里找也找不到就会卡主。
    data = phone.recv(1024).decode('utf-8')
    data2 = data.replace('\n', '\r\n')
    print(data2)
# phone.close()
```

### 粘包现象

首先明确一点就是只有tcp会出现粘包现象，udp是不会出现的。

![](http://omk1n04i8.bkt.clouddn.com/17-8-17/42296147.jpg)

首先说为什么只有TCP会出现粘包的现象：

1. 首先tcp是面向流的，可靠地。因此，发送端为了将多个发往接收端的包更有效的发到对方使用了Nagle算法进行优化，将多次间隔较小并且数据量小的数据合并成一个大的数据块然后进行封包，这样，接收端，就难于分辨出来了，必须提供科学的拆包机制。 即面向流的通信是无消息保护边界的，比如下面这个例子:

   ```python
   服务端
   #!/usr/bin/python3.6
   # -*- coding: utf-8 -*-
   # author:maxiaoyu
   import socket

   address = ('127.0.0.1',2333)

   s = socket.socket(socket.AF_INET,socket.SOCK_STREAM)

   s.bind(address)

   s.listen(10)

   conn,addr = s.accept()

   data1 = conn.recv(1024)
   data2 = conn.recv(1024)

   print(data1)
   print(data2)

   客户端：
   #!/usr/bin/python3.6
   # -*- coding: utf-8 -*-
   # author:maxiaoyu
   import socket

   c = socket.socket(socket.AF_INET,socket.SOCK_STREAM)
   address = ('127.0.0.1',2333)
   c.connect(address)

   c.send('Hello World'.encode('utf-8'))
   c.send('hehehehe'.encode('utf-8'))
   ```

   客户端发了两次分别发了一个‘Hello World’和一个'hehehehe'，因为间隔短并且数据量小因此被合并到一起发送了，那么接收的结果其实算作一次的，结果如下：

   ```python
   b'Hello Worldhehehehe'
   b''
   ```

   第二次啥都没有输出，因为客户端的自然结束导致服务端的链接失效也自然程序退出。但是我们想要两次send的内容分别单次输出，因为tcp流式的特点和nagle的算法优化机制把两次的数据给合并了。服务端只是接收到了一股数据流，但是并没有明确的界点去判定哪个是第一段哪个是第二段。所谓粘包问题主要还是因为接收方不知道消息之间的界限，不知道一次性提取多少字节的数据所造成的。这样就可以能造成需要分开传输的小数据一股脑全灌到一条消息里去，一条超过指定接收大小的数据接收不全，积压在本地的缓存中，下次执行其他命令的时候就会把之前的积压的消息一起发过来会造成混淆，比如下面这个例子：

   ```python
   >> ipconfig

   Windows IP 配置
   以太网适配器 以太网:

      媒体状态  . . . . . . . . . . . . : 媒体已断开连接
   中间略……

      连接特定的 DNS 后缀 . . . . . . . : lhwork.net
      本地链接 IPv6 地址. . . . . . . . : fe80::82b:a6f3:b7b2
   >> ls
   :e775%11
      IPv4 地址 . . . . . . . . . . . . : 10.239.63.48
      子网掩码  . . . . . . . . . . . . : 255.255.255.0
      默认网关. . . . . . . . . . . . . : 10.239.63.254

   以太网适配器 蓝牙网络连接:

      媒体状态  . . . . . . . . . . . . : 媒体已断开连接
      连接特定的 DNS 后缀 . . . . . . . : 

   >> ls
   'ls' 不是内部或外部命令，也不是可运行的程序
   或批处理文件。
   ```

   我在上面输入第一个ls的时候就应该报错不是可运行程序了，结果回显的内容是第一条命令ipconfig的剩下没取完的内容，这就是问题的所在。因此，发送方引起的粘包是由TCP协议本身造成的，TCP为提高传输效率，发送方往往要收集到足够多的数据后才发送一个TCP段。若连续几次需要send的数据都很少，通常TCP会根据优化[算法](http://lib.csdn.net/base/datastructure)把这些数据合成一个TCP段后一次发送出去，这样接收方就收到了粘包数据。

   当然粘包现象在客户端和服务端都是有可能出现的，原理一样，比如我服务端接收两次数据，第一次接收1K，第二次接收1024K，那么第一个字节接受了，后面的一堆又都粘在一起了。

2. 那么为什么UDP并不会出现粘包？因为UDP不是基于流的。UDP是无连接的，面向消息的，提供高效率服务。不会使用块的合并优化算法, 由于UDP支持的是一对多的模式，所以接收端的skbuff(套接字缓冲区）采用了链式结构来记录每一个到达的UDP包，在每个UDP包中就有了消息头（消息来源地址，端口等信息），这样，对于接收端来说，就容易进行区分处理了。 **即面向消息的通信是有消息保护边界的。**

3. tcp是基于数据流的，于是收发的消息不能为空，这就需要在客户端和服务端都添加空消息的处理机制，防止程序卡住，而udp是基于数据报的，即便是你输入的是空内容（直接回车），那也不是空消息，udp协议会帮你封装上消息头。udp的recvfrom是阻塞的，一个recvfrom(x)必须对一个一个sendinto(y),收完了x个字节的数据就算完成,若是y>x数据就丢失，这意味着udp根本不会粘包，但是会丢数据，不可靠。tcp的协议数据不会丢，没有收完包，下次接收，会继续上次继续接收，己端总是在收到ack时才会清除缓冲区内容。数据是可靠的，但是会粘包

#### 造成粘包的原因可以归结如下：

- 发送端需要等缓冲区满才发送出去，造成粘包（发送数据时间间隔很短，数据了很小，会合到一起，产生粘包【nagle算法】）
- 接收方不及时接收缓冲区的包，造成多个包接收（客户端发送了一段数据，服务端只收了一小部分，服务端下次再收的时候还是从缓冲区拿上次遗留的数据，产生粘包） 

#### 粘包的处理办法

知道了粘包的产生原因，那么接下来对粘包进行一下处理

##### 1. 比较简单的解决办法

问题的根因就是tcp流式的特点无法界定起始位置，那么我们在发数据之前让接收端直到我要发的数据长度是多长就可以了。

```python
server端：

import socket,subprocess
ip_port=('127.0.0.1',8080)
s=socket.socket(socket.AF_INET,socket.SOCK_STREAM)
s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

s.bind(ip_port)
s.listen(5)

while True:
    conn,addr=s.accept()
    print('客户端',addr)
    while True:
        msg=conn.recv(1024)
        if not msg:break
        res=subprocess.Popen(msg.decode('utf-8'),
                             shell=True,
                             stdin=subprocess.PIPE,
                             stderr=subprocess.PIPE,
                             stdout=subprocess.PIPE)
        err=res.stderr.read()
        if err:
            ret=err
        else:
            ret=res.stdout.read()
        data_length=len(ret)
        conn.send(str(data_length).encode('utf-8'))
        data=conn.recv(1024).decode('utf-8')
        if data == 'recv_ready':
            conn.sendall(ret)
    conn.close()
    

client端

import socket,time
s=socket.socket(socket.AF_INET,socket.SOCK_STREAM)
res=s.connect_ex(('127.0.0.1',8080))

while True:
    msg=input('>>: ').strip()
    if len(msg) == 0:continue
    if msg == 'quit':break

    s.send(msg.encode('utf-8'))
    length=int(s.recv(1024).decode('utf-8'))
    s.send('recv_ready'.encode('utf-8'))
    send_size=0
    recv_size=0
    data=b''
    while recv_size < length:
        data+=s.recv(1024)
        recv_size+=len(data)


    print(data.decode('utf-8'))
```

##### 2.  通过封装包头解决粘包问题

包头应该有什么？

- 固定长度
- 对将要发送数据的描述信息


这里用到了一个新的struct模块，我们可以用struct的方法把一段字符打包成固定长度的二进制数据。优化后的程序如下：

###### 服务端

```python
#!/usr/bin/python3.6
print('=====模拟ssh小程序=====')
import socket
import subprocess
import struct

# to make a new socket obj
new_ssh = socket.socket(socket.AF_INET,socket.SOCK_STREAM)
new_ssh.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

# Bind Addr&Port
# new_ssh.setsockopt(socket.SOL_SOCKET)
new_ssh.bind(('127.0.0.1',8888))

# start the socket
new_ssh.listen(10)

# start to listen
while True:
    conn,addr = new_ssh.accept()
    print('当前客户端地址为',addr)
    while True:
        try:
            data = conn.recv(1024)
            if not data: break
            print('客户端输入的命令为：',data.decode('utf-8'))
            s_data = subprocess.Popen(data.decode('utf-8'),
                                      shell=True,
                                      stdout = subprocess.PIPE,
                                      stderr = subprocess.PIPE)
            # 首先从管道里把标准输出和标准错误输出取出来
            out_res = s_data.stdout.read()
            err_res = s_data.stdout.read()
            # 数据的长度是二者之和
            data_size = len(out_res) + len(err_res)

            # 发送报头，把数据长度封装为固定长度为4字节的报头
            conn.send(struct.pack('i',data_size))
            # 发送数据部分
            conn.send(out_res)
            conn.send(err_res)
        except Exception:
            print('当前客户端链接已被关闭')
            break
    conn.close()
# new_ssh.close()
```

###### 客户端

```python
#!/usr/bin/python3.6
# -*- coding: utf-8 -*-
# author:maxiaoyu
import socket
import struct
phone = socket.socket(socket.AF_INET,socket.SOCK_STREAM)
phone.connect(('127.0.0.1',8888))

while True:
    msg = input('>> ')
    if not msg:continue
    phone.send(msg.encode('utf-8'))
    # 接收报文头，大小是我们定义好的4个字节。
    head = phone.recv(4)
    # struct.unpack解包，用data_size接收解包后的长度信息
    data_size = struct.unpack('i',head)[0]

    # 收数据，首先定义接收了多少和接收的数据都是空。
    recv_size = 0
    recv_data = b''
    # 当接收的大小比传过来的大小小的时候那么就持续接收
    while recv_size < data_size:
        # 当然最大接收1024，但是不一定就是1024，可以比1024小
        data = phone.recv(1024)
        # 因为可以比1024小，因此size不能直接加1024，而是要加data的长度
        recv_size += len(data)
        recv_data += data
    # 全部循环完了以后然后再打印数据即可呢
    print(recv_data.decode('gbk'))
# phone.close()
```

当然使用这种方法一般来说是没有问题的，但是struct.pack中的format类型是有大小限制的，我们不能保证后面的data_size是多少。比如i（int）整形可以表示的最大data_size为 `-2147483648 <= number <= 2147483647`也就是2的32次幂对半劈，中间有一个0所以右侧是2147483647.但是这个数据能表示的毕竟是有限的，当上传文件的时候几个G甚至是几个T都是有可能的。

##### 3. 自定制json报头解决问题

之前说到的报头一个是要带着数据的长度，再有一个数据的描述信息，文件大小，文件名，文件哈希值等等，而且直接自定义报头的话可以传输的文件大小是有限制的，我们可以使用一个字典来尝试去解决。

```python
>>> head_len = {'filename':'a.txt','hash':None,'data_size':1231231231231313131231123131323}
>>> head_bytes = json.dumps(head_len).encode('utf-8')
>>> len(head_bytes)
81
>>> head = struct.pack('i',len(head_bytes))
>>> head
b'Q\x00\x00\x00'
```

上面这个字典所代表的data_size已经很大了，要远大于自定义报头的方式，修改后的代码如下：

```python
#!/usr/bin/python3.6
print('=====模拟ssh小程序=====')
import socket
import subprocess
import struct
import json

# to make a new socket obj
new_ssh = socket.socket(socket.AF_INET,socket.SOCK_STREAM)
new_ssh.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

# Bind Addr&Port
# new_ssh.setsockopt(socket.SOL_SOCKET)
new_ssh.bind(('127.0.0.1',8888))

# start the socket
new_ssh.listen(10)

# start to listen
while True:
    conn,addr = new_ssh.accept()
    print('当前客户端地址为',addr)
    while True:
        try:
            data = conn.recv(1024)
            if not data: break
            print('客户端输入的命令为：',data.decode('utf-8'))
            s_data = subprocess.Popen(data.decode('utf-8'),
                                      shell=True,
                                      stdout = subprocess.PIPE,
                                      stderr = subprocess.PIPE)
            out_res = s_data.stdout.read()
            err_res = s_data.stderr.read()
            # 首先算出数据大小
            data_size = len(out_res) + len(err_res)
            # 用一个字典来存储文件头大小和描述信息，我们可以任意的添加key
            head_dic = {'data_size':data_size}
            # 要传输的内容是字节码，先用json序列化成字典形式的字符串，然后encode成字节码
            head_bytes = json.dumps(head_dic).encode('utf-8')

            # 1、发送报头的长度，先用struct打包一下，将这个报头的长度压缩成4个字节
            conn.send(struct.pack('i',len(head_bytes)))
            # 2、发送报头
            conn.send(head_bytes)
            # 3、发送数据部分
            conn.send(out_res)
            conn.send(err_res)
        except Exception:
            print('当前客户端链接已被关闭')
            break
    conn.close()
# new_ssh.close()
```

客户端的：

```python
#!/usr/bin/python3.6
# -*- coding: utf-8 -*-
# author:maxiaoyu
import socket
import struct
import json
phone = socket.socket(socket.AF_INET,socket.SOCK_STREAM)
phone.connect(('127.0.0.1',8888))

while True:
    msg = input('>> ')
    if not msg:continue
    phone.send(msg.encode('utf-8'))
    
    # 接收报头长度
    head_struct = phone.recv(4)
    # 接收到的内容是一个元组，我们取第一个，这里取到的值是包头实际的大小
    head_len = struct.unpack('i',head_struct)[0]

    # 接收报文头，我知道报头多大了我就接收一下报头
    head_bytes = phone.recv(head_len)
    # 接收到的内容是字节码，先解码转换成json格式的字符串
    head_json = head_bytes.decode('utf-8')
    # 把json字符串还原成字典
    head_dic = json.loads(head_json)
    # 取到字典中的data_size的key获取到真实的数据内容的大小。
    data_size = head_dic['data_size']


    # 收数据
    recv_size = 0
    recv_data = b''
    while recv_size < data_size:
        data = phone.recv(1024)
        recv_size += len(data)
        recv_data += data

    print(recv_data.decode('gbk'))

# phone.close()
```





