# 函数

> 为什么要定义函数？为了方便更好的维护，便于更好的管理和扩展，同时使用函数可以使代码的组织结构更加清晰，增强可读性，减少代码的冗余，可以进行代码的复用。

## 介绍&定义

python中包含内置函数，比如print就是一个函数：

```
print(print)

结果：
<built-in function print>
```

内置函数是内置到解释器里面的，程序一启动拿过来可以直接用，无需定义。当然除了内置的函数之外我们还可以自定义，因为内置函数的功能是有限的，因此我们需要自定义我们需要的功能。自定义函数的定义：

```python
def 函数名(arg1,arg2,arg3……):
    '''描述信息'''
    函数体
    return              <--用来定义返回值，可以是任意类型，一般有参函数会用到。
    
官方函数参考：
def round(number, ndigits=None): # real signature unknown; restored from __doc__
    """
    round(number[, ndigits]) -> number
    
    Round a number to a given precision in decimal digits (default 0 digits).
    This returns an int when called with one argument, otherwise the
    same type as the number. ndigits may be negative.
    """
    return 0
```

### 函数的调用：

```
函数名()
```

需要记住的一个点是函数要先定义后使用。我们在写函数的时候应该习惯性的去写函数的定义和注释，方便后期的查阅和采集。

```
def say_hello():
    '''this is a test function to print hello on the screen'''
    print(say_hello.__doc__)

say_hello()

结果：
this is a test function to print hello on the screen
```

这个注释我们是可以通过`__doc__`方法取到的。

现在我们定义的这个属于无参函数，无参函数一般都是固定的一串语句，不需要外部参数。定义有参函数如下，有参函数依赖于外部传递来的参数，内置函数有代表性的比如`len()`，如果不传递参数的话会报错。

```python
def bar(x,y):
    print(x)
    print(y)
```

python属于弱类型的语言，因此传参的时候传递的参数也是没有类型限制的，因此我们可以通过在定义函数的时候加上注释来提醒别人。。



### 定义空函数：

```
def kong():
    pass
```

函数体为pass，也就是什么都不干，那么这个函数的功能就是什么也不干，那么这个函数的可以应用于构思过程，比如我要写一个购物车，里面都有什么功能，需要什么函数来完成，但是细节我没必要立即去实现，因此函数体内部就可以使用pass。我现在是一种构思没必要立即去实现功能。虽然程序没有实现，但是程序体系结构立现。有什么思路就去实现什么功能，简单来说就是先把程序的框架搭建起来，然后后续慢慢的丰富具体的内容。

## 函数的返回值

- 可以是任意类型
- 没有return返回是None
- return一个值返回就是对应的值
- return返回多个值返回的就是一个元组

return来返回函数的返回值。

不写return的话默认也会有值返回，只是返回的内容是None：

```python
def a():
    print("hello")
b = a()
print(b)

结果：
hello
None
```

return可以返回多个值，不仅如此return还可以返回多种类型。return多个元素会默认以元组的形式返回，因为python中会默认把用逗号链接的值放到一个元组里面去，那么针对这个问题就涉及到了元组的解压。

### 关于元组的解压：

```python
a,b,c,d,e,f = [1,2,3,4,5,6]

a,_,_,_,_,e = [1,2,3,4,5,6]
print(a)
print(e)

a,*_,e = [1,2,3,4,5,6,7]
print(e)

head,*_ = [1,2,3,4,5]
print(head)
结果：1


*_,tail = [1,2,3,4,5]
print(tail)
结果：5
```

看上面的例子，我们定义a~f六个变量，它会一次去接收这个列表里的值，然后分别赋值给a-f六个变量，如果说两端的数目不匹配会进行报错，如果不想赋值的可以使用"\_"来代替，多个下划线可以使用`*_`的形式来替代，那么对比过来元组和序列也是一样的，本身元组就是不可更改的序列。这种方法同样也适用于集合和字典，只不过字典取的是key，其实就是相当于循环遍历。

那么说这个的目的其实是为了取函数的返回值，如果有多个返回值的时候返回的是一个元组。我们可以通过上面的办法取到返回的这些值。

```
def ret():
    return 1,2,3,4

a,b,c,d = ret()
print(a)
print(d)

head,*_ = ret()
*_,tail = ret()

print(head,tail)
```

Tip：函数只能执行一个return，你可以写多个，但是只执行一次，然后函数就结束掉了。
