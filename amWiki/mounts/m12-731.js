if(typeof AWPageMounts=='undefined'){AWPageMounts={}};AWPageMounts['m12']=[{"name":"01-Java报错信息.md","path":"12-Java/01-Java报错信息.md","content":"# Java报错汇总\n\n- Unknown character set index for field \'224\' received from server.\n\n```\n(1) MYSQL 5.5 之前， UTF8 编码只支持1-3个字节;从MYSQL5.5开始，可支持4个字节UTF编码utf8mb4;如emoji表情需要使用utf8mb4，本次报错的主要原因是我在配置文件里设置了数据库的字符集编码为utf8mb4，导致陈年老jar包根本不识别了，直接报错。\n(2) 如果服务器级使用的编码是utf8mb4(在客户端链接后使用sql语句show variables like \'char%\'可查看所有编码)，而mysql的jar包低版本不支持utf8mb4,连接时报错\"Unknown character set index for field \'224\' received from server.\"\n(3) 建议使用mysql-connector-java-5.1.30-bin.jar\n(4) 注意：如果数据库不支持utf8mb4，使用mysql-connector-java-5.1.30-bin.jar的jar包时则会报错，此时应该使用低版本的jar包。\n```\n\n","timestamp":1539869943681}]