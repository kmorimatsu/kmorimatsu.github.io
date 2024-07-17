Attribute VB_Name = "TaskTray"
Option Explicit

Private Type NOTIFYICONDATA
    cbSize As Long            'NOTIFYCONDATA�̃T�C�Y
    hwnd As Long              '�E�B���h�E�n���h��
    uID As Long               '�h�c
    uFlags As Long            '�t���O
    uCallbackMessage As Long  '�������郁�b�Z�[�W
    hIcon As Long             '�A�C�R���̃n���h��
    szTip As String * 64         'ToolTip�e�L�X�g
End Type

'�A�C�R�����V�X�e���g���C�֕\��
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

    'ToolTip�e�L�X�g
    strTip = TrayCaption & Chr$(0)
    '�\���̃Z�b�g
    typNID = SetNotifyIconData(Form.hwnd, vbNull, NIF_MESSAGE Or NIF_ICON Or NIF_TIP, _
                                                                  WM_MOUSEMOVE, Form1.Icon, strTip)
    '�V�X�e���g���C�ւ̕\��
    Call Shell_NotifyIconA(NIM_ADD, typNID)
    '�t�H�[��������
    Form.Visible = False

End Sub

Public Sub GotoDesktop(Form As Object, LeaveIcon As Boolean)
    Dim typNID As NOTIFYICONDATA
    
    '�\���̃Z�b�g
    typNID = SetNotifyIconData(Form.hwnd, vbNull, NIF_MESSAGE Or NIF_ICON Or NIF_TIP, _
                                                                  vbNull, Form.Icon, "")
    '�V�X�e���g���C�̃A�C�R���폜
    If LeaveIcon = False Then Call Shell_NotifyIconA(NIM_DELETE, typNID)

End Sub

'�g�p��
'Call GoToTray(Me,"Test Program")
'Call GotoDesktop(Me, False)

'�ȉ��̓t�H�[���ł̎g�p��
'Private Sub Form_MouseMove(Button As Integer, Shift As Integer, x As Single, y As Single)

'    Dim hProcess As Long
'    '�������郁�b�Z�[�W��WM_MOUSEMOVE���w�肵���̂ŁA
'    '�ȉ��̏������E�������ł��܂��l�B
'    If Not Me.Visible Then
'        Select Case x \ Screen.TwipsPerPixelX
'            Case WM_LBUTTONDOWN
'                List1.AddItem "Left MouseDown"
'            Case WM_LBUTTONUP
'                List1.AddItem "Left MouseUp"
'            '���_�u���N���b�N�̂ݕ\��
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



