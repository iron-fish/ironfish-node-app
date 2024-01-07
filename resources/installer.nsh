!include LogicLib.nsh

!macro customInstall
  Var /GLOBAL isInstalled
  File /oname=$PLUGINSDIR\vc_redist.x64.exe "${BUILD_RESOURCES_DIR}\vc_redist.x64.exe"
  
  ReadRegDWORD $isInstalled HKLM "SOFTWARE\Wow6432Node\Microsoft\VisualStudio\14.0\VC\Runtimes\x64" "Installed"

  ${If} $isInstalled != "1"
    ExecWait "$PLUGINSDIR\vc_redist.x64.exe /install /quiet /norestart"
  ${EndIf}
!macroend
