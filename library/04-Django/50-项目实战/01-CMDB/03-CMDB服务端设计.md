# CMDB AutoServer设计

## API

在上一节的AutoClient设计中，已经可以通过API向服务端发送消息了，现在可以简单的测试一下服务端接收消息了。

- 首先新建AutoServer端项目

  ```python
  # 进入虚拟环境
  workon cmdb
  # 创建django project
  cd workspace
  django-admin startproject autoserver
  # 新建两个django的app项目，一个用来做api，一个用来做server的后台
  python manage.py startapp api
  python manage.py startapp backend
  ```

  