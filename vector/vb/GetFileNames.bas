Attribute VB_Name = "Module1"
Option Explicit

Dim FileNames() As String

Private FileNum As Integer

Sub GetFileNames()
    Dim T As String, a As Integer, b As Integer
    T = Command
    If T = "" Then
        MsgBox ("need Drag & Drop")
        End
    End If
    T = T + " "
    Do Until T = ""
        FileNum = FileNum + 1
        ReDim Preserve FileNames(FileNum)
        If Left$(T, 1) = Chr(&H22) Then '"" mode
            a = InStr(2, T, Chr(&H22))
            FileNames(FileNum) = Mid$(T, 2, a - 2)
            T = Mid$(T, a + 2)
        Else 'non-"" mode
            a = InStr(1, T, " ")
            FileNames(FileNum) = Left$(T, a - 1)
            T = Mid$(T, a + 1)
        End If
    Loop
End Sub
