### Pickle模块

pickle模块也是序列化模块，相比较json模块，这个可以作为了解的内容。pickle模块主要用于python程序之间数据交互，但是pickle可以序列化任意类型。

```
import datetime

print(datetime.datetime.now())

结果：
2017-07-31 09:32:37.338636
```

对于这样的date数据，如果使用json的模块是没办法对这种“时间格式”进行操作的。因此在这里json存在一定的局限性。因此这里可以使用pickle模块，转化后的内容都是bytes的。

```
import pickle
import datetime

t = datetime.datetime.now()
d = pickle.dumps(t)
print(d)
print(type(d))

结果：
b'\x80\x03cdatetime\ndatetime\nq\x00C\n\x07\xe1\x07\x1f\t&7\x07x\x13q\x01\x85q\x02Rq\x03.'
<class 'bytes'>
```

因此在写入的时候不要忘了mode里面添加上b的选项：

```
import pickle
import datetime

t = datetime.datetime.now()
d = pickle.dumps(t)

f = open('b.txt',mode='wb')
f.write(d)
f.close()
```

读取的时候也要加上b选项：

```
f = open('b.txt',"rb")
date = pickle.loads(f.read())
print(date)
```

不仅如此，pickle还可以序列化类，函数等等。因此python之间交互用pickle是最好的。不过以后pickle用的还是相对来说较少的。

