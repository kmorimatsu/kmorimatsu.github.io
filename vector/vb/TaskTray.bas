Attribute VB_Name = "TaskTray"
Option Explicit

Private Type NOTIFYICONDATA
    cbSize As Long            'NOTIFYCONDATAのサイズ
    hwnd As Long              'ウィンドウハンドル
    uID As Long               'ＩＤ
    uFlags As Long            'フラグ
    uCallbackMessage As Long  '処理するメッセージ
    hIcon As Long             'アイコンのハンドル
    szTip As String * 64         'ToolTipテキスト
End Type

'アイコンをシステムトレイへ表示
Private Declare Function Shell_NotifyIconA Lib "SHELL32" _
       (ByVal dwMessage As Long, lpData As NOTIFYICONDATA) As Integer

Private Const NIM_ADD = 0
Private Const NIM_MODIFY = 1
Private Const NIM_DELETE = 2
Private Const NIF_MESSAGE = 1
Private Const NIF_ICON = 2
Private Const NIF_TIP = 4

Private Const WM_MOUSEMOVE = &H200
Private Const WM_LBUTTONDOWN = &H201
Private Const WM_LBUTTONUP = &H202
Private Const WM_LBUTTONDBLCLK = &H203
Private Const WM_RBUTTONDOWN = &H204
Private Const WM_RBUTTONUP = &H205
Private Const WM_RBUTTONDBLCLK = &H206
Private Const WM_MBUTTONDOWN = &H207
Private Const WM_MBUTTONUP = &H208
Private Const WM_MBUTTONDBLCLK = &H209


Private Function SetNotifyIconData(hwnd As Long, ID As Long, Flags As Long, _
                          CallbackMessage As Long, Icon As Long, Tip As String) As NOTIFYICONDATA
    Dim typNID As NOTIFYICONDATA

    typNID.cbSize = Len(typNID)
    typNID.hwnd = hwnd
    typNID.uID = ID
    typNID.uFlags = Flags
    typNID.uCallbackMessage = CallbackMessage
    typNID.hIcon = Icon
    typNID.szTip = Tip

    SetNotifyIconData = typNID

End Function

Public Sub GoToTray(Form As Object, TrayCaption As String)
    Dim typNID As NOTIFYICONDATA
    Dim strTip As String

    'ToolTipテキスト
    strTip = TrayCaption & Chr$(0)
    '構造体セット
    typNID = SetNotifyIconData(Form.hwnd, vbNull, NIF_MESSAGE Or NIF_ICON Or NIF_TIP, _
                                                                  WM_MOUSEMOVE, Form1.Icon, strTip)
    'システムトレイへの表示
    Call Shell_NotifyIconA(NIM_ADD, typNID)
    'フォームを消す
    Form.Visible = False

End Sub

Public Sub GotoDesktop(Form As Object, LeaveIcon As Boolean)
    Dim typNID As NOTIFYICONDATA
    
    '構造体セット
    typNID = SetNotifyIconData(Form.hwnd, vbNull, NIF_MESSAGE Or NIF_ICON Or NIF_TIP, _
                                                                  vbNull, Form.Icon, "")
    'システムトレイのアイコン削除
    If LeaveIcon = False Then Call Shell_NotifyIconA(NIM_DELETE, typNID)

End Sub

'使用例
'Call GoToTray(Me,"Test Program")
'Call GotoDesktop(Me, False)

'以下はフォームでの使用例
'Private Sub Form_MouseMove(Button As Integer, Shift As Integer, x As Single, y As Single)

'    Dim hProcess As Long
'    '処理するメッセージでWM_MOUSEMOVEを指定したので、
'    '以下の処理を拾う事ができますネ。
'    If Not Me.Visible Then
'        Select Case x \ Screen.TwipsPerPixelX
'            Case WM_LBUTTONDOWN
'                List1.AddItem "Left MouseDown"
'            Case WM_LBUTTONUP
'                List1.AddItem "Left MouseUp"
'            '左ダブルクリックのみ表示
'            Case WM_LBUTTONDBLCLK
'                List1.AddItem "Left DoubleClick"
'                Form1.Visible = True
'                Form1.WindowState = vbNormal
'            Case WM_RBUTTONDOWN
'                List1.AddItem "Right MouseDown"
'            Case WM_RBUTTONUP
'                List1.AddItem "Right MouseUp"
'            Case WM_RBUTTONDBLCLK
'                List1.AddItem "Right DoubleClick"
'        End Select
'    End If
'
'End Sub



