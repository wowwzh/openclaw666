' 隐藏窗口启动 Node.js 脚本
' 将此文件保存为 hidden_start.vbs

Set WshShell = CreateObject("WScript.Shell")

' 获取命令行参数
If WScript.Arguments.Count > 0 Then
    cmd = "node "
    For i = 0 to WScript.Arguments.Count - 1
        If InStr(WScript.Arguments(i), " ") > 0 Then
            cmd = cmd & """" & WScript.Arguments(i) & """ "
        Else
            cmd = cmd & WScript.Arguments(i) & " "
        End If
    Next
    
    ' 用 cmd /c start /b 启动，0 表示隐藏窗口
    WshShell.Run cmd, 0, False
End If
