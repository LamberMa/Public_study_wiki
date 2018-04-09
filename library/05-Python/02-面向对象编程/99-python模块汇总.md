
## 模块用法汇总

### Collections模块

### Sys模块

sys模块主要是和解释器打交道的


- sys.argv           命令行参数List，第一个元素是程序本身路径，实现从程序外部向程序传递参数


```
[lamber@maxiaoyu day2]$ cat item.py 
#!/usr/bin/python3.6
import sys

print(sys.argv[0])
print(sys.argv[1])
print(sys.argv[2])
print(sys.argv[3])

[lamber@maxiaoyu day2]$ ./item.py a b c
./item.py
a
b
c
第一个元素就是这个运行的脚本本身，返回程序的本身路径，其他的几个会返回额外传递的参数
这个其实和linux的shell脚本挺像的，可以在执行脚本的时候传递$1,$2……这些。
```


- sys.exit(n)        退出程序，正常退出时exit(0)，参数不为0表示异常退出。
- sys.version        获取Python解释程序的版本信息
- sys.maxint         最大的Int值，python3中这个东西已经取消了。在py3中当int足够大的时候会自动转换为长整型
- sys.path           返回模块的搜索路径，初始化时使用PYTHONPATH环境变量的值，首先会找自己所在的目录，然后会找python安装路径下的各个路径，最后找到site-packages


```
import sys

print(sys.path)

['D:\\坚果云同步\\Python\\Day9', 'D:\\坚果云同步\\Python', 'C:\\Users\\马晓雨\\AppData\\Local\\Programs\\Python\\Python36\\python36.zip', 'C:\\Users\\马晓雨\\AppData\\Local\\Programs\\Python\\Python36\\DLLs', 'C:\\Users\\马晓雨\\AppData\\Local\\Programs\\Python\\Python36\\lib', 'C:\\Users\\马晓雨\\AppData\\Local\\Programs\\Python\\Python36', 'C:\\Users\\马晓雨\\AppData\\Local\\Programs\\Python\\Python36\\lib\\site-packages']
```


- sys.platform       返回操作系统平台名称，比如win32，linux2.






