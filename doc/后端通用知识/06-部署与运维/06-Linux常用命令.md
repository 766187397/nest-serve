# Linux常用命令

Linux是服务器端最常用的操作系统之一，掌握Linux常用命令对于后端开发者来说至关重要。本文将详细介绍Linux系统中最常用的命令，包括文件管理、系统管理、网络管理、用户管理等方面。

## 1. 文件管理命令

### 1.1 目录操作

| 命令 | 功能描述 | 示例 |
|------|----------|------|
| `pwd` | 显示当前工作目录 | `pwd` |
| `cd` | 切换工作目录 | `cd /home/user` |
| `cd ..` | 切换到上级目录 | `cd ..` |
| `cd -` | 切换到上一个工作目录 | `cd -` |
| `mkdir` | 创建目录 | `mkdir newdir` |
| `mkdir -p` | 递归创建目录 | `mkdir -p dir1/dir2/dir3` |
| `rmdir` | 删除空目录 | `rmdir emptydir` |
| `ls` | 列出目录内容 | `ls -la` |
| `ls -l` | 以长格式列出目录内容 | `ls -l` |
| `ls -a` | 列出所有文件（包括隐藏文件） | `ls -a` |
| `ls -h` | 以人类可读格式显示文件大小 | `ls -lh` |
| `tree` | 以树状结构显示目录内容 | `tree -L 2` |

### 1.2 文件操作

| 命令 | 功能描述 | 示例 |
|------|----------|------|
| `touch` | 创建空文件或更新文件时间戳 | `touch newfile.txt` |
| `cp` | 复制文件或目录 | `cp file1.txt file2.txt` |
| `cp -r` | 递归复制目录 | `cp -r dir1 dir2` |
| `mv` | 移动或重命名文件/目录 | `mv oldname.txt newname.txt` |
| `rm` | 删除文件 | `rm file.txt` |
| `rm -f` | 强制删除文件，不提示 | `rm -f file.txt` |
| `rm -r` | 递归删除目录 | `rm -r dir` |
| `rm -rf` | 强制递归删除目录，不提示 | `rm -rf dir` |
| `cat` | 显示文件内容 | `cat file.txt` |
| `head` | 显示文件开头部分 | `head -n 10 file.txt` |
| `tail` | 显示文件结尾部分 | `tail -n 10 file.txt` |
| `tail -f` | 实时显示文件更新内容 | `tail -f log.txt` |
| `more` | 分页显示文件内容 | `more file.txt` |
| `less` | 分页显示文件内容，支持上下滚动 | `less file.txt` |
| `nl` | 显示文件内容并带行号 | `nl file.txt` |
| `wc` | 统计文件行数、单词数、字节数 | `wc -l file.txt` |
| `du` | 显示文件或目录大小 | `du -sh dir` |
| `df` | 显示磁盘使用情况 | `df -h` |
| `find` | 查找文件或目录 | `find /home -name "*.txt"` |
| `grep` | 在文件中搜索字符串 | `grep "pattern" file.txt` |
| `grep -r` | 递归搜索目录中的文件 | `grep -r "pattern" dir` |
| `grep -i` | 忽略大小写搜索 | `grep -i "pattern" file.txt` |
| `grep -n` | 显示匹配行的行号 | `grep -n "pattern" file.txt` |
| `diff` | 比较两个文件的差异 | `diff file1.txt file2.txt` |
| `cmp` | 比较两个文件的内容 | `cmp file1.txt file2.txt` |
| `ln` | 创建硬链接 | `ln file.txt hardlink.txt` |
| `ln -s` | 创建软链接 | `ln -s file.txt softlink.txt` |

### 1.3 文件权限管理

| 命令 | 功能描述 | 示例 |
|------|----------|------|
| `chmod` | 修改文件权限 | `chmod 755 file.txt` |
| `chmod +x` | 给文件添加执行权限 | `chmod +x script.sh` |
| `chmod -r` | 移除文件的读权限 | `chmod -r file.txt` |
| `chmod u+rwx` | 给文件所有者添加读、写、执行权限 | `chmod u+rwx file.txt` |
| `chmod g+rx` | 给文件所属组添加读、执行权限 | `chmod g+rx file.txt` |
| `chmod o+r` | 给其他用户添加读权限 | `chmod o+r file.txt` |
| `chown` | 修改文件所有者 | `chown user:group file.txt` |
| `chgrp` | 修改文件所属组 | `chgrp group file.txt` |
| `umask` | 查看或设置默认文件权限 | `umask 022` |

## 2. 系统管理命令

### 2.1 进程管理

| 命令 | 功能描述 | 示例 |
|------|----------|------|
| `ps` | 显示当前进程状态 | `ps aux` |
| `ps -ef` | 以全格式显示所有进程 | `ps -ef` |
| `top` | 实时显示进程动态 | `top` |
| `htop` | 交互式进程查看器（需安装） | `htop` |
| `kill` | 终止进程 | `kill PID` |
| `kill -9` | 强制终止进程 | `kill -9 PID` |
| `pkill` | 根据进程名终止进程 | `pkill process_name` |
| `pgrep` | 根据进程名查找进程ID | `pgrep process_name` |
| `jobs` | 显示当前终端的后台作业 | `jobs` |
| `bg` | 将前台作业放到后台运行 | `bg %1` |
| `fg` | 将后台作业放到前台运行 | `fg %1` |
| `nohup` | 使进程在后台持续运行，不受终端关闭影响 | `nohup command &` |
| `&` | 将命令放到后台运行 | `command &` |

### 2.2 系统信息

| 命令 | 功能描述 | 示例 |
|------|----------|------|
| `uname` | 显示系统信息 | `uname -a` |
| `uname -r` | 显示内核版本 | `uname -r` |
| `hostname` | 显示主机名 | `hostname` |
| `hostnamectl` | 显示或设置主机名 | `hostnamectl status` |
| `whoami` | 显示当前用户名 | `whoami` |
| `who` | 显示当前登录用户 | `who` |
| `w` | 显示当前登录用户及其活动 | `w` |
| `uptime` | 显示系统运行时间和负载 | `uptime` |
| `date` | 显示或设置系统时间 | `date` |
| `cal` | 显示日历 | `cal 2023` |
| `free` | 显示内存使用情况 | `free -h` |
| `vmstat` | 显示虚拟内存状态 | `vmstat 1` |
| `iostat` | 显示CPU和磁盘I/O统计信息 | `iostat -x` |
| `sar` | 系统活动报告工具 | `sar -u 1 10` |
| `dmesg` | 显示内核环缓冲区信息 | `dmesg | head -20` |
| `lsb_release -a` | 显示Linux发行版信息 | `lsb_release -a` |
| `cat /etc/os-release` | 显示操作系统信息 | `cat /etc/os-release` |
| `cat /proc/cpuinfo` | 显示CPU信息 | `cat /proc/cpuinfo` |
| `cat /proc/meminfo` | 显示内存信息 | `cat /proc/meminfo` |

### 2.3 系统服务管理

| 命令 | 功能描述 | 示例 |
|------|----------|------|
| `systemctl` | 系统服务管理命令（Systemd） | `systemctl status sshd` |
| `systemctl start` | 启动服务 | `systemctl start sshd` |
| `systemctl stop` | 停止服务 | `systemctl stop sshd` |
| `systemctl restart` | 重启服务 | `systemctl restart sshd` |
| `systemctl enable` | 设置服务开机自启 | `systemctl enable sshd` |
| `systemctl disable` | 禁止服务开机自启 | `systemctl disable sshd` |
| `systemctl is-active` | 检查服务是否活跃 | `systemctl is-active sshd` |
| `systemctl is-enabled` | 检查服务是否开机自启 | `systemctl is-enabled sshd` |
| `systemctl list-units` | 列出所有活跃的单位 | `systemctl list-units --type=service` |
| `systemctl list-unit-files` | 列出所有单位文件 | `systemctl list-unit-files --type=service` |

## 3. 网络管理命令

### 3.1 网络配置

| 命令 | 功能描述 | 示例 |
|------|----------|------|
| `ifconfig` | 显示或配置网络接口（旧版） | `ifconfig` |
| `ip` | 显示或配置网络接口（新版） | `ip addr show` |
| `ip a` | 显示网络接口信息（简写） | `ip a` |
| `ip route` | 显示或配置路由表 | `ip route show` |
| `ip r` | 显示路由表（简写） | `ip r` |
| `ping` | 测试网络连接 | `ping google.com` |
| `ping -c 4` | 发送指定数量的ICMP包 | `ping -c 4 google.com` |
| `traceroute` | 追踪数据包的路由路径 | `traceroute google.com` |
| `mtr` | 实时网络路径监控 | `mtr google.com` |
| `netstat` | 显示网络连接、路由表、接口统计等 | `netstat -tuln` |
| `ss` | 显示socket统计信息（替代netstat） | `ss -tuln` |
| `whois` | 查询域名注册信息 | `whois example.com` |
| `dig` | DNS查询工具 | `dig example.com` |
| `nslookup` | DNS查询工具 | `nslookup example.com` |
| `host` | DNS查询工具 | `host example.com` |

### 3.2 防火墙管理

| 命令 | 功能描述 | 示例 |
|------|----------|------|
| `firewall-cmd` | Firewalld防火墙管理命令 | `firewall-cmd --list-all` |
| `firewall-cmd --add-port` | 添加开放端口 | `firewall-cmd --add-port=3000/tcp --permanent` |
| `firewall-cmd --remove-port` | 移除开放端口 | `firewall-cmd --remove-port=3000/tcp --permanent` |
| `firewall-cmd --reload` | 重新加载防火墙规则 | `firewall-cmd --reload` |
| `iptables` | iptables防火墙管理命令 | `iptables -L -n` |
| `iptables -A INPUT -p tcp --dport 3000 -j ACCEPT` | 添加开放端口规则 | `iptables -A INPUT -p tcp --dport 3000 -j ACCEPT` |
| `iptables-save` | 保存iptables规则 | `iptables-save > /etc/iptables/rules.v4` |
| `ufw` | Uncomplicated Firewall（Ubuntu） | `ufw status` |
| `ufw allow 3000` | 允许3000端口 | `ufw allow 3000` |
| `ufw deny 3000` | 拒绝3000端口 | `ufw deny 3000` |

## 4. 用户和权限管理

### 4.1 用户管理

| 命令 | 功能描述 | 示例 |
|------|----------|------|
| `useradd` | 创建新用户 | `useradd newuser` |
| `useradd -m` | 创建新用户并生成家目录 | `useradd -m newuser` |
| `useradd -s` | 指定用户的默认shell | `useradd -s /bin/bash newuser` |
| `usermod` | 修改用户属性 | `usermod -aG sudo newuser` |
| `userdel` | 删除用户 | `userdel newuser` |
| `userdel -r` | 删除用户及其家目录 | `userdel -r newuser` |
| `passwd` | 修改用户密码 | `passwd newuser` |
| `passwd -l` | 锁定用户账户 | `passwd -l newuser` |
| `passwd -u` | 解锁用户账户 | `passwd -u newuser` |
| `chage` | 修改用户密码过期信息 | `chage -l newuser` |

### 4.2 组管理

| 命令 | 功能描述 | 示例 |
|------|----------|------|
| `groupadd` | 创建新组 | `groupadd newgroup` |
| `groupmod` | 修改组属性 | `groupmod -n newname oldname` |
| `groupdel` | 删除组 | `groupdel newgroup` |
| `gpasswd` | 管理组密码和成员 | `gpasswd -a newuser newgroup` |
| `gpasswd -d` | 从组中删除用户 | `gpasswd -d newuser newgroup` |
| `groups` | 显示用户所属的组 | `groups newuser` |
| `id` | 显示用户和组信息 | `id newuser` |
| `cat /etc/passwd` | 显示所有用户信息 | `cat /etc/passwd` |
| `cat /etc/group` | 显示所有组信息 | `cat /etc/group` |

## 5. 软件包管理

### 5.1 Debian/Ubuntu系统（apt）

| 命令 | 功能描述 | 示例 |
|------|----------|------|
| `apt update` | 更新软件包列表 | `sudo apt update` |
| `apt upgrade` | 升级所有可升级的软件包 | `sudo apt upgrade` |
| `apt install` | 安装软件包 | `sudo apt install nginx` |
| `apt remove` | 移除软件包 | `sudo apt remove nginx` |
| `apt purge` | 移除软件包及其配置文件 | `sudo apt purge nginx` |
| `apt autoremove` | 自动移除不再需要的依赖包 | `sudo apt autoremove` |
| `apt search` | 搜索软件包 | `apt search nginx` |
| `apt show` | 显示软件包详细信息 | `apt show nginx` |
| `apt list` | 列出已安装的软件包 | `apt list --installed` |

### 5.2 RedHat/CentOS系统（yum/dnf）

| 命令 | 功能描述 | 示例 |
|------|----------|------|
| `yum update` | 更新软件包（旧版） | `sudo yum update` |
| `dnf update` | 更新软件包（新版） | `sudo dnf update` |
| `yum install` | 安装软件包（旧版） | `sudo yum install nginx` |
| `dnf install` | 安装软件包（新版） | `sudo dnf install nginx` |
| `yum remove` | 移除软件包（旧版） | `sudo yum remove nginx` |
| `dnf remove` | 移除软件包（新版） | `sudo dnf remove nginx` |
| `yum search` | 搜索软件包（旧版） | `yum search nginx` |
| `dnf search` | 搜索软件包（新版） | `dnf search nginx` |
| `yum info` | 显示软件包详细信息（旧版） | `yum info nginx` |
| `dnf info` | 显示软件包详细信息（新版） | `dnf info nginx` |
| `yum list installed` | 列出已安装的软件包（旧版） | `yum list installed` |
| `dnf list installed` | 列出已安装的软件包（新版） | `dnf list installed` |

### 5.3 源码安装

| 命令 | 功能描述 | 示例 |
|------|----------|------|
| `./configure` | 配置源码包 | `./configure --prefix=/usr/local/nginx` |
| `make` | 编译源码 | `make` |
| `make install` | 安装编译好的程序 | `sudo make install` |
| `make clean` | 清理编译生成的文件 | `make clean` |

## 6. 压缩与解压

| 命令 | 功能描述 | 示例 |
|------|----------|------|
| `tar` | 归档工具 | `tar -cvf archive.tar files/` |
| `tar -x` | 解压归档 | `tar -xvf archive.tar` |
| `tar -z` | 使用gzip压缩/解压 | `tar -czvf archive.tar.gz files/` |
| `tar -j` | 使用bzip2压缩/解压 | `tar -cjvf archive.tar.bz2 files/` |
| `tar -J` | 使用xz压缩/解压 | `tar -cJvf archive.tar.xz files/` |
| `tar -t` | 查看归档内容 | `tar -tvf archive.tar.gz` |
| `gzip` | 使用gzip压缩文件 | `gzip file.txt` |
| `gunzip` | 解压gzip文件 | `gunzip file.txt.gz` |
| `bzip2` | 使用bzip2压缩文件 | `bzip2 file.txt` |
| `bunzip2` | 解压bzip2文件 | `bunzip2 file.txt.bz2` |
| `xz` | 使用xz压缩文件 | `xz file.txt` |
| `unxz` | 解压xz文件 | `unxz file.txt.xz` |
| `zip` | 创建zip压缩文件 | `zip archive.zip files/` |
| `unzip` | 解压zip文件 | `unzip archive.zip` |
| `unzip -l` | 查看zip文件内容 | `unzip -l archive.zip` |

## 7. 文本处理

| 命令 | 功能描述 | 示例 |
|------|----------|------|
| `echo` | 输出字符串 | `echo "Hello World"` |
| `echo -e` | 启用转义字符 | `echo -e "Line 1\nLine 2"` |
| `printf` | 格式化输出 | `printf "%s %d\n" "Hello" 123` |
| `sort` | 对文本行进行排序 | `sort file.txt` |
| `sort -r` | 逆序排序 | `sort -r file.txt` |
| `sort -n` | 按数值排序 | `sort -n numbers.txt` |
| `sort -u` | 去除重复行 | `sort -u file.txt` |
| `uniq` | 去除连续重复行 | `uniq file.txt` |
| `uniq -c` | 统计连续重复行的次数 | `uniq -c file.txt` |
| `cut` | 从文本行中提取字段 | `cut -d: -f1 /etc/passwd` |
| `paste` | 合并多个文件的列 | `paste file1.txt file2.txt` |
| `join` | 根据共同字段连接两个文件 | `join file1.txt file2.txt` |
| `sed` | 流编辑器，用于文本替换 | `sed 's/old/new/g' file.txt` |
| `sed -i` | 直接修改文件内容 | `sed -i 's/old/new/g' file.txt` |
| `awk` | 文本处理工具，用于数据提取和处理 | `awk '{print $1, $3}' file.txt` |
| `awk -F` | 指定字段分隔符 | `awk -F: '{print $1}' /etc/passwd` |
| `tr` | 字符转换工具 | `echo "HELLO" | tr 'A-Z' 'a-z'` |
| `xargs` | 将标准输入转换为命令参数 | `find /home -name "*.txt" | xargs rm` |

## 8. 磁盘管理

| 命令 | 功能描述 | 示例 |
|------|----------|------|
| `fdisk` | 磁盘分区工具 | `sudo fdisk -l` |
| `fdisk -l` | 列出所有磁盘和分区 | `sudo fdisk -l` |
| `parted` | 磁盘分区工具（支持GPT） | `sudo parted -l` |
| `mkfs` | 创建文件系统 | `sudo mkfs.ext4 /dev/sdb1` |
| `mkfs.ext4` | 创建ext4文件系统 | `sudo mkfs.ext4 /dev/sdb1` |
| `mkfs.xfs` | 创建XFS文件系统 | `sudo mkfs.xfs /dev/sdb1` |
| `mount` | 挂载文件系统 | `sudo mount /dev/sdb1 /mnt` |
| `umount` | 卸载文件系统 | `sudo umount /mnt` |
| `mount -a` | 挂载/etc/fstab中所有未挂载的文件系统 | `sudo mount -a` |
| `blkid` | 显示块设备的UUID和文件系统类型 | `sudo blkid` |
| `swapon` | 启用交换空间 | `sudo swapon /dev/sdb2` |
| `swapoff` | 禁用交换空间 | `sudo swapoff /dev/sdb2` |
| `mkswap` | 创建交换分区 | `sudo mkswap /dev/sdb2` |

## 9. 其他常用命令

| 命令 | 功能描述 | 示例 |
|------|----------|------|
| `history` | 显示命令历史 | `history` |
| `!n` | 执行历史命令中的第n条 | `!100` |
| `!!` | 执行上一条命令 | `!!` |
| `!command` | 执行最近以command开头的命令 | `!ls` |
| `Ctrl+R` | 反向搜索命令历史 | `Ctrl+R` |
| `alias` | 创建命令别名 | `alias ll='ls -la'` |
| `unalias` | 移除命令别名 | `unalias ll` |
| `which` | 显示命令的绝对路径 | `which ls` |
| `whereis` | 显示命令的二进制文件、源文件和手册页位置 | `whereis ls` |
| `man` | 显示命令的手册页 | `man ls` |
| `info` | 显示命令的详细信息 | `info ls` |
| `whatis` | 显示命令的简短描述 | `whatis ls` |
| `tput` | 终端控制工具 | `tput clear` |
| `clear` | 清屏 | `clear` |
| `reset` | 重置终端 | `reset` |
| `watch` | 定期执行命令并显示结果 | `watch -n 1 uptime` |
| `time` | 测量命令执行时间 | `time command` |
| `screen` | 终端多路复用器 | `screen -S session_name` |
| `tmux` | 终端多路复用器（替代screen） | `tmux new -s session_name` |
| `ssh` | 安全远程登录 | `ssh user@hostname` |
| `scp` | 安全复制文件 | `scp file.txt user@hostname:/path/` |
| `sftp` | 安全文件传输协议 | `sftp user@hostname` |
| `rsync` | 远程文件同步工具 | `rsync -avz local/ user@hostname:remote/` |

## 10. 常用快捷键

| 快捷键 | 功能描述 |
|--------|----------|
| `Ctrl+C` | 中断当前命令 |
| `Ctrl+Z` | 暂停当前命令，放入后台 |
| `Ctrl+D` | 退出当前终端或shell |
| `Ctrl+L` | 清屏 |
| `Ctrl+A` | 光标移到行首 |
| `Ctrl+E` | 光标移到行尾 |
| `Ctrl+U` | 删除从光标到行首的内容 |
| `Ctrl+K` | 删除从光标到行尾的内容 |
| `Ctrl+W` | 删除从光标到前一个单词的内容 |
| `Ctrl+Y` | 粘贴之前删除的内容 |
| `Ctrl+R` | 反向搜索命令历史 |
| `Tab` | 命令或文件名补全 |
| `Shift+PgUp` | 向上翻页 |
| `Shift+PgDn` | 向下翻页 |

## 11. 总结

本文介绍了Linux系统中最常用的命令，涵盖了文件管理、系统管理、网络管理、用户管理、软件包管理、压缩解压、文本处理、磁盘管理等方面。掌握这些命令对于后端开发者来说是非常重要的，可以提高工作效率，更好地管理和维护Linux服务器。

在实际使用中，建议通过`man`命令查看命令的详细手册，或者使用`--help`选项查看命令的简要帮助信息。通过不断实践和总结，可以逐渐掌握这些命令的使用技巧，成为一名熟练的Linux用户。