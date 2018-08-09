# CMDB

> 配置管理数据库

## CMDB介绍

运维愿景：

	1. 自动装机
	2. 配置管理
	3. 监控
	4. 堡垒机
	
	必备：资产管理

目前状况：
目前状况：
	手动维护Excel表格
	资产自动采集并汇报入库，少了块硬盘多了个内存自动记录汇报
	
	CMDB - 配置管理数据库（资产管理）

如何实现自动采集？
如何实现自动采集？
	subprocess
	Linux基本命令
	v = subprocess.getoutput('ls')
	1. Agent
	
	2. SSH类，paramiko，(机器少的时候用paramiko，因为ssh本身存在性能瓶颈)
		pip3 install paramiko
		
	3. saltstack(Python开发)
		master
			yum install salt-master
			
			配置：1.1.1.1
			service salt-master start
			
		salve
			yum install salt-minion
			配置：
				master: 1.1.1.1
			service salt-master start
		salve
			yum install salt-minion
			配置：
				master: 1.1.1.1
			service salt-master start


​	
		授权：

​		
​		
​		
		执行命令：
			在master上执行： salt "*" cmd.run "ifconfig"
	
	4. puppet(ruby)

目标：兼容三种采集方式软件
目标：兼容三种采集方式软件
​	
​		
任务：
	1. Agent方式

		API：Django接收数据并入库
	
		程序：放置在每台服务器
	
	2. SSH类
	
		API：Django接收数据并入库
	
		程序：放在中控机
	
	3. saltstack
	
		http://www.cnblogs.com/wupeiqi/articles/6415436.html
	
		API：Django接收数据并入库
	
		master:
			v = subprocess.getoutput('salt "*" cmd.run "ls"')
	
		前提：
			两个虚拟机：
				安装：
					master
					minion
				
				配置：
					...
				授权：
					...
					
	发送：
		# url = "http://127.0.0.1:8000/asset.html"
		# import requests
		#
		# response = requests.post(url,data={'k1':value1,'k2':value2})
		# print(response.text)


CMDB资产采集：
CMDB资产采集：
CMDB资产采集：

- 采集资产：执行命令，正则或字符串方法获取想要的数据
- 兼容性
- 汇报数据

```python
# 使用字符串导入模块，下面就是从a模块下的b模块下导入c
importlib.import_model('a.b.c')

m = importlib.import_model('a.b.c')
cls = getattr(m, 'd')
cls()
```

面向对象：

```python
class Foo:
    def __init__(self, xxx):
        pass
    @classmethod
    def instance(cls):
        return cls()
    def process(self):
        pass
if hasattr(Foo, 'instance'):
    obj = Foo.instance()
else:
    obj = Foo()
```

面向对象2：

```python
class A:
    def f1(self):
        self.f2()
    def f2(self):
        print('A.f2')

class B(A):
    def f2(self):
        print("B.f2")
obj = B()
obj.f1()  # B.f2
```





