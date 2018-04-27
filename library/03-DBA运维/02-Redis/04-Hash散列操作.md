# List列表

>- 基于Linked List实现
>- 元素是字符串类型
>- 列表头尾增删快，中间增删慢，增删元素是常态
>- 元素可以重复出现
>- 最多包含2的32次幂-1个元素
>- 索引左到右是从0开始，从右刀座是从-1开始。

## 命令说明

- B block块，阻塞
- L left 做
- R right 右
- X exist 存在

## 常用操作

**左右或者头尾压入元素**

- LPUSH key value [value ……]

  从左边压入元素

- LPUSHX key value

- RPUSH key value [value ..]

- RPUSHX key value

**左右或者头尾弹出元素**

- LPOP key
- RPOP key

**从一个列表尾部弹出元素压入另一个列表的头部**

- RPOPLPUSH source destination

**返回列表中指定范围的元素**

- LRANGE key start stop
- LRANGE key 0 -1 表示返回所有元素

**获取指定位置的元素**

- LINDEX key index

**设置指定位置元素的值**

- LSET key index value

**列表长度，元素个数**

- LLEN key

**从列表头部开始删除值等于value的元素count次**

- LREM key count value
  - count > 0 ：从表头开始向表尾搜索，移除与value相等的元素，数量为count
  - count < 0 ：从表尾开始向表头搜索，移除与value相等的元素，数量为count的绝对值
  - count = 0 ：移除表中所有与value相等的值。

**去除指定范围外元素**

- LTRIM key start stop （一个范围，把范围外的都删掉。）

  ```shell
  # 删除微博的评论最后500条
  LTRIM u1234:forumid:comments 0 499
  ```

  ​