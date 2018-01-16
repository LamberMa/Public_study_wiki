# \_\_class\_\_

获取已知对象的类：对象.\_\_class\_\_

```python
>>> a = 'hahaha'
>>> a.__class__
<type 'str'>
>>> b = 1
>>> b.__class__
<type 'int'>
>>> c = [1,2,3]
>>> c.__class__
<type 'list'>
>>> d = {1,2,3}
>>> d.__class__
<type 'set'>
>>> e = 1.2
>>> e.__class__
<type 'float'>
>>> f = {'name':'lamber'}
>>> f.__class__
<type 'dict'>
```

那么类的类又是什么呢？

```
>>> f.__class__.__class__
<type 'type'>
```

其实就是type。


