# 进程对象Process

## Multiprocessing多进程模块

Multiprocessing is a package that supports spawning processes using an API similar to the threading module. The multiprocessing package offers both local and remote concurrency,effectively side-stepping the Global Interpreter Lock by using subprocesses instead of threads. Due to this, the multiprocessing module allows the programmer to fully leverage multiple processors on a given machine. It runs on both Unix and Windows.

由于GIL的存在，python中的多线程其实并不是真正的多线程，如果想要充分地使用多核CPU的资源，在python中大部分情况需要使用多进程。

multiprocessing包是Python中的多进程管理包。与threading.Thread类似，它可以利用multiprocessing.Process对象来创建一个进程。该进程可以运行在Python程序内部编写的函数。该Process对象与Thread对象的用法相同，也有start(), run(), join()的方法。此外multiprocessing包中也有Lock/Event/Semaphore/Condition类 (这些对象可以像多线程那样，通过参数传递给各个进程)，用以同步进程，其用法与threading包中的同名类一致。所以，multiprocessing的很大一部份与threading使用同一套API，只不过换到了多进程的情境。来看下面这个例子：

```python
# Process类调用

from multiprocessing import Process
import time
def f(name):
    # 这个函数的功能就是打印一个字符串睡一秒
    print('hello', name,time.ctime())
    time.sleep(1)

if __name__ == '__main__':
    p_list=[]
    for i in range(3):
        p = Process(target=f, args=('alvin:%s'%i,))
        p_list.append(p)
        p.start()
    for i in p_list:
        i.join()  # 如果不加进程的话主进程会先结束，会先打印end。
    print('end')

# 和Thread使用自定义类的方式去调用
from multiprocessing import Process
import time

class MyProcess(Process):
    def __init__(self):
        super(MyProcess, self).__init__()
        # self.name = name

    def run(self):

        print ('hello', self.name,time.ctime())
        time.sleep(1)


if __name__ == '__main__':
    p_list=[]
    for i in range(3):
        p = MyProcess()
        p.start()
        p_list.append(p)

    for p in p_list:
        p.join()

    print('end')
```

输出结果：

```python
hello alvin:0 Wed Sep 13 14:29:51 2017
hello alvin:1 Wed Sep 13 14:29:51 2017
hello alvin:2 Wed Sep 13 14:29:51 2017
end   # 三行一起输入然后停一秒结束打印end
```

这样就是三个进程一起去执行这个函数，这样的执行是一种并行的结果，不是并发，因为这个是多进程，是可以把任务给多个处理核心一起去处理，真正的实现并行。来看一个例子：

```python
from multiprocessing import Process
import os
import time

def info(name):
    # 定义一个函数打印父进程id和进程id
    print("name:",name)
    print('parent process:', os.getppid())
    print('process id:', os.getpid())
    print("------------------")
    time.sleep(1)


if __name__ == '__main__':

    info('main process line')
    # 开启两个进程运行
    p1 = Process(target=info, args=('alvin',))
    p2 = Process(target=info, args=('egon',))
    p1.start()
    p2.start()

    p1.join()
    p2.join()

    print("ending")
```

运行结果：

```python
name: main process line
parent process: 12252   # pycharm的进程号
process id: 14232       # python.exe的进程号，这才是主进程的进程号
------------------
name: alvin
parent process: 14232
process id: 11100       # python.exe的进程号（相当于开了一个子进程）
------------------
name: egon
parent process: 14232
process id: 16744       # python.exe的进程号（相当于开了一个子进程）
------------------
ending
```

### 多进程的使用方法

**构造方法：**

Process([group [, target [, name [, args [, kwargs]]]]])

- group: 线程组，目前还没有实现，库引用中提示必须是None； 
- target: 要执行的方法； 
- name: 进程名； 
- args/kwargs: 要传入方法的参数。

**实例方法：**

- is_alive()：返回进程是否在运行。
- join([timeout])：阻塞当前上下文环境的进程程，直到调用此方法的进程终止或到达指定的timeout（可选参数）。
- start()：进程准备就绪，等待CPU调度
- run()：strat()调用run方法，如果实例进程时未制定传入target，这star执行t默认run()方法
- terminate()：不管任务是否完成，立即停止工作进程

**属性：**

- daemon：和线程的setDeamon功能一样
- name：进程名字。
- pid：进程号。

