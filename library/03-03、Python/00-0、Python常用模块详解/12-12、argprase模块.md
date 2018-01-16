# argprase模块

>在多个文件或者不同语言协同的项目中，python脚本经常需要从命令行直接读取参数。万能的python就自带了[argprase包](https://docs.python.org/2/howto/argparse.html)使得这一工作变得简单而规范。
>
>PS：optparse包是类似的功能，只不过写起来更麻烦一些。如果脚本很简单或临时使用，没有多个复杂的参数选项，可以直接利用`sys.argv`将脚本后的参数依次读取(读进来的默认是字符串格式)。

## 常用模式

大多数情况下，脚本很可能需要多个参数，而且每次参数的类型用处各不相同，那么这个时候在参数前添加标签表明参数的类型和用途便十分有用，而利用argparse模块可以很方便得实现这一目的。

```python
# -*- coding: utf-8 -*-
# author:maxiaoyu
# -*- coding: utf-8 -*-
import argparse

# description参数可以用于插入描述脚本用途的信息，可以为空
parser = argparse.ArgumentParser(description="your script description")

# 添加--verbose标签，标签别名可以为-v，这里action的意思是当读取的参数中出现--verbose/-v的时候
# 参数字典的verbose建对应的值为True，而help参数用于描述--verbose参数的用途或意义。
parser.add_argument('--verbose', '-v', action='store_true', help='verbose mode')

# 将变量以标签-值的字典形式存入args字典
args = parser.parse_args()

print(args)
print(args.verbose)
```

结果显示：

```python
Namespace(verbose=False)
False
```

终端运行：

```powershell
D:\坚果云同步\Python\Python_exercise\Day21 Modules>python3 args.py -v
Namespace(verbose=True)

D:\坚果云同步\Python\Python_exercise\Day21 Modules>python3 args.py --verbose
Namespace(verbose=True)

D:\坚果云同步\Python\Python_exercise\Day21 Modules>python3 args.py --help
usage: args.py [-h] [--verbose]

your script description

optional arguments:
  -h, --help     show this help message and exit
  --verbose, -v  verbose mode

D:\坚果云同步\Python\Python_exercise\Day21 Modules>python3 args.py -h
usage: args.py [-h] [--verbose]

your script description

optional arguments:
  -h, --help     show this help message and exit
  --verbose, -v  verbose mode

D:\坚果云同步\Python\Python_exercise\Day21 Modules>python3 args.py -a
usage: args.py [-h] [--verbose]
args.py: error: unrecognized arguments: -a
```

运行这个脚本后面跟了--verbose/-v的时候会输出前者，如果什么都没有会输出后者。如果输入了--verbose/-v以外的参数则会报错：unrecognized arguments
稍微提一下，action参数表示值赋予键的方式，这里用到的是bool类型；如果是'count'表示将--verbose标签出现的次数作为verbose的值；'append'表示将每次出现的该便签后的值都存入同一个数组再赋值。（嘛，一般后面两种用的比较少就不多说了）
**PS：--help标签在使用argparse模块时会自动创建，因此一般情况不需要我们主动定义帮助信息。**

## 必要参数

这种模式用于确保某些必需的参数有输入。
`parser.add_argument('--verbose', required=True, type=int)`
required标签就是说--verbose参数是必需的，并且类型为int，输入别的类型会报错。

## 位置参数

位置参数与sys.argv调用比较像，参数没有显式的--xxx或者-xxx标签，因此调用属性也与sys.argv相同。

```
parser.add_argument('filename')    # 输入的第一个参数赋予名为filename的键
args = parser.parse_args()
print "Read in %s" %(args.filename)
```

输入`python test.py test.txt`则会输出`Read in test.txt`
此外，可以用nargs参数来限定输入的位置参数的个数，默认为1。当然nargs参数也可用于普通带标签的参数。
`parser.add_argument('num', nargs=2, type=int)`表示脚本可以读入两个整数赋予num键（此时的值为2个整数的数组）。nargs还可以'*'用来表示如果有该位置参数输入的话，之后所有的输入都将作为该位置参数的值；‘+’表示读取至少1个该位置参数。'?'表示该位置参数要么没有，要么就只要一个。（PS：跟正则表达式的符号用途一致。）比如用：

```
parser.add_argument('filename')
parser.add_argument('num', nargs='*)
```

就可以运行`python test.py text.txt 1 2`
由于没有标签，所以用位置参数的时候需要比较小心。

## 输入类型

之前已经提到了用type参数就可以指定输入的参数类型。而这个type类型还可以表示文件操作的类型从而直接进行文件的读写操作。

```
parser.add_argument('file', type=argparser.FileType('r'))    # 读取文件
args = parser.parse_args()
for line in args.file:
    print line.strip()
```

## 参数默认值

一般情况下会设置一些默认参数从而不需要每次输入某些不需要变动的参数，利用default参数即可实现。

```
parser.add_argument('filename', default='text.txt')
```

这个时候至直接运行`python text.py`就能得到`Read in text.txt`而不需要输入文件名了。

## 候选参数

表示该参数能接受的值只能来自某几个值候选值中，除此以外会报错，用choices参数即可。比如：

```
parser.add_argument('filename', choices=['test1.txt', 'text2.txt'])
```