# TKinter

### Laber and Button

一个简单的小窗口

```python
import tkinter as tk

"""
1、定义window窗口和窗口的一些属性。
2、书写窗口内容
3、执行window.mainloop让窗口活起来
"""
# 定义一个窗口
window = tk.Tk()
# 定义一些窗口的属性
window.title('my first window')
window.geometry('200x200')

# 用一个标签描述窗口内容
window_lable = tk.Label(window,
                        text='这里是测试的内容',  # 标签内容
                        bg='green',  # 背景颜色
                        font=('Arial', 12),  # 字体
                        width=15, height=2  # 标签长宽
                        )
window_lable.pack()  # 固定窗口位置

# 让整个window活起来
window.mainloop()
```

为窗口添加button，让窗口中的内容随着button的点击而变化：

```python
import tkinter as tk

# 定义一个窗口
window = tk.Tk()
# 定义一些窗口的属性
window.title('my first window')
window.geometry('200x200')

on_hit = False  # 默认的情况下on_hit=False


def hit_me():
    global on_hit
    if not on_hit:
        on_hit = True   # 从False变为true
        var.set('you hit me')
    else:
        on_hit = False
        var.set('')     # 设置文字内容为空


# 用一个标签描述窗口内容
var = tk.StringVar()   # 这是文字变量存储器，用来存储动态变更的文字
window_lable = tk.Label(window,
                        textvariable=var,  # 使用文本变量替换text，可以变化
                        bg='green',  # 背景颜色
                        font=('Arial', 12),  # 字体
                        width=15, height=2  # 标签长宽
                        )
window_lable.pack()  # 固定窗口位置


# 制作button按钮
b = tk.Button(window,
              text='点我',    # 显示在按钮上的文字
              width=15, height=2,
              command=hit_me)   # 点击按钮的时候执行的命令
b.pack()   # 固定按钮的位置


# 让整个window活起来
window.mainloop()
```

