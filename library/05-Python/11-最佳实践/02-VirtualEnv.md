# VirtualEnv

> 使用virtualenv进行科学管理我们的项目

## 安装Virtualenv

```shell
# 看好你使用的环境，我是给python3使用，因此调用的也就是pip3去进行安装
pip(3) install virtualenv

# 直接使用virtualenv project_name就可以进行创建虚拟环境了。
mkdir ~/testvirtualenv
cd ~/testvirtualenv
virtualenv env1
```

## 安装VirtualenvWrapper

Virtualenvwrapper是virtualenv的扩展包，可以更好的管理我们创建的虚拟环境

```shell
pip(3) install virtualenvwrapper
```

指定一个虚拟环境的目录，我是在自己的家目录下新建一个了一个python路径来进行项目管理

```shell
➜  python > pwd
/Users/lamber/python
```

在使用virtualenvwrapper之前要运行virtualenvwrapper.sh这个脚本，并且要进行环境变量的设置，因此我们要把下面的脚本内容放到`~/.bashrc`由于我用的是zsh于是就在`~/.zshrc`中添加了如下的两句内容：

```shell
# About virtualenvwrapper
VIRTUALENVWRAPPER_PYTHON=/usr/local/bin/python3
if [ -f /usr/local/bin/virtualenvwrapper.sh ]; then
   export WORKON_HOME=$HOME/python
   source /usr/local/bin/virtualenvwrapper.sh
fi
```

然后重载一下即可，主要是设置virtualenvwrapper是给那个python版本使用的，不然可能会出现无法导入virtualenvwrapper模块的问题。

## 创建虚拟环境

```shell
mkvirtualenv env1
```

创建成功后，当前路径前面就会有(env1)的字样。

## 常用小功能

- 列出当前的虚拟环境

  ```shell
  lsvirtualenv -b
  ```

- 切换虚拟环境

  ```shell
  workon env1
  ```

- 查看环境里安装了哪些包

  ```shell
  lssitepackages
  ```

- 进入当前环境

  ```shell
  cdvirtualenv

  # 示例
  (env1) ➜  python > cdvirtualenv
  (env1) ➜  env1 >
  (env1) ➜  env1 > ll
  total 8
  drwxr-xr-x  21 lamber  staff   672B  2  8 14:55 bin
  drwxr-xr-x   3 lamber  staff    96B  2  8 14:55 include
  drwxr-xr-x   3 lamber  staff    96B  2  8 14:55 lib
  -rw-r--r--   1 lamber  staff    60B  2  8 14:55 pip-selfcheck.json
  ```

- 进入当前环境的site-packages：

  ```shell
  cdsitepackages
  cdsitepackages pip
  ```

- 复制虚拟环境

  ```shell
  cpvirtualenv env1 env3   # cpvirtualenv source destination
  ```

- 退出虚拟环境

  ```shell
  deactivate
  ```

- 删除虚拟环境

  ```shell
  ➜  ~ > rmvirtualenv env2
  Removing env2...
  ```

## Tip

创建一个干净的环境

```shell
$ mkvirtualenv --no-site-packages env343
```

指定虚拟环境使用的python版本

```shell
$ mkvirtualenv -p  /usr/local/bin/python3  env343
```

