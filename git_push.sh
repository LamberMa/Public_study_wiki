#!/usr/local/bin/zsh

comment=$1

#usage(){
#    echo "输入错误，请按照--> $0 comment信息的格式进行输出。"
#}

if [ -z $comment ];then
	comment="daily_update_$(date +%F-%T)"
fi

git add .
git commit -m $comment
git push
amwiki -u nav
amwiki -u
