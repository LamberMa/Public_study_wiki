# Event

线程的一个关键特性是每个线程都是独立运行且状态不可预测。如果程序中的其他线程需要通过判断某个线程的状态来确定自己下一步的操作,这时线程同步问题就 会变得非常棘手。为了解决这些问题,我们需要使用threading库中的Event对象。 对象包含一个可由**线程**设置的信号标志,它允许线程等待某些事件的发生。在 初始情况下,Event对象中的信号标志被设置为假。如果有线程等待一个Event对象, 而这个Event对象的标志为假,那么这个线程将会被一直阻塞直至该标志为真。一个线程如果将一个Event对象的信号标志设置为真,它将唤醒所有等待这个Event对象的线程。如果一个线程等待一个已经被设置为真的Event对象,那么它将忽略这个事件, 继续执行

```python
event.isSet()：返回event的状态值；
event.wait()：如果 event.isSet()==False将阻塞线程；
event.set()： 设置event的状态值为True，所有阻塞池的线程激活进入就绪状态， 等待操作系统调度；
event.clear()：恢复event的状态值为False。
```

![](http://omk1n04i8.bkt.clouddn.com/17-9-12/55828543.jpg)

可以考虑一种应用场景（仅仅作为说明），例如，我们有多个线程从Redis队列中读取数据来处理，这些线程都要尝试去连接Redis的服务，一般情况下，如果Redis连接不成功，在各个线程的代码中，都会去尝试重新连接。如果我们想要在启动时确保Redis服务正常，才让那些工作线程去连接Redis服务器，那么我们就可以采用threading.Event机制来协调各个工作线程的连接操作：主线程中会去尝试连接Redis服务，如果正常的话，触发事件，各工作线程会尝试连接Redis服务。来看模拟的示例：

```python
#!/usr/bin/python3.6
# -*- coding: utf-8 -*-
# author:maxiaoyu

import threading
import time
import logging

# 定义logging模块的配置
logging.basicConfig(level=logging.DEBUG, format='(%(threadName)-10s) %(message)s',)

def worker(event):
    logging.debug('Waiting for redis ready...')
    event.wait()
    logging.debug('redis ready, and connect to redis server and do some work [%s]', time.ctime())
    time.sleep(1)

def main():
    readis_ready = threading.Event()
    t1 = threading.Thread(target=worker, args=(readis_ready,), name='t1')
    t1.start()

    t2 = threading.Thread(target=worker, args=(readis_ready,), name='t2')
    t2.start()

    logging.debug('first of all, check redis server, make sure it is OK, and then trigger the redis ready event')
    time.sleep(3) # simulate the check progress
    readis_ready.set()

if __name__=="__main__":
    main()
```

先来看看运行结果：

![](http://omk1n04i8.bkt.clouddn.com/17-9-12/2741344.jpg)

**分析：**

我们定义了一个worker函数，这个函数在执行的时候会卡在event.wait()这里，event.wait()会去判断`event.isSet()==False`是否是成立的，因为默认就是False的，因此条件会成立，event.wait也会如期的卡住。

再来看main方法，main方法是我们在运行脚本的时候会默认会执行官的一个方法，我们这main方法里起了两个线程去运行这个worker函数，将redis_ready这个event作为参数传递进去，然后睡3s，此时调用event的set方法，将event设置为True。此时之前卡住的部分就会继续运行下去，可以看到上面的动图，worker在卡了3s后继续运行了。

#### 现在变更一下需求：

threading.Event的wait方法还接受一个超时参数，默认情况下如果事件一直没有发生，wait方法会一直阻塞下去，而加入这个超时参数之后，如果阻塞时间超过这个参数设定的值之后，wait方法会返回。对应于上面的应用场景，如果Redis服务器一致没有启动，我们希望子线程能够打印一些日志来不断地提醒我们当前没有一个可以连接的Redis服务，我们就可以通过设置这个超时参数来达成这样的目的，改一下worker函数：

```python
def worker(event):
    logging.debug('Waiting for redis ready...')
    while not event.isSet():
        event.wait(2)
        logging.debug('redis is not ready,still waiting.......')
    logging.debug('redis ready, and connect to redis server and do some work [%s]', time.ctime())
    time.sleep(1)
```

我们把wait的动作放到一个while循环里，如果说在wait规定的2s内，这个event仍然是false的话那么就向下执行，然而向下执行则是会继续循环执行，就打到了一种不断的打印日志的效果。