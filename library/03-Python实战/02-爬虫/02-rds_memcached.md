django的缓存



手动创建一个堆栈

缓存主要应用于页面缓存。

memcached和redis相比：

1. memcached类型单一，只能存储字符串，redis支持五大类型。字符串，hash，list，set，有序集合。
2. 数据持久化，redis要强于memcached，redis支持rdb以及aof两种持久化方式。但是memcached一旦断电就没有了；那么相对来讲持久化也会耗时，但是大多数情况下这种问题可以忽略不计。具体有多大的影响也看具体的应用场景和环境，这个是可控的。

关于memcached和redis的探讨：www.oschina.net/news/26691/memcached-timeout；而且redis只能使用单核，而memcached可以使用多核。

> https://pypi.python.org/pypi/python-memcached
>
> pip install python-memcached

使用：

```python
import memcache
mc = memcache.Client(['192.168.100.1:11211'], debug=True)

In [6]: mc.set("foo", 'bar')
Out[6]: True

In [7]: mc.get('foo')
Out[7]: 'bar'    
```

可以看到memchace.Client后面的链接的主机是一个列表，也就是说这里是可以填写多个地址，那么这个是什么意思，也就是说针对于客户端到底应该连接哪个？

这个目的其实是memcached天生支持集群，可以往多个节点去写，那么这个也存在问题，memcached在写的时候可能存在写不均匀的问题，而且假如其中一个节点挂掉了的话，这个节点保存的数据在其他的节点你是找不到的。

解决如何选择哪一台机器的问题：

不管是取数据还是设置数据，都需要key，memcached的python组件针对这个做了一个计算将key给hash成了一段数字，使用这个数字对机器的总个数取余，根据取余的值拿到值作为索引在机器列表中设置。

```python
import binascii
def cmemcache_hash(key):
    return (
        (((binascii.crc32(key) & 0xffffffff) >> 16) & 0x7fff or 1)
    )
```

即使解决了该用哪个机器的问题但是仍然不能保证数据的存放就一定均匀，因此为了解决这个问题，memcached还提供了一个办法：

```python
mc = memcache.Client([
    ('192.168.100.1:11211', 1),
    ('192.168.100.2:11211', 3),
debug=True])
```

这里的主机列表里还可以支持传入元组，第一个是要链接的主机地址和端口，第二个就是weight权重，写权重为3的意思其实就是相当于：

```python
mc = memcache.Client([
    '192.168.100.1:11211',
    '192.168.100.2:11211',
    '192.168.100.2:11211',
    '192.168.100.2:11211',
], debug=True)
```

一份给复制了三份，一定程度上又将集中的存放给打散了，出现次数越多，取余的时候达到它的可能就越多。

memcached总共的源码一共也就1000行左右，因此可以自己看看这些内容，相对来说简单很多。

```python
mc.set不管存不存在，都给你设置一下
mc.add，添加的时候如果没有的就添加，如果有了的话就报错。
mc.replace 找到某个key给替换成另外一个值
mc.set_multi 可以设置多对，传递一个字典参数就可以了
mc.delete，可以传递一个删除的key，
mc.delete_multi 传递一个可以删除的key的列表
```

