VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "StringEachLine"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = True
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Attribute VB_Ext_KEY = "SavedWithClassBuilder" ,"Yes"
Attribute VB_Ext_KEY = "Top_Level" ,"Yes"
Private ff As Integer
Private fn As String
'/*--Example--*/
'Dim SEL As StringEachLine
'Set SEL = New StringEachLine
'SEL.SetString (T)
'Do Until SEL.EndOfFile
'   T = SEL.NextLine
'
'loop


Public Sub SetString(T)
    Close #ff
    Open fn For Output As #ff
    Print #ff, T;
    Close #ff
    Open fn For Input Lock Read Write As #ff
End Sub
Public Function NextLine() As String
    If Seek(ff) <= LOF(ff) Then Line Input #ff, NextLine
End Function
Public Function EndOfFile() As Boolean
    EndOfFile = Seek(ff) > LOF(ff)
End Function
Private Sub Class_Initialize()
    On Error Resume Next
    ff = FreeFile
    Do
        Err.Clear
        fn = Environ("TEMP")
        If Left$(fn, 1) <> "\" Then fn = fn + "\"
        fn = fn + "smd" + Format(Timer) + Format(Int(Rnd * 100))
        Open fn For Output As #ff
    Loop Until Err.Number = 0
End Sub

Private Sub Class_Terminate()
    On Error Resume Next
    Close #ff
    Kill fn
End Sub
