# Python中的上下文

> 关于上下文，知乎上有一句通俗易懂的话。每一段程序都有很多外部变量。只有像Add这种简单的函数才是没有外部变量的。一旦你的一段程序有了外部变量，这段程序就不完整，不能独立运行。你为了使他们运行，就要给所有的外部变量一个一个写一些值进去。这些值的集合就叫上下文。
>
> 换种说法，上下文其实就是代码在执行过程中的一个完整性，比如调用数据库打开一个连接，那么从引用进行开启到最后使用完毕进行关闭应该是一个完整的过程。简单来说就是代码块执行前准备，代码块执行后收拾。

## 需求的产生

在正常的管理各种系统资源(文件、锁定和连接)，在涉及到异常时通常是个棘手的问题。异常很可能导致控制流跳过负责释放关键资源的语句。例如打开一个文件进行操作时，如果意外情况发生（磁盘已满、特殊的终端信号让其终止等），就会抛出异常，这样可能最后的文件关闭操作就不会执行。如果这样的问题频繁出现，则可能耗尽系统资源。

是的，这样的问题并不是不可避免。在没有接触到上下文管理器之前，我们可以用`“try/finally”`语句来解决这样的问题。或许在有些人看来，“try/finally”语句显得有些繁琐。上下文管理器就是被设计用来简化“try/finally”语句的，这样可以让程序更加简洁。

## 上下文的使用场景

### 资源的创建和释放场景

上下文管理器的常用于一些资源的操作，需要在资源的获取与释放相关的操作，一个典型的例子就是数据库的连接，查询，关闭处理。先看如下一个例子：

```python
class Database(object):
 
    def __init__(self):
        self.connected = False
 
    def connect(self):
        self.connected = True
 
    def close(self):
        self.connected = False
 
    def query(self):
        if self.connected:
            return 'query data'
        else:
            raise ValueError('DB not connected ')
 
def handle_query():
    db = Database()
    db.connect()
    print 'handle --- ', db.query()
    db.close()
 
def main():
    handle_query()
 
if __name__ == '__main__':
    main()
```

上述的代码很简单，针对`Database`这个数据库类，提供了`connect` `query` 和`close` 三种常见的db交互接口。客户端的代码中，需要查询数据库并处理查询结果。当然这个操作之前，需要连接数据库（db.connect()）和操作之后关闭数据库连接（ db.close()）。上述的代码可以work，可是如果很多地方有类似handle_query的逻辑，连接和关闭这样的代码就得copy很多遍，显然不是一个优雅的设计。

#### 使用with语句进行优化

Python提供了With语句语法，来构建对资源创建与释放的语法糖。给Database添加两个魔法方法：

```python
class Database(object):
 
    ...
 
    def __enter__(self):
        self.connect()
        return self
 
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()
```

然后修改handle_query函数如下：

```python
def handle_query():
    with Database() as db:
        print 'handle ---', db.query()
```

在Database类实例的时候，使用with语句。一切正常work。比起装饰器的版本，虽然多写了一些字符，但是代码可读性变强了。

With 语句仅能工作于支持上下文管理协议(context management protocol)的对象。也就是说只有内建了”上下文管理”的对象才能和 with 一起工作。Python内置了一些支持该协议的对象，如下所列是一个简短列表：

- file
- decimal.Context
- thread.LockType
- threading.Lock
- threading.RLock
- threading.Condition
- threading.Semaphore
- threading.BoundedSemaphore

由以上列表可以看出，file 是已经内置了对上下文管理协议的支持。所以我们可以用下边的方法来操作文件：

```python
with open('/etc/passwd', 'r') as f:
    for eachLine in f:
        # ...do stuff with eachLine or f...
```

上边的代码试图打开一个文件,如果一切正常,把文件对象赋值给 f。然后用迭代器遍历文件中的每一行,当 完成时,关闭文件。无论是在这一段代码的开始,中间,还是结束时发生异常,会执行清理的代码,此 外文件仍会被自动的关闭。





## 上下文管理协议

实现了上下文协议的函数/对象即为上下文管理器。对于迭代器协议是实现了`__iter__`方法。上下文管理协议则是`__enter__`和`__exit__`。比如：

```python
filename = 'my_file.txt'
mode = 'w' # Mode that allows to write to the file
writer = open(filename, mode)

class PypixOpen(object):
    def __init__(self, filename, mode):
        self.filename = filename
        self.mode = mode

    def __enter__(self):
        self.openedFile = open(self.filename, self.mode)
        return self.openedFile

    def __exit__(self, *unused):
        self.openedFile.close()

# Script starts from here

with PypixOpen(filename, mode) as writer:
    writer.write("Hello World from our new Context Manager!")
```

`PypixOpen` 实现了`__enter__`和`__exit__`这两个上下文管理器协议，当PypixOpen调用/实例化的时候，则创建了上下文管理器。类似于实现迭代器协议类调用生成迭代器一样。

- __enter__: 该方法进入运行时上下文环境，并返回自身或另一个与运行时上下文相关的对象。返回值会赋给 as 从句后面的变量，as 从句是可选的。
- __exit__: 该方法退出当前运行时上下文并返回一个布尔值，该布尔值标明了“如果 with_suit 的退出是由异常引发的，该异常是否须要被忽略”。如果 __exit__() 的返回值等于 False，那么这个异常将被重新引发一次；如果 __exit__() 的返回值等于 True，那么这个异常就被无视掉，继续执行后面的代码。

With 语句的实际执行流程是这样的：

```python
with context_expr [as var]:
    with_suite

1. 执行 context_exp 以获取上下文管理器
2. 加载上下文管理器的 __exit__() 方法以备稍后调用
3. 调用上下文管理器的 __enter__() 方法
4. 如果有 as var 从句，则将 __enter__() 方法的返回值赋给 var
5. 执行子代码块 with_suit
6. 调用上下文管理器的 __exit__() 方法，如果 with_suit 的退出是由异常引发的，那么该异常的 type、value 和 traceback 会作为参数传给 __exit__()，否则传三个 None
7. 如果 with_suit 的退出由异常引发，并且 __exit__() 的返回值等于 False，那么这个异常将被重新引发一次；如果 __exit__() 的返回值等于 True，那么这个异常就被无视掉，继续执行后面的代码
```