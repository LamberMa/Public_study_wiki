# defaultdict
>在Python中有一些内置的数据类型，比如int, str, list, tuple, dict等。Python的collections模块在这些内置数据类型的基础上，提供了几个额外的数据类型：namedtuple, defaultdict, deque, Counter, OrderedDict等，其中defaultdict和namedtuple是两个很实用的扩展类型。defaultdict继承自dict，namedtuple继承自tuple。

在使用Python原生的数据结构dict的时候，如果用d[key]这样的方式访问，当指定的key不存在时，是会抛出KeyError异常的。但是，如果使用defaultdict，只要你传入一个默认的工厂方法，那么请求一个不存在的key时， 便会调用这个工厂方法使用其结果来作为这个key的默认值。

defaultdict在使用的时候需要传一个工厂函数(function_factory)，defaultdict(function_factory)会构建一个类似dict的对象，该对象具有默认值，默认值通过调用工厂函数生成。