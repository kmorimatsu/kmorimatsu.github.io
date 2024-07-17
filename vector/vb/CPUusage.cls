VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "CPUusage"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = True
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
'CPUusage.cls
'使用例
'Dim C as CPUusage
'Set C = New CPUusage
'→C.UserCPU で使用率(%)が取得できる

Option Explicit
'-------------------------------------------------------------------------------------
'   Windows API プロトタイプの宣言
'-------------------------------------------------------------------------------------
Private Declare Function GetModuleHandle Lib "kernel32" Alias "GetModuleHandleA" _
    (ByVal ModuleName As String) As Long
Private Declare Function GetProcAddress Lib "kernel32" (ByVal hMod As Long, _
    ByVal FuncName As String) As Long
Private Declare Function NtQuerySystemInformation Lib "ntdll" (ByVal Func As Long, _
    ByRef Buff As Long, ByVal Code As Long, ByVal Dummy As Long) As Long
Private Declare Function RegOpenKey Lib "advapi32" Alias "RegOpenKeyA" _
    (ByVal hKey As Long, ByVal lpSubKey As String, ByRef phkResult As Long) As Long
Private Declare Function RegCloseKey Lib "advapi32" (ByVal hKey As Long) As Long
Private Declare Function RegQueryValueEx Lib "advapi32" Alias "RegQueryValueExA" _
    (ByVal hKey As Long, ByVal lpValueName As String, ByRef lpReserved As Long, _
    ByRef lpType As Long, ByRef lpData As Any, ByRef lpcbData As Long) As Long
Private Const HKEY_DYN_DATA = &H80000006
Private Declare Function SetTimer Lib "user32" (ByVal hWnd As Long, _
    ByVal idTimer As Long, ByVal uTimeout As Long, ByVal tmProc As Long) As Long
Private Declare Function KillTimer Lib "user32" (ByVal hWnd As Long, _
    ByVal idEvent As Long) As Long
'-------------------------------------------------------------------------------------
'   作業エリア
'-------------------------------------------------------------------------------------
Private cpu_ As Long          'Cpu Numbers
Private x_(0 To 8) As Double  'A
Private y_(0 To 8) As Double  'B - A
Private z_(0 To 8) As Double  'B + C
Private hKey_ As Long         'Key Handler for Win9x
'-------------------------------------------------------------------------------------
'   0:全CPU、1～8:各CPUの使用率を表す
'-------------------------------------------------------------------------------------
Private usr_(0 To 8) As Long  'Percent of User Cpu
Private ker_(0 To 8) As Long  'Percent of Kernel Cpu

'-------------------------------------------------------------------------------------
'   分離された６４ビット整数を倍精度浮動小数点に変換
'    66665555555555444444444433333333322222222221111111111
'    3210987654321098765432109876543210987654321098765432109876543210
'   +----------------------------------------------------------------+
'   |SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXsxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx|
'   +----------------------------------------------------------------+
'    <------------ upp -------------><------------- low ------------>
'
'   +----------------------------------------------------------------+
'(a)|                               XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX00|
'   +----------------------------------------------------------------+
'   +----------------------------------------------------------------+
'(b)|                               XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXs0|
'   +----------------------------------------------------------------+
'   +----------------------------------------------------------------+
'(c)|                                 xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx|
'   +----------------------------------------------------------------+
'   +----------------------------------------------------------------+
'(d)| XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXsxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx|
'   +----------------------------------------------------------------+
'注意:データの符号は配慮していません。(2**63)-1までの符号なしデータ
'-------------------------------------------------------------------------------------
Private Function Lng64toDbl(ByVal low As Long, ByVal upp As Long) As Double
    '２回に分けて上位ワードをシフト処理する
    Lng64toDbl = upp * 4                        '(a)
    If low < 0 Then
        '下位ワードの符号を重みに変換する
        Lng64toDbl = Lng64toDbl + 2             '(b)
        '下位ワードの重みのパターンを維持して符号を消去する
        low = 0 - (&H80000000 - low)            '(c)
    End If
    '正数の最大値でシフト処理を行い、重みを正しい位置に移動し下位ワードと合算する
    Lng64toDbl = Lng64toDbl * &H40000000 + low  '(d)
End Function
'-------------------------------------------------------------------------------------
'   CPU数を得る（ＮＴ系でない時は０を返す）
'-------------------------------------------------------------------------------------
Private Function GetCpu() As Long
    GetCpu = 0
    Dim hMod As Long
    hMod = GetModuleHandle("ntdll.dll")
    If hMod <> 0 Then
        Dim pNtq As Long
        pNtq = GetProcAddress(hMod, "NtQuerySystemInformation")
        If pNtq <> 0 Then
            Dim Buff(0 To 511) As Long
            Dim ret As Long
            ret = NtQuerySystemInformation(0, Buff(0), 44, 0)
            If ret = 0 Then
                GetCpu = Buff(10) Mod 256
            End If
        End If
    End If
End Function
'-------------------------------------------------------------------------------------
'   CPU状態の取得（初回のみ）
'-------------------------------------------------------------------------------------
Private Sub GetCpuStatus1st()
    Dim Buff(0 To 511) As Long
    Dim ret As Long
    ret = NtQuerySystemInformation(8, Buff(0), 1536, 0)
    usr_(0) = 0
    ker_(0) = 0
    x_(0) = 0
    y_(0) = 0
    z_(0) = 0
    Dim i As Long
    For i = 1 To cpu_
        usr_(i) = 0
        ker_(i) = 0
        Dim off As Long
        off = (i - 1) * 12
        Dim a As Double, b As Double, C As Double
        a = Lng64toDbl(Buff(off + 0), Buff(off + 1))
        b = Lng64toDbl(Buff(off + 2), Buff(off + 3))
        C = Lng64toDbl(Buff(off + 4), Buff(off + 5))
        x_(i) = a
        y_(i) = b - a
        z_(i) = b + C
        x_(0) = x_(0) + x_(i)
        y_(0) = y_(0) + y_(i)
        z_(0) = z_(0) + z_(i)
    Next i
End Sub
'-------------------------------------------------------------------------------------
'   CPU状態の取得（２回目以降）
'-------------------------------------------------------------------------------------
Private Sub GetCpuStatus2nd()
    Dim Buff(0 To 511) As Long
    Dim ret As Long
    ret = NtQuerySystemInformation(8, Buff(0), 1536, 0)
    Dim dx As Double, dy As Double, dz As Double
    Dim tx As Double, ty As Double, tz As Double
    tx = 0
    ty = 0
    tz = 0
    Dim i As Long
    For i = 1 To cpu_
        Dim off As Long
        off = (i - 1) * 12
        Dim a As Double, b As Double, C As Double
        Dim X As Double, Y As Double, z As Double
        a = Lng64toDbl(Buff(off + 0), Buff(off + 1))
        b = Lng64toDbl(Buff(off + 2), Buff(off + 3))
        C = Lng64toDbl(Buff(off + 4), Buff(off + 5))
        X = a
        Y = b - a
        z = b + C
        dx = X - x_(i)  '各CPUの前回との差分
        dy = Y - y_(i)  '各CPUの前回との差分
        dz = z - z_(i)  '各CPUの前回との差分
        tx = tx + X
        ty = ty + Y
        tz = tz + z
        usr_(i) = 100 - dx / dz * 100
        ker_(i) = dy / dz * 100
        x_(i) = X
        y_(i) = Y
        z_(i) = z
    Next i
    dx = tx - x_(0)     '全CPUの前回との差分
    dy = ty - y_(0)     '全CPUの前回との差分
    dz = tz - z_(0)     '全CPUの前回との差分
    usr_(0) = 100 - dx / dz * 100
    ker_(0) = dy / dz * 100
    x_(0) = tx
    y_(0) = ty
    z_(0) = tz
End Sub

Public Function UserCPU() As Long
    Call RefreshStatus
    UserCPU = usr_(0)
End Function

Public Function KernelCPU() As Long
    Call RefreshStatus
    KernelCPU = ker_(0)
End Function

Private Sub RefreshStatus()
    Dim ret As Long
    If cpu_ <> 0 Then   'WinNT系
        Call GetCpuStatus2nd
    Else                'Win9x系
        Dim dsize As Long
        dsize = 4
        ret = RegQueryValueEx(hKey_, "KERNEL\CPUUsage", 0, 0, usr_(0), dsize)
        ker_(0) = 0
    End If
End Sub

'-------------------------------------------------------------------------------------
'   CPU状態の取得のセットアップ
'-------------------------------------------------------------------------------------
Private Sub Class_Initialize()
    Dim ret As Long
    cpu_ = GetCpu()
    If cpu_ <> 0 Then   'WinNT系
        Call GetCpuStatus1st
    Else                'Win9x系
        Dim hDummy As Long
        Dim dsize As Long
        ret = RegOpenKey(HKEY_DYN_DATA, "PerfStats\StatData", hKey_)
        ret = RegOpenKey(HKEY_DYN_DATA, "PerfStats\StartStat", hDummy)
        dsize = 4
        ret = RegQueryValueEx(hDummy, "KERNEL\CPUUsage", 0, 0, usr_(0), dsize)
        ret = RegCloseKey(hDummy)
        ker_(0) = 0
    End If
End Sub

'-------------------------------------------------------------------------------------
'   CPU状態の取得のラップアップ
'-------------------------------------------------------------------------------------
Private Sub Class_Terminate()
    Dim ret As Long
    If cpu_ <> 0 Then   'WinNT系
    Else                'Win9x系
        Dim hDummy As Long
        Dim dsize As Long
        ret = RegOpenKey(HKEY_DYN_DATA, "PerfStats\StopStat", hDummy)
        dsize = 4
        ret = RegQueryValueEx(hDummy, "KERNEL\CPUUsage", 0, 0, usr_(0), dsize)
        ret = RegCloseKey(hDummy)
        ret = RegCloseKey(hKey_)
    End If
End Sub
