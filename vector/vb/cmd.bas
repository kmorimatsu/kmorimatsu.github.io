Attribute VB_Name = "cmd"
Public Declare Function GetOpenFileName Lib "comdlg32.dll" Alias "GetOpenFileNameA" (pOpenfilename As OPENFILENAME) As Long
Public Declare Function GetSaveFileName Lib "comdlg32.dll" Alias "GetSaveFileNameA" (pOpenfilename As OPENFILENAME) As Long
Public Type OPENFILENAME
    lStructSize As Long
    hwndOwner As Long
    hInstance As Long
    lpstrFilter As String
    lpstrCustomFilter As String
    nMaxCustFilter As Long
    nFilterIndex As Long
    lpstrFile As String
    nMaxFile As Long
    lpstrFileTitle As String
    nMaxFileTitle As Long
    lpstrInitialDir As String
    lpstrTitle As String
    flags As Long
    nFileOffset As Integer
    nFileExtension As Integer
    lpstrDefExt As String
    lCustData As Long
    lpfnHook As Long
    lpTemplateName As String
End Type

Public Const OFN_OVERWRITEPROMPT = &H2 '�㏑���̃`�F�b�N
Public Const OFN_HIDEREADONLY = &H4    '�ǎ��p�`�F�b�N�{�b�N�X���B��

Private OpenFile As OPENFILENAME

'�t�@�C���ۑ��p�_�C�A���O�̕\��
Public Function fncSaveFileDialog(ByRef strFName As String) As Boolean
    fncSaveFileDialog = False
    On Error GoTo Err_fncSaveFileDialog
    Dim lReturn As Long
   
    OpenFile.lpstrTitle = "Save as"
    OpenFile.flags = OFN_OVERWRITEPROMPT Or OFN_HIDEREADONLY   '�㏑���̃`�F�b�N
    lReturn = GetSaveFileName(OpenFile)
    If lReturn = 0 Then
        strFName = ""
    Else
        strFName = OpenFile.lpstrFile
        strFName = Left(strFName, InStr(1, strFName + Chr(0), Chr(0)) - 1)
        fncSaveFileDialog = True
    End If
   
Err_fncSaveFileDialog:
    Exit Function

End Function

'OPENFILENAME�\���̂̒l�̐ݒ�
Public Function fncSetOpenFileName(FhWnd As Long, strFilter As String, Optional InitialDir As String, Optional DefaultFileName As String) As OPENFILENAME
    If InitialDir <> "" Then
        OpenFile.lpstrInitialDir = InitialDir
    Else
        OpenFile.lpstrInitialDir = CurDir
    End If
    OpenFile.lStructSize = Len(OpenFile)
    OpenFile.hwndOwner = FhWnd
    OpenFile.lpstrFilter = strFilter
    OpenFile.nFilterIndex = 1
    OpenFile.lpstrFile = DefaultFileName + String(256, 0)
    OpenFile.nMaxFile = Len(OpenFile.lpstrFile) - 1
    OpenFile.lpstrDefExt = ""
    fncSetOpenFileName = OpenFile
End Function


'�t�@�C���I�[�v���_�C�A���O��\��
Public Function fncOpenFileDialog(ByRef strFName As String) As Boolean
    fncOpenFileDialog = False
    On Error GoTo Err_fncOpenFileDialog
    
    Dim lReturn As Long

    OpenFile.lpstrTitle = "Open File"
    OpenFile.flags = OFN_HIDEREADONLY           '�ǂݍ��ݐ�p
    lReturn = GetOpenFileName(OpenFile)
    If lReturn = 0 Then
        strFName = ""
    Else
        strFName = OpenFile.lpstrFile
        strFName = Left(strFName, InStr(1, strFName + Chr(0), Chr(0)) - 1)
        fncOpenFileDialog = True
    End If
Err_fncOpenFileDialog:
    Exit Function
    
End Function


