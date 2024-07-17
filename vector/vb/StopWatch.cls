VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "StopWatch"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = True
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Private StartTime As Single, CurTime As Single
Private Moving As Boolean
'/*--Example--*/
'Dim SW As StopWatch
'Set SW = New StopWatch
'SW.StartTimer
'Do until SW.CurrentTime>10
'    DoEvents
'Loop

Public Sub ResetTimer()
    CurTime = 0
    Moving = False
End Sub
Public Sub StartTimer()
    Moving = True
    StartTime = Timer
End Sub
Public Sub StopTimer()
    Moving = False
    If Timer < StartTime Then StartTime = StartTime - 86400
    CurTime = CurTime + Timer - StartTime
End Sub
Public Function CurrentTime() As Single
    If Moving Then
        If Timer < StartTime Then StartTime = StartTime - 86400
        CurrentTime = CurTime + Timer - StartTime
    Else
        CurrentTime = CurTime
    End If
End Function
Private Sub Class_Initialize()
    CurTime = 0
    StartTimer
End Sub
