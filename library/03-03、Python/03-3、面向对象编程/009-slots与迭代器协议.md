
```
class Foo:
    def __init__(self,name):
        self.name = name
    def __getitem__(self, item):
        return self.__dict__[item]
    def __setitem__(self, key, value):
        self.__dict__[key] = value
    def __delitem__(self, key):
        self.__dict__.pop(key)
f = Foo('lamber')
print(f.name)
f['age'] = 25
print(f.__dict__)
del f['age']
print(f.__dict__)
print(f['name'])

结果：
lamber
{'name': 'lamber', 'age': 25}
{'name': 'lamber'}
lamber
```

其实`__getitem__ __setitem__ __delitem__`的方法就是以字典的形式进行添加，查询，删除对象中的属性。因此也就是对应不同的操作值的形式调用的get，set，del方法不同。要进行区分。

## slots

- \_\_slots\_\_是什么:是一个类变量,变量值可以是列表,元祖,或者可迭代对象,也可以是一个字符串(意味着所有实例只有一个数据属性)
- 引子:使用点来访问属性本质就是在访问类或者对象的\_\_dict\_\_属性字典(类的字典是共享的,而每个实例的是独立的)
- 为何使用\_\_slots\_\_:字典会占用大量内存,如果你有一个属性很少的类,但是有很多实例,为了节省内存可以使用\_\_slots\_\_取代实例的\_\_dict\_\_。当你定义\_\_slots\_\_后,\_\_slots\_\_就会为实例使用一种更加紧凑的内部表示。实例通过一个很小的固定大小的数组来构建,而不是为每个实例定义一个字典,这跟元组或列表很类似。在\_\_slots\_\_中列出的属性名在内部被映射到这个数组的指定小标上。使用\_\_slots\_\_一个不好的地方就是我们不能再给实例添加新的属性了,只能使用在\_\_slots\_\_中定义的那些属性名。
- 注意事项:\_\_slots\_\_的很多特性都依赖于普通的基于字典的实现。另外,定义了\_\_slots\_\_后的类不再 支持一些普通类特性了,比如多继承。大多数情况下,你应该只在那些经常被使用到 的用作数据结构的类上定义\_\_slots\_\_比如在程序中需要创建某个类的几百万个实例对象 。关于\_\_slots\_\_的一个常见误区是它可以作为一个封装工具来防止用户给实例增加新的属性。尽管使用\_\_slots\_\_可以达到这样的目的,但是这个并不是它的初衷。更多的是用来作为一个内存优化工具。

```
class People:
    __slots__ = ['x']
    # x = 1
    # def __init__(self,name):
    #     self.name = name
    # def run(self):
    #     pass

print(People.__dict__)
p1 = People

结果：
{'__module__': '__main__', '__slots__': ['x'], 'x': <member 'x' of 'People' objects>, '__doc__': None}

p1 = People()
print(p1.__dict__)

结果：
AttributeError: 'People' object has no attribute '__dict__'
```

通过上面的例子可以看出，使用了\_\_slots\_\_方法的类，在实例化的时候，生成的对象并不会创建命名空间，因此也就不会产生`__dict__`这个字典。属性只能设置slots里面定义的属性，非定义的属性会报错。也就是说我们只能设置x属性。

```
p1.x = 1
print(p1.x)

结果：1
```

小结：类里面加`__slots__`方法

- 不会为对象产生命名空间（没有dict），节省空间
- 只允许设置slots里设置的值，因此节省内存的同时限制可以设置的属性。因此可以限制这种类生成的对象具有一致的属性。

slots用来产生固定属性，但是并且需要多个对象的情况下。

## __next\_\_和\_\_iter\_\_实现迭代器协议

```
from collections import Iterator,Iterable
class Foo:
    def __init__(self,start):
        self.start = start
    def __iter__(self):
        return self
    def __next__(self):
        if self.start > 10:
            raise StopIteration
        n = self.start
        self.start+=1
        return n
f = Foo(0)
print(isinstance(f,Iterable))
print(isinstance(f,Iterator))
print(f.__next__())
print(f.__next__())
print(f.__next__())
print(f.__next__())
print(f.__next__())
print(f.__next__())
print(f.__next__())
```

模拟一个range

```
class Range:
    def __init__(self,start,stop):
        self.start = start
        self.stop = stop
    def __iter__(self):
        return self
    def __next__(self):
        if self.start == self.stop:
            raise StopIteration
        n = self.start
        self.start += 1
        return n
for i in Range(0,5):
    print(i)
```

### 析构函数

`__del__`

在对象被销毁的时候就会触发析构函数。因此可以在析构函数里加上self.句柄.close来关闭掉打开的文件。

### 上下文管理协议

```
class Foo:
    def __enter__(self):
        print('enter')
    def __exit__(self, exc_type, exc_val, exc_tb):
        print('exit')
        print('exc_type',exc_type)
        print('exc_val',exc_val)
        print('exc_tb',exc_tb)

with Foo():
    print('with foo的子代码块')
    
结果：
enter
with foo的子代码块
exit
exc_type None
exc_val None
exc_tb None

with Foo(): 就相当于res = Foo().__enter__()
enter的返回值就是with foo() as obj中的obj

当抛出异常的时候

class Foo:
    def __enter__(self):
        print('enter')
    def __exit__(self, exc_type, exc_val, exc_tb):
        print('exit')
        print('exc_type',exc_type)
        print('exc_val',exc_val)
        print('exc_tb',exc_tb)

with Foo() as obj:
    print('with foo的子代码块')
    raise NameError('name undefined')


结果：
C:\Users\马晓雨\AppData\Local\Programs\Python\Python36\python3.exe D:/坚果云同步/Python/Day11/模拟range.py
Traceback (most recent call last):
enter
with foo的子代码块
  File "D:/坚果云同步/Python/Day11/模拟range.py", line 26, in <module>
exit
exc_type <class 'NameError'>
exc_val name undefined
exc_tb <traceback object at 0x000000D5FAB84908>
    raise NameError('name undefined')
NameError: name undefined

一旦抛出异常，后面的代码就不会运行了，也就是意味着with的子代码块运行完了，然后就会触发exit方法。当然如果再exit里面return一个true就不会抛出异常了。

class Open:
    def __init__(self,filepath,mode,encoding='utf-8'):
        self.filepath = filepath
        self.mode = mode
        self.encoding = encoding
        self.f = open(filepath,mode=mode,encoding=encoding)
    def write(self,line):
        self.f.write(line)
    def __getattr__(self,item):
        return getattr(self.f,item)
    def __enter__(self):
        return self
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.f.close()
       #return True

with Open('a.txt','w') as write_file: # write_file = Open('a.txt','w')
    write_file.write('test\n')
```

### \_\_call\_\_

在类中加上call方法以后，那么对象加小括号也可以了，也就是说实例化后的对象加括号也可以变成一个可调用对象。

#### 应用

type叫元类，是用来控制产生类的。

通过type就可以自己去定制类的产生了。

### 自定制元类

