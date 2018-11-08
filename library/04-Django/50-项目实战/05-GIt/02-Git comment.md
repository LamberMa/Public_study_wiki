Commit message的格式：

```
<type>(scope): desc
```

1. type用来说明类型，常用的有以下几种：
   - feat：完成新功能的开发
   - fix：代码BUG的修复
   - style：样式的修改
   - refactor：代码重构
   - docs：文档
   - chore：构建工具
2. scope用来说明此次变动影响的范围或文件
3. desc用来**简短描述**此次的变动，描述只要简明易理解就好，没必要写很多

举例：
 feat(deployment.js)： 新增应用发布功能