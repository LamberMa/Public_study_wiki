# SocketServer

## SocketServer实现并发

### SockerServer源码分析

基于tcp的套接字，关键就是两个循环，一个链接循环，一个通信循环

socketserver模块中分两大类：server类（解决链接问题）和request类（解决通信问题）

#### Server类

![](http://omk1n04i8.bkt.clouddn.com/17-8-21/42116814.jpg)

#### request 类

![](http://omk1n04i8.bkt.clouddn.com/17-8-21/48099336.jpg)

#### 继承关系

![](http://omk1n04i8.bkt.clouddn.com/17-8-21/22563251.jpg)

![](http://omk1n04i8.bkt.clouddn.com/17-8-21/44908269.jpg)

![](http://omk1n04i8.bkt.clouddn.com/17-8-21/82065533.jpg)

```

                             +------------+
                             | BaseServer |
                             +------------+
                                   |
                                   v
                             +-----------+        +------------------+
                             | TCPServer |------->| UnixStreamServer |
                             +-----------+        +------------------+
                                   |
                                   v
                             +-----------+        +--------------------+
                             | UDPServer |------->| UnixDatagramServer |
                             +-----------+        +--------------------+
```

服务端改为支持并发：

```python
#!/usr/bin/python3.6
# -*- coding: utf-8 -*-
# author:maxiaoyu
import socketserver


class FtpServer(socketserver.BaseRequestHandler):
    def handle(self):
        print(self)
        print(self.request)
        while True:
            data = self.request.recv(1024)
            self.request.send(data.upper())


if __name__ == '__main__':
    obj = socketserver.ThreadingTCPServer(('127.0.0.1',8080),FtpServer)
    obj.serve_forever() # 链接循环
```

以下述代码为例，分析socketserver源码：

```python
obj = socketserver.ThreadingTCPServer(('127.0.0.1',8080),FtpServer)
obj.serve_forever()
```

查找属性的顺序：ThreadingTCPServer->ThreadingMixIn->TCPServer->BaseServer

1. 实例化得到obj，那么我们实例化必将触发初始化函数`__init__`的运行，那么看一下ThreadingTCPServer都干了啥。

   ```python
   class ThreadingTCPServer(ThreadingMixIn, TCPServer): pass
   ```

   可以发现这个类就是继承了一个ThreadingMixIN和一个TCPServer，然后啥都没干，他其实就是作为一个桥梁的作用把两个父类给架起来来了，通过这个类实例化得到的对象可以调用两个父类的方法

2. 经过查找ThreadingMixIn类里也没有构造方法，那么再去找父类，找到TCPServer中是有构造方法的：

   ```python
   class TCPServer(BaseServer):

       # 定义地址集，这里定义成一个属性
       address_family = socket.AF_INET
       # 定义socket类型，默认基于流式的就是TCP
       socket_type = socket.SOCK_STREAM
       # listen的个数，同时允许有几个等待的队列里面。
       request_queue_size = 5
       # 是否允许地址的重用
       allow_reuse_address = False

       def __init__(self, server_address, RequestHandlerClass, bind_and_activate=True):
           """Constructor.  May be extended, do not override."""
           BaseServer.__init__(self, server_address, RequestHandlerClass)
           self.socket = socket.socket(self.address_family,
                                       self.socket_type)
           if bind_and_activate:
               try:
                   self.server_bind()
                   self.server_activate()
               except:
                   self.server_close()
                   raise
   ```

   这个其实就是我们之前构造一个socket的过程，只不过现在以面向对象的形式体现了。在构造方法里还调用了基类的构造方法，其中基类的构造方法如下：

   ```python
    def __init__(self, server_address, RequestHandlerClass):
        """Constructor.  May be extended, do not override."""
        self.server_address = server_address
        self.RequestHandlerClass = RequestHandlerClass
        self.__is_shut_down = threading.Event()
        self.__shutdown_request = False
   ```

   那么根据基类的构造方法，对象肯定是有server_address和RequestHandlerClass的属性的，基类的init方法仅仅是做了一个赋值的操作。RequestHandlerClass就是我们之前写到的FtpServer类。

   `self.socket`就是对象构造的的socket对象，和之前一样，给socket.socket传一个地址集的参数，一个socket类型的参数。如果`bind_and_activate`激活的话那么就执行server_bind方法和server_activate的方法。

3. 按照继承关系在TCPServer类中找到了server_bind和server_activate的方法如下：

   ```python
   def server_bind(self):

       if self.allow_reuse_address:
           self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
       self.socket.bind(self.server_address)
       self.server_address = self.socket.getsockname()

   def server_activate(self):

       self.socket.listen(self.request_queue_size)
   ```

   其实就是执行了我们bind的过程。activate函数就是之前讲到的手机开机，设置listen方法的监听个数。

4. 我们说每一个服务员要进行循环的利用，不是一次性的，以你我们调用了`obj.serverforever`这样一个方法。这个循环方法是在BaseServer下定义的，源代码如下：

   ```python
   def serve_forever(self, poll_interval=0.5):

       self.__is_shut_down.clear()
       try:
           with _ServerSelector() as selector:
               selector.register(self, selectors.EVENT_READ)

               while not self.__shutdown_request:
                   ready = selector.select(poll_interval)
                   if ready:
                       self._handle_request_noblock()

                   self.service_actions()
       finally:
           self.__shutdown_request = False
           self.__is_shut_down.set()
   ```

   在while循环中调用了一个`_handle_request_noblock()`的方法，那么这个方法做了什么？这个方法也是在BaseServer中的，代码如下：

   ```python
   def _handle_request_noblock(self):
     
       try:
           # request其实就是conn这条连接，client_address就是客户端的地址。
           request, client_address = self.get_request()
       except OSError:
           return
       if self.verify_request(request, client_address):
           try:
               self.process_request(request, client_address)
           except Exception:
               self.handle_error(request, client_address)
               self.shutdown_request(request)
           except:
               self.shutdown_request(request)
               raise
       else:
           self.shutdown_request(request)
   ```

   在如上的这个函数中，对象调用了一个get_request的方法，看一下get_request方法：

   ```
   def get_request(self):

       return self.socket.accept()
   ```

   函数很简单就是调用了socket的accept的方法，其实就是开始请求了。那么上面的内容也就好理解了，`request,client_address = self.get_request`。其中request就是conn，client_address就是客户端的地址。然后对象调用了process_request方法将连接request和客户端的地址传给了这个函数，看一下这个方法写的啥：

   ```python
   def process_request_thread(self, request, client_address):

       try:
           self.finish_request(request, client_address)
       except Exception:
           self.handle_error(request, client_address)
       finally:
               self.shutdown_request(request)
   def process_request(self, request, client_address):
       """Start a new thread to process the request."""
       t = threading.Thread(target = self.process_request_thread,
                            args = (request, client_address))
       t.daemon = self.daemon_threads
       t.start()
   ```

   上述操作就是开启了多线程应对并发，开一个线程就执行一次这个函数。target指向一个函数为process_request_thread，这个函数在源码中就在process_request的正上方。这个目标函数执行了finish_request函数，来看一下finsh_requst写的啥，这个函数是在BaseServer里写到的。

   ```python
   def finish_request(self, request, client_address):
       """Finish one request by instantiating RequestHandlerClass."""
       self.RequestHandlerClass(request, client_address, self)
   ```

   这个函数其实就是调用了RequestHandlerClass其实这个就是我们写的那个FtpServer的那个类，我们把客户端的信息传递给了我们自己定义的类。传递了一个连接，一个客户端地址，一个obj对象本身，那么其实操作一顿绕了一圈最终就是用我们创建的Ftpserver来实例化了对象。相当于`FtpServer(request,client_address,self)`这个样子。那么实例化就要找FtpServer下的构造方法，但是我们没写，那么就要找他的父类的构造方法了。源代码如下：

   ```
   class BaseRequestHandler:

       def __init__(self, request, client_address, server):
           self.request = request
           self.client_address = client_address
           # 这个server就是obj本身
           self.server = server
           self.setup()
           try:
               self.handle()
           finally:
               self.finish()
   ```

   这个FtpServer的对象调用了一个handle方法，但是这个handle我们看到的是pass，因此在一开始定义类的时候我们一定要写一个handle的方法

#### 源码分析总结：

基于tcp的socketserver我们自己定义的类中的

1. 　　self.server即套接字对象
2. 　　self.request即一个链接
3. 　　self.client_address即客户端地址

基于udp的socketserver我们自己定义的类中的

1. 　　self.request是一个元组（第一个元素是客户端发来的数据，第二部分是服务端的udp套接字对象），如(b'adsf', <socket.socket fd=200, family=AddressFamily.AF_INET, type=SocketKind.SOCK_DGRAM, proto=0, laddr=('127.0.0.1', 8080)>)
2. 　　self.client_address即客户端地址