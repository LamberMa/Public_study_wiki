# itertools

> 高效的创建和使用迭代器的一个函数

### chain

将多个序列合并为一个序列返回

```python
import itertools
for each in itertools.chain('i', [1,'test',3], 'python'):
    print(each)
```

result:

```python
i
1
test
3
p
y
t
h
o
n
```

## 排列组合

在说下面的方法之前先提一下排列组合

- 排列：就是指从给定个数的元素中取出指定个数的元素进行排序
- 组合：从给定个数的元素中仅仅取出指定个数的元素，不考虑排序。

### 排列

比如从3个元素里挑出来两个进行排序，就比如123，那么可能的结果就是12,13,21,23,31,32也就是6种，其结果就相当于：

![](http://omk1n04i8.bkt.clouddn.com/17-10-11/48205857.jpg)

从n个元素中挑出m个，那么有几种排列方法。

### 组合

组合是指的从给定的元素中取出指定个数的元素看有多少种组合，比如从红黄白黑四色球中任意取出两种有几种组合？这白黑和黑白其实是一种，这就是和排列不一样的地方，它并不考虑顺序的。

那么结果很简单，就是6种，计算方法如下：

![](http://omk1n04i8.bkt.clouddn.com/17-10-12/74794348.jpg)

组合计算公式如下：

![](http://omk1n04i8.bkt.clouddn.com/17-10-12/42428374.jpg)

接下来看itertools针对于排列组合的方法

- itertools.combinations(iterable,r)

  ```python
  import itertools
  for each in itertools.combinations('abc', 2):
      print(each)
      
  结果：
  ('a', 'b')
  ('a', 'c')
  ('b', 'c')

  说明：返回可迭代对象中指定长度的组合
  ```

- itertools.combinations_with_replacement(iterable,r)

  ```python
  import itertools
  for each in itertools.combinations_with_replacement('abc', 2):
      print(each)
      
  结果：
  ('a', 'a')
  ('a', 'b')
  ('a', 'c')
  ('b', 'b')
  ('b', 'c')
  ('c', 'c')

  说明：在组合的基础上允许单个元素的重复
  ```

- ​

