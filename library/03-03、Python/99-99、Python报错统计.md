# Python报错提示整理

##### 1、non-default argument follows default argument

- 就是说我把含有默认值的参数放在了不含默认值的参数的前面


##### 2、not all arguments converted during string formatting

这个问题是在字符串格式化输出的时候出现的问题，格式化字符串中的%s或者%d与实际给的参数对应不上了，问题发生在打印socket的地址的时候传的是一个元组而不是单个。

```python
logger().warning('当前的客户端地址为：%s，端口号为：%s' % self.client_address)
```

self.client_address其实就是('127.0.0.1',8080)。

