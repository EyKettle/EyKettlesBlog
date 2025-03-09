# git 操作超时

## 解决方案

在用户文件夹下的**.ssh**文件夹下创建下述文件：

- **文件地址** C:\Users\\`用户名`\\.ssh\config

```config
Host github.com
    User git
    HostName ssh.github.com
    Port 443
    PreferredAuthentications publickey
    IdentityFile ~/.ssh/id_rsa
```
