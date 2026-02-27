# Auto-hide new CMD windows
# Run this in background to suppress CMD popups

$hiddenWindows = @()

while ($true) {
    try {
        $cmdProcesses = Get-Process cmd -ErrorAction SilentlyContinue | Where-Object { 
            $_.StartTime -gt (Get-Date).AddMinutes(-2) 
        }
        
        foreach ($proc in $cmdProcesses) {
            # Check if recently started (within 2 minutes)
            if ($proc.StartTime -gt (Get-Date).AddMinutes(-2)) {
                # Try to minimize the window
                try {
                    $win = Get-Process -Id $proc.Id -ErrorAction SilentlyContinue | 
                        Where-Object { $_.MainWindowHandle -ne 0 }
                    if ($win) {
                        # Minimize the window
                        [void][Win32]::ShowWindow($win.MainWindowHandle, 6)
                        Write-Host "[Auto-Hide] Minimized CMD PID: $($proc.Id)"
                    }
                } catch {}
            }
        }
    } catch {}
    
    Start-Sleep -Seconds 5
}

# Win32 API declarations
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class Win32 {
    [DllImport("user32.dll")]
    public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
}
"@
