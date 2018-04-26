# Redis的简单使用

> redis中最简单的数据结构，它即可以存储文字，又可以存储数字，和浮点数，还可以进行二进制的存储，redis为这几类型的值分贝设置相应的操作命令，让用户可以针对不同的值做不同的处理。

## 简单操作

### help

```shell
# 熟练使用帮助信息
127.0.0.1:6379> help set

  SET key value [EX seconds] [PX milliseconds] [NX|XX]
  summary: Set the string value of a key
  since: 1.0.0
  group: string
  
# 查看有关字符串的操作
help @string

# 查看关于集合的操作
help @set
```

### String

> 一个字符串类型的值最多能存储512M字节的内容

```shell
# 多次设置同一个key，key会被后设置所覆盖，也就是key是唯一的。
set msg "hello world"

# nx表示key不存在的时候才进行设置，当key已经存在的时候就不设置，返回nil
set msg "redis" nx

# xx表示当key存在的时候才可以设置，因为之前设置了msg，所以这个key存在，现在可以设置msg
set msg 'bbb' xx

# 设置键的过期时间，ex，后面10表示秒数，意思就是10s以后删除temp这个key，px接的数字单位是毫秒
set temp "temp" ex 10
set temp "temp" px 10

# 使用get来获取设置的内容
get msg

# setnx，nx表示not exist的意思，当不存在的时候设置
127.0.0.1:6379> setnx key1 "key1"
(integer) 1
127.0.0.1:6379> get key1
"key1"
127.0.0.1:6379> setnx key1 'key1bak'
(integer) 0
127.0.0.1:6379> get key1
"key1"

# 同时设置多个值，同时获取多个值，mget，mset
127.0.0.1:6379> mset key1 "key1" key2 "key2" key3 "key3"
OK
127.0.0.1:6379> mget key1 key2 key3
1) "key1"
2) "key2"
3) "key3"

# msetnx同时设置多个值，具有原子性，要不成功就是整体不成功。nx还是not exist，当不存在这个key的时候设置，当至少有一个是存在的时候，那么msetnx将不执行任何操作
127.0.0.1:6379> mset a 1 b 2
OK
127.0.0.1:6379> msetnx a 1 c 3
(integer) 0 # 返回integer 0就是表示没有设置成功
127.0.0.1:6379> get c
(nil)

# getset可以将key的值设置一个新的value，并返回key之前存储的旧值。内部实现其实就是一个get，一个set，然后return get拿到的值，但是操作由两次变成了一次。
127.0.0.1:6379> get a
"a_old"
127.0.0.1:6379> getset a 'a_new'
"a_old"
127.0.0.1:6379> get a
"a_new"

# append将值value插入到字符串key已存储内容的末尾
127.0.0.1:6379> set a "hahaha"
OK
127.0.0.1:6379> append a "_?????"
(integer) 12
127.0.0.1:6379> get a
"hahaha_?????"

# strlen 接收一个key，返回value字符串的长度
127.0.0.1:6379> set a "hahaha"
OK
127.0.0.1:6379> STRLEN a
(integer) 6
```

#### key的命名规范

因为redis数据库的key是唯一的，因此在设计key的命名的时候我们可以这样去设置，比如用户lamber的email地址这样一个内容的key可以设置为`lamber::email`，这样的话，大家每个人的内容就不会造成冲突，举个复杂点的例子比如：`user::10086::info`可以表示为id是10086的用户的信息，`news::sport::cache`可以表示新闻类网站体育分类的缓存，两个冒号是大众习惯的分隔符，当然这个不是固定死的，也可以使用其它的分隔符，比如使用`/`也是可以的，在程序中统一规范即可。

redis的key值是二进制安全的，这意味着可以用任何二进制序列作为key值，从形如“foo”的简单字符串到一个jpeg的文件的内容都可以，空字符串也可以是有效的key值。

- 键值不要太长，消耗内存， 并且在查找这类key值的计算成本较高，而且存储的键的个数不宜过多，在存储键值这一块，值就是值本身，但是key的存储往往携带一些附属内容，比如key的过期时间以及其他属性。
- key值也不要过短，太短的话可读性太差。

#### 字符串索引

> 索引从0开始，除了正向索引外，还有一个负数的索引，负数索引从-1开始，表示字符串的结尾，这个其实和python的字符串索引很像。

通过字符串的索引去进行范围查找

```shell
# setrange命令可以从索引index开始，用你想写入的value值替换到给定key所存储的字符串部分，注意这个目前是只支持正数索引，替换完成以后返回的内容为字符串的长度。没替换到的地方保留，超过的地方追加
127.0.0.1:6379> set a "hello"
OK
127.0.0.1:6379> setrange a 1 "appy"
(integer) 5
127.0.0.1:6379> get a
"happy"

# getrange是获取某个区间范围内的值，注意范围左右都是闭区间，也就是说都可以取到的。getrange接收的区间范围的值可以是正数也可以是负数
127.0.0.1:6379> set msg "hello world"
OK
127.0.0.1:6379> getrange msg 0 4
"hello"
127.0.0.1:6379> getrange msg -5 -1
"world"
# 注意这里的负数取值的时候其实顺序还是从左到右的，-1到-5相当于从右向左取是取不到的。
127.0.0.1:6379> getrange msg -1 -5
""
127.0.0.1:6379> getrange msg 0 -1
"hello world"   # 获取整个字符串
```

#### BitMap

> - BitMap(位图)不是真正的数据类型，它是定义在字符串类型中的
> - 一个字符串类型的值最多能存储512M字节的内容
> - 位上限2^(9+10+10+3)=2^32b

```shell
# 设置某一位上的值，offset表示偏移量，从0开始，value不写，默认是0
setbit key offset value、
# 获取某一位上的值
getbit key offset
# 返回指定值0或者1在指定区间上第一次出现的位置
bitpos key bit [start] [end]
```



### 数字操作

> redis有一些命令可以专门处理数字的值，只要存储在字符串key里的值可以被解释为64位整数或者标准的64位浮点数，那么用户就可以针对这个字符串执行针对数字值的命令，下面列出来了一些值来说明他们能否被解释为整数或者浮点数，科学计数法不会视图解释，直接当字符串了。
>
> 即使字符串key存储的是数字值，但是它仍然可以执行append，strlen，setrange和getrange，当用户针对一个数字执行这些命令的时候，redis会先将数字值转换为字符串，然后再执行命令。

| 数值                              | 是否可以被解释 | 说明                                |
| --------------------------------- | -------------- | ----------------------------------- |
| 10086                             | yes            | 值可以被解析为整数                  |
| 3.14                              | yes            | 值可以被解析为浮点数                |
| +123                              | yes            | 值可以被解析为整数                  |
| 123123123123123123123123123123123 | no             | 值太大，没办法使用64位整数来存储    |
| 2.0e7                             | no             | redis不解释以科学计数法表示的浮点数 |
| 123ABC                            | no             | 值包含文字                          |
| ABC                               | no             | 值为文字                            |

#### 增加或减少数字的值

对于一个键是字符串的key，值是数字的，我们可以使用incrby命令增加值，或者是decrby命令来减少值，命令返回操作执行后，key的当前值是什么，如果key本来就不存在，那么redis会生成一个key为键，value为0的键值对，然后再来进行增量或者减量的操作

```shell
# 字符串值会被解释成64位有符号的十进制整数来操作，结果依然转换成字符串
127.0.0.1:6379> INCRBY num 2
(integer) 2
127.0.0.1:6379> get num
"2"
127.0.0.1:6379> decrby num1 3
(integer) -3
127.0.0.1:6379> get num1
"-3"
```

因为针对数字的加一减一操作很常用，比如微博的浏览量增加减少等。因此redis针对这个操作创建了incr和decr这两个命令：

```shell
127.0.0.1:6379> incr num
(integer) 3
127.0.0.1:6379> decr num
(integer) 2
```

针对浮点数的增加

```shell
# 针对浮点数有增加，但是没有对应的减少的功能，但是我们可以通过加负值实现减法的功能
127.0.0.1:6379> set num 10
OK
127.0.0.1:6379> INCRBYFLOAT num 3.14
"13.14"
127.0.0.1:6379> INCRBYFLOAT num -2
"11.14"
```



## 其他操作

- 清空redis

  ```shell
  # 这个基本不要用，会丢饭碗的~
  flusbdb
  ```

- 过期相关操作

  ```shell
  # 给key设置一个过期时间
  expire key 秒数
  pexpire key 毫秒数

  # 设置一个指定的unix时间戳过期
  expireat key 时间戳
  pexpireat key milliseconds-timestamp

  # 删除过期，在未过期的时间把把过期的设置取消掉。比如设置5s过期，5s内执行以下删除过期就不会过期了
  persist key
  ```

- 生存时间

  ```shell
  # 查看剩余的生存时间
  ttl key
  pttl key
  - key存在但是没有设置ttl，返回-1
  - key存在，但还在生存期内，返回剩余的秒数或者毫秒数
  - key曾经存在，但是已经消亡，返回-2，2.8以前的版本返回-1
  ```

- key的查找

  ```shell
  # 通过正则来查看数据库有哪些key
  keys *
  keys msg[1-3]
  keys msg???

  - *：表示任意长度字符
  - ？：任意一个字符
  - []：字符集合，表示可以是集合中的任意一个，比如[123]
  ```

- key属性相关

  ```shell
  # 查看key类型
  type key
  # 查看key是否存在，存在返回1，不存在返回0
  exists key
  # key的重命名
  rename old_key new_key
  # 如果这个键不存在重命名这个key，你重命名的这个新key有可能是现在已经存在的，如果你真的覆盖了，那么这个之前存在的key就被覆盖了，所以renamenx表示只有当你重命名的这个new key不存在的时候重命名（return 1），如果已经存在了就不重命名了（return 0）。
  renamenx key newkey
  # key删除
  del key [key……]
  ```

  ​

## 使用python客户端进行连接

### 安装

```python
pip install redis
```

### 简单连接使用

```python
In [1]: import redis

In [2]: rds = redis.Redis(host="127.0.0.1", port=6379, db=0)

In [3]: rds.set('testbin', 0b01100010)
Out[3]: True

In [4]: rds.get('testbin')
Out[4]: b'98'

In [5]: rds.set(0b0011, 0b01100011)
Out[5]: True

In [6]: rds.get(0b0011)
Out[6]: b'99'

# 返回的是一个列表list
In [7]: rds.keys('*')
Out[7]: 
[b'msg',
 b'3',
 b'key3',
 b'key2',
 b'num',
 b'mykey',
 b'num1',
 b'key1',
 b'testbin',
 b'a',
 b'b']

In [8]: rds.set('test16', 0x62)
Out[8]: True

In [9]: rds.get('test16')
Out[9]: b'98'
```

