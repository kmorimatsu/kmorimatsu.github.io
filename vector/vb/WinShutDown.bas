Attribute VB_Name = "WShutDown"
Option Explicit

Public Declare Function ExitWindowsEx Lib "User32" ( _
  ByVal uFlags As Long, _
  ByVal dwReserved As Long _
) As Long
        '-----------------------引数--------------------------------
'Const
Public Const EWX_LOGOFF = 0 '現在のユーザーをログオフ
Public Const EWX_SHUTDOWN = 1 '電源を切っても大丈夫な状態にする
Public Const EWX_REBOOT = 2 'システムを再起動
Public Const EWX_FORCE = 4 '他のアプリケーションのプロセスを強制的に終了
Public Const EWX_POWEROFF = 8
'関数が成功すると､0 以外の値が返り、関数が失敗すると､0 が返る

'使用法：ret=WinShutDown(lngOption)


'以下、特権設定用
'Struct
Type OSVERSIONINFO
    dwOSVersionInfoSize As Long
    dwMajorVersion As Long
    dwMinorVersion As Long
    dwBuildNumber As Long
    dwPlatformId As Long
    szCSDVersion(127) As Byte
End Type

Type LUID
    LowPart As Long
    HighPart As Long
End Type

Type LUID_AND_ATTRIBUTES
    LocalUID As LUID
    Attributes As Long
End Type

Type TOKEN_PRIVILEGES
    PrivilegeCount As Long
    Privileges(0) As LUID_AND_ATTRIBUTES
End Type

'API
Public Declare Function GetVersionEx Lib "kernel32" Alias "GetVersionExA" ( _
  ByRef VersionInfo As OSVERSIONINFO _
) As Long

Public Declare Function GetCurrentProcess Lib "kernel32" () As Long




Public Declare Function OpenProcessToken Lib "advapi32" ( _
  ByVal ProcessHandle As Long, _
  ByVal DesiredAccess As Long, _
  ByRef TokenHandle As Long _
) As Long

Public Declare Function LookupPrivilegeValue Lib "advapi32" Alias "LookupPrivilegeValueA" ( _
  ByVal lpSystemName As String, _
  ByVal lpName As String, _
  ByRef lpLuid As LUID _
) As Long

Public Declare Function AdjustTokenPrivileges Lib "advapi32" ( _
  ByVal TokenHandle As Long, _
  ByVal DisableAllPrivileges As Long, _
  ByRef NewState As TOKEN_PRIVILEGES, _
  ByVal BufferLength As Long, _
  ByVal PreviousState As Long, _
  ByVal ReturnLength As Long _
) As Long

'Const(Local)
Const VER_PLATFORM_WIN32_WINDOWS = 1
Const VER_PLATFORM_WIN32_NT = 2

Const TOKEN_QUERY = &H8
Const TOKEN_ADJUST_PRIVILEGES = &H20

Const SE_PRIVILEGE_ENABLED = &H2

Public Function WinShutDown(lngOption As Long) As Long

    Dim hToken As Long
    Dim tkp As TOKEN_PRIVILEGES
    Dim luaa(0) As LUID_AND_ATTRIBUTES

    'OS判別
    Dim osvi As OSVERSIONINFO

    osvi.dwOSVersionInfoSize = Len(osvi)

    Call GetVersionEx(osvi)

    If osvi.dwPlatformId = VER_PLATFORM_WIN32_NT Then

        'Win NT
        Call OpenProcessToken(GetCurrentProcess, TOKEN_QUERY + TOKEN_ADJUST_PRIVILEGES, hToken)

        Call LookupPrivilegeValue("", "SeShutdownPrivilege", luaa(0).LocalUID)

        luaa(0).Attributes = SE_PRIVILEGE_ENABLED

        tkp.PrivilegeCount = 1
        tkp.Privileges(0) = luaa(0)

        Call AdjustTokenPrivileges(hToken, False, tkp, 0, 0, 0)  '後半3パラメータは実質不使用

    End If

    WinShutDown = ExitWindowsEx(lngOption, 0)

End Function
