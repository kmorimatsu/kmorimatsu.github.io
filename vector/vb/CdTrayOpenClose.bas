Attribute VB_Name = "CdTrayOpenClose"
Public Declare Function mciSendString Lib "winmm.dll" Alias "mciSendStringA" (ByVal lpstrCommand As String, ByVal lpSectorsPerCluster As String, ByVal uReturcdReturnth As Long, ByVal hwndCallback As Long) As Long

Public Function OpenTray() As Long
  
    Dim cdCommand As String 'コマンド文字列
    Dim cdCallback As Long
    Dim cdReturnString As String * 255
    Dim cdReturn As Long

    cdCommand = "set cdaudio door open" 'CDトレイをオープン

    OpenTray = mciSendString(cdCommand, cdReturnString, cdReturn, cdCallback)
    '開閉に成功すれば、0 を返す

End Function

Public Function CloseTray() As Long
  
    Dim cdCommand As String 'コマンド文字列
    Dim cdCallback As Long
    Dim cdReturnString As String * 255
    Dim cdReturn As Long

    cdCommand = "set cdaudio door closed" 'CDトレイをクローズ

    CloseTray = mciSendString(cdCommand, cdReturnString, cdReturn, cdCallback)
    '開閉に成功すれば、0 を返す

End Function

'Sub main()
'    Call OpenTray
'    Call CloseTray
'End Sub
