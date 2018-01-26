# Selectors模块

selectors是基于select模块进行封装实现的一个IO多路复用



IO多路复用的实现机制：

- win：select
- linux：select、poll、epoll

select的缺点，

- 每一次调用select都会把用户缓冲区的fd挪到内核缓冲区，这样消耗很大，导致效率下降
- 遍历所有的内核空间的fd，判断是否有数据访问。（最重要的问题）
- 最大连接数（1024），预值。

poll做了什么改进：

- 将最大连接数进行了改进，改为了无限制。

epoll做了什么改进：

- select的拷贝fd的过程在epoll分成了三个函数去完成。创建一个epoll句柄（第一个），将所有的fd拷贝到内核区，但是只需要拷贝一次。
- 回调函数（某一个函数或者某一个动作成功完成之后，会触发的函数）去解决遍历的问题，它为所有的fd绑定一个回调函数，当这个fd发生变动（有数据访问）以后就触发回调函数，把这个fd放到一个链表里去。（交试卷的问题）
- 函数判断链表是否为空
- 最大连接数进行了改进

```python
import selectors
import socket

sel = selectors.DefaultSelector()

def accept(sock, mask):
    conn, addr = sock.accept()  # Should be ready
    print('accepted', conn, 'from', addr)
    conn.setblocking(False)
    sel.register(conn, selectors.EVENT_READ, read)

def read(conn, mask):
    data = conn.recv(1000)  # Should be ready
    if data:
        print('echoing', repr(data), 'to', conn)
        conn.send(data)  # Hope it won't block
    else:
        print('closing', conn)
        sel.unregister(conn)
        conn.close()

sock = socket.socket()
sock.bind(('localhost', 1234))
sock.listen(100)
sock.setblocking(False)
sel.register(sock, selectors.EVENT_READ, accept)

while True:
    events = sel.select()
    for key, mask in events:
        callback = key.data
        callback(key.fileobj, mask)
```

