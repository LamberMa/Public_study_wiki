# 线程Queue

>Queue is especially useful in threaded programming when information must be exchanged safely between multiple threads.

#### queue列队的三种模式及构造函数

1、先进先出模式 （谁先进去，谁先出来）   ---->class queue.Queue(maxsize)

2、先进后出模式  （先进去的，最后出来）  ---->class queue.LifoQueue(maxsize)

3、优先级模式    （优先级越低，先出来）   ---->class queue.PriorityQueue(maxsize)

Queue是线程安全的，同时只有一个线程去取数据，能够保证数据的安全。

```python
创建一个“队列”对象

import Queue
q = Queue.Queue(maxsize = 10)
# Queue.Queue类即是一个队列的同步实现。队列长度可为无限或者有限。可通过Queue的构造函数的可选参数.maxsize来设定队列长度。如果maxsize小于1就表示队列长度无限。

将一个值放入队列中
q.put(10)
# 调用队列对象的put()方法在队尾插入一个项目。put()有两个参数，第一个item为必需的，为插入项目的值；第二个block为可选参数，默认为1。如果队列当前为空且block为1，put()方法就使调用线程暂停,直到空出一个数据单元。如果block为0，put方法将引发Full异常，告诉你队列空了，不能取了。

将一个值从队列中取出
q.get()
# 调用队列对象的get()方法从队头删除并返回一个项目。可选参数为block，默认为True。如果队列为空且block为True，get()就使调用线程暂停，直至有项目可用。如果队列为空且block为False，队列将引发Empty异常。
```

### 先进先出

![](http://omk1n04i8.bkt.clouddn.com/17-9-14/90869551.jpg)

#### 示例1

```python
#先进先出 （原则：谁先进去，谁就先出来）
import queue  #线程 队列

q=queue.Queue() #先进先出
q.put(12)
q.put("hello")
q.put({"name":"yuan"})

while 1:
    data=q.get()
    print(data)
    print("-----------")
```

执行结果：

```python
12            #他是第1个进去的，所以他先出来
-----------
hello
-----------
{'name': 'yuan'}
-----------
```

#### 示例2

```python
import queue  #队列，解决多线程问题  （注意：python2.7 Queue的首字母是大写的）


# q=queue.Queue(3) #1、设置3就是满了，默认（FIFO 先进先出 ） #先进后出（手枪弹夹，后压进去的，先出来）
q=queue.Queue()  
q.put(12)  
q.put("hello")
q.put({"name":"yuan"})

q.put(34)
# q.put(34,False) #2、blook=True,如果改成Flase,提示你满了，会报错，但不会卡在这里，如果为True就会卡住，等你get走了我再塞进去。


while 1:
    data=q.get()  #1、会卡着，等值进来
    # data=q.get(block=False)  #3、队列为空
    print(data)
    print("-----------")
```

### 先进后出

![](http://omk1n04i8.bkt.clouddn.com/17-9-14/96633032.jpg)

```python
#先进后出
import queue

q=queue.LifoQueue()  #先进后出

q.put(12)
q.put("hello")
q.put({"name":"yuan"})

while 1:
    data=q.get()  #卡着，等值进来，
    print(data)
    print("-----------")
```

结果：

```python
{'name': 'yuan'}
-----------
hello
-----------
12
-----------
```

### 基于优先级的

```python
#优先级
import queue

q=queue.PriorityQueue()  #优先级

q.put([3,12])
q.put([2,"hello"])  #2先出来，按优化级  级别是：2--->3--->4 从级到高
q.put([4,{"name":"yuan"}])

while 1:
    data=q.get() # 都取出来以后卡在这里
    print(data[1])
    print("-----------------------")
```

根据规则，优先级越低越先出来，所以结果如下：

```python
hello
-----------------------
12
-----------------------
{'name': 'yuan'}
-----------------------
```

## join与task_done方法

```python
join() 阻塞进程，直到所有任务完成，需要配合另一个方法task_done。

    def join(self):
        with self.all_tasks_done:
            while self.unfinished_tasks:
                self.all_tasks_done.wait()

task_done() 表示某个任务完成。每一条get语句后需要一条task_done。如果队列没取完，也会卡住


import queue
q = queue.Queue(5)
q.put(10)
q.put(20)
print(q.get())
q.task_done()
print(q.get())
q.task_done()

q.join()

print("ending!")

此包中的常用方法(q = Queue.Queue()):

q.qsize()  返回队列的大小
q.empty()  如果队列为空，返回True,反之False
q.full()   如果队列满了，返回True,反之False
q.full 与 maxsize 大小对应
q.get([block[, timeout]])  获取队列，timeout等待时间
q.get_nowait()      相当q.get(False)
非阻塞 q.put(item)   写入队列，timeout等待时间
q.put_nowait(item)  相当q.put(item, False)
q.task_done()  在完成一项工作之后，q.task_done() 函数向任务已经完成的队列发送一个信号
q.join()       实际上意味着等到队列为空，再执行别的操作
```

