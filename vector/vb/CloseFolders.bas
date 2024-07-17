Attribute VB_Name = "CloseFolders"
Option Explicit

Declare Function EnumWindows Lib "user32" _
  (ByVal lpEnumFunc As Long, lParam As Any) As Long
Declare Function IsWindowVisible Lib "user32" _
  (ByVal hwnd As Long) As Long
  
Declare Function SendMessage Lib "user32" Alias "SendMessageA" _
  (ByVal hwnd As Long, ByVal Msg As Long, ByVal wParam As Long, lParam As Any) As Long
Const WM_SYSCOMMAND = &H112
Const SC_CLOSE = &HF060

Declare Function GetClassName Lib "user32" Alias "GetClassNameA" (ByVal hwnd As Long, ByVal lpClassName As String, ByVal nMaxCount As Long) As Long

Dim hWndL() As Long
Dim NumOfFolders As Integer

Public Sub CloseAllFolders()
    Dim i As Integer
    NumOfFolders = 0
    Call EnumWindows(AddressOf EnumWinProc, 0&)
    For i = 1 To NumOfFolders
        Call SendMessage(hWndL(i), WM_SYSCOMMAND, SC_CLOSE, 0)
    Next i
End Sub

Public Function EnumWinProc _
  (ByVal hWndX As Long, lParam As Long) As Boolean
    Dim T As String
    If IsWindowVisible(hWndX) Then
        T = String(1024, 0)
        Call GetClassName(hWndX, T, Len(T))
        T = Left$(T, InStr(1, T, Chr(0)) - 1)
        If T = "CabinetWClass" Then
            NumOfFolders = NumOfFolders + 1
            ReDim Preserve hWndL(NumOfFolders)
            hWndL(NumOfFolders) = hWndX
        End If
    End If
    EnumWinProc = True
End Function
