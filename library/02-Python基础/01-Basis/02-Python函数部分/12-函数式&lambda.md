# 函数是编程和Lambda

## 函数式编程

> 尽管Python算不上一门纯函数式编程语言，但是它本身提供了很多函数式编程的特性，像map、reduce、filter、sorted这些函数都支持函数作为参数，lambda函数就可以直接应用在函数式编程中。像map，reduce这种可以接受一个函数作为参数的函数，称之为高阶函数。

- 
- 精简
- 不修改状态
- 模仿数学里的函数式去写的





## Lambda

先来看一个函数：

```python
#普通函数
def func(a):
    return a+1
print 'test1_func0:',func(1000)
```

如果使用lambda的话可以改成另外一种书写方式：

```python
#lambda表达式 
func0 = lambda a:a+1
print 'test2_func0:',func0(1000)
```

上面这种方法，都实现了将1000+1的结果打印出来这个功能，lambda存在意义就是对简单函数的简洁表示。如果你不想在程序中对函数使用两次，那么同样也可以使用lambda，在使用的时候我们并不会将lambda复制一个变量，而是直接进行使用，因此lambda也可以称之为匿名函数；lambda表达式形式如下：

```python
lambda 参数:操作(参数)
```

lambda的一些应用

```python
# 列表排序
a = [(1, 2), (4, 1), (9, 10), (13, -3)]
a.sort(key=lambda x: x[1])

print(a)
# Output: [(13, -3), (4, 1), (1, 2), (9, 10)]

# 列表并行排序
data = zip(list1, list2)
data = sorted(data)
list1, list2 = map(lambda t: list(t), zip(*data))
```

## map

> 我们使用map函数将会对列表中的所有元素进行操作。map有两个参数（函数，列表），它会在内部遍历列表中的每一个元素，执行传递过来的函数参数。在输出到新列表中。

```python
li = [11, 22, 33]
new_list = map(lambda a: a + 100, li)
输出：[111, 122, 133]
```

当然，map还可以完成多个数组的相加：

```python
li = [11, 22, 33]
sl = [1, 2, 3]
new_list = map(lambda a, b: a + b, li, sl)
输出：在python3中，new_list是一个可迭代的对象，我们可以通过循环取值。
虽然上面貌似意义对应上了，但是假如li是两个元素，sl还是[1,2,3]那么最后只会循环出12和24
```

### reduce

>  reduce函数，对于序列内所有元素进行累计操作：

```python
from functools import reduce
lst = [11,22,33]
func2 = reduce(lambda arg1,arg2:arg1+arg2,lst)
print 'func2:',func2
输出：func2: 66
```

### filter

> filter函数，他可以根据条件对数据进行过滤：

```python
li = [11, 22, 33]
new_list = filter(lambda arg: arg > 22, li)
print new_list
输出：[33]
```

