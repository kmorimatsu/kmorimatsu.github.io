Attribute VB_Name = "WShutDown"
Option Explicit

Public Declare Function ExitWindowsEx Lib "User32" ( _
  ByVal uFlags As Long, _
  ByVal dwReserved As Long _
) As Long
        '-----------------------����--------------------------------
'Const
Public Const EWX_LOGOFF = 0 '���݂̃��[�U�[�����O�I�t
Public Const EWX_SHUTDOWN = 1 '�d����؂��Ă����v�ȏ�Ԃɂ���
Public Const EWX_REBOOT = 2 '�V�X�e�����ċN��
Public Const EWX_FORCE = 4 '���̃A�v���P�[�V�����̃v���Z�X�������I�ɏI��
Public Const EWX_POWEROFF = 8
'�֐�����������Ƥ0 �ȊO�̒l���Ԃ�A�֐������s����Ƥ0 ���Ԃ�

'�g�p�@�Fret=WinShutDown(lngOption)


'�ȉ��A�����ݒ�p
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

    'OS����
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

        Call AdjustTokenPrivileges(hToken, False, tkp, 0, 0, 0)  '�㔼3�p�����[�^�͎����s�g�p

    End If

    WinShutDown = ExitWindowsEx(lngOption, 0)

End Function
