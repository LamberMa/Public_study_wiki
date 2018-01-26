# Socket

## 常用Socket小功能

- socket.gethostname()，返回所在主机或者本地主机的名字。

  ```
  >>> socket.gethostname()
  'maxiaoyu'
  ```

- socket.gethostbyname()，接收hostname返回IP。

  ```
  >>> socket.gethostbyname('bbs.dcgamer.top')
  '47.94.132.15'
  ```

- ip地址格式转换：如果要使用低层网络函数，有时普通的字符串形式的IP地址并不是很有用，需要把它们转换成打包后的32位二进制格式。 

  ```
  # ip地址格式打包
  >>> packed = socket.inet_aton('192.168.1.1')
  >>> packed
  '\xc0\xa8\x01\x01'
  >>> unpacked = socket.inet_ntoa(packed)
  >>> unpacked
  '192.168.1.1'
  ```

- 调用socket库中的getservbyport()函数来获取服务的名字。调用这个函数时可以根据情况决定是否提供协议名，第一个参数是端口号，第二个是协议名。 

  ```
  >>> socket.getservbyport(9002,'tcp')
  'dynamid'
  >>> socket.getservbyport(53,'udp')  
  'domain'
  >>> socket.getservbyport(8080,'tcp')
  'webcache'
  ```

- 编写低层网络应用时，或许需要处理通过电缆在两台设备之间传送的低层数据。在这种操作中，需要把主机操作系统发出的数据转换成网络格式，或者做逆向转换，因为这两种数据的表示方式不一样。 函数名中的n表示网络； h表示主机； l表示长整形； s表示短整形，即16位。 

  ```python
  import socket

  def convert_integer():
      data = 1234
      # 32-bit
      print("Original: %s => Long host byte order: %s, Network byte order: %s"\%(data, socket.ntohl(data), socket.htonl(data)))
      # 16-bit
      print("Original: %s => Short host byte order: %s, Network byte order:%s"\%(data, socket.ntohs(data), socket.htons(data)))
  if __name__ == '__main__':
      convert_integer()
      
  结果如下：
  $ python 1_5_integer_conversion.py
  Original: 1234 => Long host byte order: 3523477504, Network byte order: 3523477504
  Original: 1234 => Short host byte order: 53764, Network byte order: 53764
  ```

- 获取套接字的超时时间，创建一个套接字对象实例，调用gettimeout()方法获取默认的超时时间，调用
  settimeout()方法设定一个超时时间。传给settimeout()方法的参数可以是秒数（非负浮点数）也可以是None。这个方法在处理阻塞式套接字操作时使用。如果把超时时间设为None，则禁用了套接字操作的超时检测。 这种操作在开发服务器应用时很有用。 

  ```python
  >>> sock = socket.socket(socket.AF_INET,socket.SOCK_STREAM)
  >>> print(sock.gettimeout())
  None
  >>> sock.settimeout(10)
  >>> sock.gettimeout()       
  10.0
  ```

- socket的错误处理

  ```python

  ```

  ​