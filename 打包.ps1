# 获取当前最新的标签
$version = git describe --tags --abbrev=0
git archive --format=zip --output=..\魔法纪录_$version.zip HEAD