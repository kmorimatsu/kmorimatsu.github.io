Attribute VB_Name = "CdTrayOpenClose"
Public Declare Function mciSendString Lib "winmm.dll" Alias "mciSendStringA" (ByVal lpstrCommand As String, ByVal lpSectorsPerCluster As String, ByVal uReturcdReturnth As Long, ByVal hwndCallback As Long) As Long

Public Function OpenTray() As Long
  
    Dim cdCommand As String '�R�}���h������
    Dim cdCallback As Long
    Dim cdReturnString As String * 255
    Dim cdReturn As Long

    cdCommand = "set cdaudio door open" 'CD�g���C���I�[�v��

    OpenTray = mciSendString(cdCommand, cdReturnString, cdReturn, cdCallback)
    '�J�ɐ�������΁A0 ��Ԃ�

End Function

Public Function CloseTray() As Long
  
    Dim cdCommand As String '�R�}���h������
    Dim cdCallback As Long
    Dim cdReturnString As String * 255
    Dim cdReturn As Long

    cdCommand = "set cdaudio door closed" 'CD�g���C���N���[�Y

    CloseTray = mciSendString(cdCommand, cdReturnString, cdReturn, cdCallback)
    '�J�ɐ�������΁A0 ��Ԃ�

End Function

'Sub main()
'    Call OpenTray
'    Call CloseTray
'End Sub
