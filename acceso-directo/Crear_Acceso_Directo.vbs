' Crea dos accesos directos en el Escritorio:
'   1. "AllPetCR Web"        -> levanta el servidor de desarrollo (necesita Node)
'   2. "AllPetCR Web (vista)" -> abre la vista previa estatica del diseno,
'                                que funciona sin instalar nada.
' Uso: doble clic en este archivo UNA vez. Luego podes borrarlo.

Set oShell = CreateObject("WScript.Shell")
Set oFSO = CreateObject("Scripting.FileSystemObject")
strDesktop = oShell.SpecialFolders("Desktop")
strScriptDir = oFSO.GetParentFolderName(WScript.ScriptFullName)
strProjDir = oFSO.GetParentFolderName(strScriptDir)

Set oShortcut = oShell.CreateShortcut(strDesktop & "\AllPetCR Web.lnk")
oShortcut.TargetPath = strScriptDir & "\Iniciar_AllPetCR_Web.bat"
oShortcut.WorkingDirectory = strProjDir
oShortcut.IconLocation = strScriptDir & "\AllPetCR.ico"
oShortcut.Description = "Iniciar el servidor de desarrollo del sitio web AllPetCR"
oShortcut.Save

Set oPreview = oShell.CreateShortcut(strDesktop & "\AllPetCR Web (vista previa).lnk")
oPreview.TargetPath = strProjDir & "\PREVIEW-diseno.html"
oPreview.WorkingDirectory = strProjDir
oPreview.IconLocation = strScriptDir & "\AllPetCR.ico"
oPreview.Description = "Ver el diseno del sitio sin necesidad de Node"
oPreview.Save

MsgBox "Listo. Se crearon dos accesos directos en el Escritorio:" & vbCrLf & vbCrLf & _
       "  - AllPetCR Web  (levanta el servidor, necesita Node)" & vbCrLf & _
       "  - AllPetCR Web (vista previa)  (funciona ya mismo)", 64, "AllPetCR Web"
