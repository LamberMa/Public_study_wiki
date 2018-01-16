### Random模块

随机模块

```
>>> import random
>>> random.random
<built-in method random of Random object at 0x1ef7930>
>>> random.random()
0.9400308284872474
>>> random.random()
0.05308019119344831
>>> random.random()
0.8372423057785096
```

直接调用random模块的random方法返回的是一个介于0~1之间的浮点数，不会取到0也不会取到1.

```
>>> random.randint(1,100)  # 取一个整数，但是要给一个范围，范围的两头都能取到
52
>>> random.randrange(1,100) # 取一个整数，给一个范围，能取到左边的头，取不到右边的
42
>>> random.randrange(1,100,4) # randrange还可以指定步长。在第三个参数的位置
57
>>> random.choice(range(1,10)) # 从一个序列元素中随机取出一个元素(list tuple str)
8
>>> random.sample([1,2,3,4,5,6,7,8],3)
[8, 3, 2]
# sample指的是从一个序列中取出指定长度的片段，比如我这里是取3个，就是随机挑3个。
>>> random.uniform(1,3) # 生成指定范围内的浮点数
2.6525310648742746
>>> a = [1,2,3,4,5,6,7,8,9,10]
>>> random.shuffle(a)
>>> a
[3, 5, 7, 1, 2, 8, 9, 4, 10, 6]
# 将一个序列的内容打乱，这个是会影响到原序列的。
```

##### 模拟验证码的练习

```
import random

def get_random():
    rst = []
    for i in range(5):
        rnum = str(random.randint(0,9)) # 一个随机数组
        ralp = chr(random.randint(65,90)) # 一个随机大写字母
        rst2 = random.choice([rnum,ralp]) # 从数字和字母里随机选一个。
        rst.append(rst2)
    return ''.join(rst)

yanzhengma = get_random()
print(yanzhengma)
```