在github新建了一个版本库，然后本地在push的时候出现了一个问题：

![](http://omk1n04i8.bkt.clouddn.com/17-7-26/5484363.jpg)

主要原因是在github新建版本库的时候多手勾了一个添加一个README的操作，因为我本地的库也有文件，所以导致本地和远端冲突了。

**解决方法**

1、把远程仓库master分支下载到本地并存为tmp分支

```
git fetch origin master:tmp
```

2、查看tmp分支与本地原有分支的不同

```
git diff tmp
```

这里主要是看看有没有其他的改动…

3、将tmp分支和本地的master分支合并

```
git merge tmp
```
这个时候呢,本地与远程就没有冲突了,而且还保留了我今天的代码,现在Push就OK啦！

但是操作过程中出现了一个问题：

```
提示：fatal: refusing to merge unrelated histories
```

解决方案：

```
git pull origin master --allow-unrelated-histories
```

4、最后别忘记删除tmp分支

```
git branch -d tmp
```

哈哈,又可以快乐的coding啦…