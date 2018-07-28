## 安装Git

下载git的安装包在windows进行安装，安装完成以后在windows右键菜单多出了两个选项，一个是“Git GUI Here”和“Git Base Here”。也就是说我们可以在任意位置打开git的command界面进行操作。

Git的设定被存放在用户本地目录的.gitconfig档案里。虽然可以直接编辑配置文件，但在这个教程里我们使用config命令。

```
$ git config --global user.name "<用户名>"
$ git config --global user.email "<电子邮件>"
```

以下命令能让Git以彩色显示。

```
$ git config --global color.ui auto
```

您可以为Git命令设定别名。例如：把「checkout」缩略为「co」，然后就使用「co」来执行命令。

```
$ git config --global alias.co checkout
```

创建一个新的目录（我这里有一个wiki的目录），初始化加入到git数据库：

```
git init
```

请使用status命令确认工作树和索引的状态。

```
$ git status
On branch master

Initial commit

Untracked files:
  (use "git add <file>..." to include in what will be committed)

        amWiki/
        config.json
        git_push.sh
        index.html
        library/

nothing added to commit but untracked files present (use "git add" to track)
```

将文件加入到索引，要使用add命令。在<file>指定加入索引的文件。用空格分割可以指定多个文件。

```
$ git add *     # 这里可以添加单个文件也可以添加所有也就是使用通配符*
$ git add .     # 使用“.”其实也是一样的，同上面这条命令。
```

##### Note

如果在Windows使用命令行 (Git Bash), 含非ASCII字符的文件名会显示为 "\346\226\260\350\246..."。若设定如下，就可以让含非ASCII字符的文件名正确显示了。

```
$ git config --global core.quotepath off
```

若在Windows使用命令行，您只能输入ASCII字符。所以，如果您的提交信息包含非ASCII字符，请不要使用-m选项，而要用外部编辑器输入。

外部编辑器必须能与字符编码UTF-8和换行码LF兼容。

```
git config --global core.editor "\"[使用编辑区的路径]\""
```

commit提交

```
$ git commit -m 'Init Wiki'
```

使用log命令，我们可以在数据库的提交记录看到新的提交。

```
$ git log
commit b49063627b601e95fe7a2938f14c61fe218fb008 (HEAD -> master)
Author: maxiaoyu <1020561033@qq.com>
Date:   Wed Jul 26 11:39:30 2017 +0800

    Init Wiki
```



#### git的注解

查看其他人提交的修改内容或自己的历史记录的时候，提交信息是需要用到的重要资料。所以请用心填写修改内容的提交信息，以方便别人理解。
以下是Git的标准注解：

```
第1行：提交修改内容的摘要
第2行：空行
第3行以后：修改的理由
```

请以这种格式填写提交信息。