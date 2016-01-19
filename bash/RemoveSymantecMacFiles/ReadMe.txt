********* RemoveSymantecMacFiles.command 7.0.46 *********

WARNING: This script will remove all files and folders created by Symantec
         Mac OS X products (LiveUpdate Administration Utility files) and
         any files within those folders. Therefore, you will lose ALL files
         that reside in those folders, including any that you have created.

Usage:   RemoveSymantecMacFiles.command [-CcdeFfghIikLlmpQqRrV] [-QQ] [-re] [volume ...]

Summary: If no option or volume is specified, then all Symantec files are
         removed from the current boot volume, including the invisible
         Symantec files (i.e., AntiVirus QuickScan and Norton FS files),
         and Symantec crontab entries are removed from all users' crontabs;
         otherwise, for each volume specified, all Symantec files and
         Symantec crontab entries will be removed from that volume if no
         options are specified. If files are removed from the current boot
         volume, receipt predelete scripts are run unless -d is passsed
         and Symantec processes are killed unless -k is passed.

         If a volume does not have OS X installed on it, then only the
         invisible Symantec files are removed from that volume.

         Each volume name may begin with "/Volumes/", unless it is "/".
         The easiest way to specify a volume is to drag the volume onto the
         Terminal window.

Note:    The Terminal application does not support high ASCII or
         double-byte character entry via keyboard or via drag-and-drop.
         If you want to have files removed from a volume that is not
         the current boot volume and that has a name containing high
         ASCII or double-byte characters, use the -A option.

Options: -A     Remove all Symantec files from all mounted volumes.
                Crontab entries are also removed from the current boot
                volume, but not from other volumes. If a volume does not
                have OS X installed on it, then only the invisible Symantec
                files are removed from that volume.
         -C     Do not remove crontab entries.
         -c     Only remove crontab entries from all users' crontabs.
                Nothing is removed from any volume.
         -d     Bypass the running of receipt predelete scripts. It is best
                to have predelete scripts run for more thorough uninstalls.
         -e     Show errors when run predelete scripts are run. Predelete
                scripts are run only when removing files from the current
                boot volume.
         -F     List only regular files that are currently installed and
                that would be deleted. No note is added if a file is not
                supposed to be removed by Symantec Uninstaller.
         -f     Do not show files as they are removed. If -f is not
                specified, file names are shown as files are removed.
         -g     Do not remove items located within:
                   /Library/Logs
                   {each user's home}/Library/Logs
         -h     Display help.
         -I     Do not remove invisible Symantec files.
         -i     Only remove invisible Symantec files.
         -k     Do not attempt to kill Symantec processes.
         -l     List only files that are currently installed and that
                would be deleted. As of version 6.0.0, contents of folders
                are also shown. Nothing is deleted by this option.
         -L     List all files that RemoveSymantecMacFiles.command will attempt
                to find and delete. Nothing is deleted by this option.
         -m     Show output from -l, -L, or -R options using more program.
                This is no longer the default action as of version 5.52
                of RemoveSymantecMacFiles.command.
         -p     Eliminate pause before restarting computer. If option -p
                is not specified, then there is a three second delay
                before the restart occurs.
         -q     Quit script without restarting. This also suppresses
                the prompt to restart.
         -Q     Quits Terminal application when script is done. If
                Terminal is being run by more than one user at once,
                Terminal is not quit. If passed a second time, it is
                the same as -QQ option.
         -QQ    Quits Terminal application for all users when script is
                done.
         -R     This option is equivalent to the -l option.
         -r     Automatically restart computer when script is done if
                there are Symantec processes and/or kexts in memory and
                there were non-invisible files removed from /.
         -re    Same as -r option. Though -re is deprecated, it remains
                for backwards compatibility.
         -u     Only output files that are installed that should have been
                removed by the UI uninstaller. If there are files found,
                exit with 7; otherwise, exit with 0. No progress is shown
                and nothing is deleted.
         -V     Show version only.

Examples:
         RemoveSymantecMacFiles.command
                Deletes all Symantec files and Symantec crontab entries
                from the boot volume.

         RemoveSymantecMacFiles.command /Volumes/OS\ 10.2
                Deletes all Symantec files and Symantec crontab entries
                from the volume named "OS 10.2".
                Nothing is deleted from the boot volume.

         RemoveSymantecMacFiles.command Runner /
                Deletes all Symantec files and Symantec crontab entries
                from the volume named "Runner" and from the boot volume.

         RemoveSymantecMacFiles.command -i "Test Disk"
                Deletes only invisible Symantec files from the volume named
                "Test Disk".

         RemoveSymantecMacFiles.command -A -r
                Deletes all Symantec files and Symantec crontab entries
                from all mounted volumes that have OS X installed on them.
                Deletes only invisible Symantec files from volumes that do
                not have OS X installed on them.
                Computer is restarted automatically if necessary.

         RemoveSymantecMacFiles.command -Ai
                Deletes only invisible Symantec files from all volumes.

         RemoveSymantecMacFiles.command -I
                Deletes all but the invisible Symantec files from the boot
                volume. Crontab entries are removed from the boot volume.

         RemoveSymantecMacFiles.command -C
                Deletes all Symantec files from the boot volume. No crontab
                entries are removed.

         RemoveSymantecMacFiles.command -L -A
                Lists all the files that RemoveSymantecMacFiles.command looks
                for on all volumes. The files may or may not be currently
                installed. Nothing is deleted.

         RemoveSymantecMacFiles.command -R -A
                Lists only the Symantec files that are currently installed
                on all volumes. Files within existing folders will also be
                shown. Nothing is deleted.

         RemoveSymantecMacFiles.command -l -i
                Lists the invisible Symantec files that are currently
                installed on the boot volume. Nothing is deleted.

Note:    You must be root or an admin user to run this script. You can
         simply double-click on RemoveSymantecMacFiles.command to remove all
         Symantec files and crontab entries from the boot volume.

---------------------------------------------------------------------------

By default, the following are deleted:

Scheduler crontab entries and Scheduler launchd plists

Symantec items in login keychains

Norton Personal Firewall entries in /etc/syslog.conf

System profile com.symc.enroll


Logs listed in logging conf files within /etc/symantec

Logs in:
/Library/Application Support/CrashReporter
/Library/Application Support/DiagnosticReports
/Library/Logs/CrashReporter
/Library/Logs/DiagnosticReports
{each user's home directory}/Library/Application Support/CrashReporter
{each user's home directory}/Library/Application Support/DiagnosticReports
{each user's home directory}/Library/Logs/CrashReporter
{each user's home directory}/Library/Logs/DiagnosticReports

.fsd folders within {each user's home directory}/Downloads

The following folders/files:

/.com_symantec_symfs_private
/.SymAVQSFile
/.symSchedScanLockxz
/Applications/Firefox.app/Contents/MacOS/extensions/nortonsafetyminder@symantec.com
/Applications/Firefox.app/Contents/MacOS/extensions/{0e10f3d7-07f6-4f12-97b9-9b27e07139a5}
/Applications/Firefox.app/Contents/MacOS/extensions/{29dd9c80-9ea1-4aaf-9305-a0314aba24e3}
/Applications/GatherSymantecInfo
/Applications/Late Breaking News
/Applications/LiveUpdate
/Applications/LiveUpdate Folder
/Applications/LiveUpdate Folder (OS X)
/Applications/navx
/Applications/Norton *
/Applications/Register Your Software
/Applications/Symantec AntiVirus
/Applications/Symantec Cloud Security.app
/Applications/Symantec Endpoint Protection.app
/Applications/Symantec Solutions
/Applications/Symantec Unified Endpoint Protection.app
/Applications/Symantec/LiveUpdate.app
/Applications/Symantec/Read Me Files
/Applications/Symantec [deleted if empty]
/Applications/Trash Running Daemons
/Applications/uDelete Preferences
/etc/liveupdate.conf
/etc/mach_init.d/SymSharedSettings.plist
/etc/symantec [except /etc/symantec/saturn]
/etc/Symantec.conf
/Firewall
/Library/Application Support/NAV.history
/Library/Application Support/NAVDiagnostic.log
/Library/Application Support/nat_*
/Library/Application Support/nav_*
/Library/Application Support/nis_*
/Library/Application Support/norton_*
/Library/Application Support/Norton*
/Library/Application Support/nsm_*
/Library/Application Support/o2spy.log
/Library/Application Support/regid.1992-12.com.symantec*
/Library/Application Support/Symantec
/Library/Application Support/Symantec_IPUA
/Library/Application Support/symantec_uninstalldashboard*
/Library/Application Support/SymRun
/Library/Authenticators/SymAuthenticator.bundle
/Library/Caches/com.apple.Safari/Extensions/Norton*
/Library/Caches/com.apple.Safari/Extensions/Symantec*
/Library/Caches/com.norton*
/Library/Caches/com.symantec*
/Library/Caches/Norton*
/Library/Caches/Symantec*
/Library/CFMSupport/Norton Shared Lib
/Library/CFMSupport/Norton Shared Lib Carbon
/Library/Contextual Menu Items/NAVCMPlugIn.plugin
/Library/Contextual Menu Items/SAVCMPlugIn.plugin
/Library/Contextual Menu Items/SymFileSecurityCM.plugin
/Library/Documentation/Help/LiveUpdate Help
/Library/Documentation/Help/LiveUpdate-Hilfe
/Library/Documentation/Help/Norton AntiVirus Help
/Library/Documentation/Help/Norton AntiVirus-Hilfe
/Library/Documentation/Help/Norton Help
/Library/Documentation/Help/Norton Help Scripts
/Library/Documentation/Help/Norton Help Scripts Folder
/Library/Documentation/Help/Norton Personal Firewall Help
/Library/Documentation/Help/Norton Privacy Control Help
/Library/Documentation/Help/Norton Utilities Help
/Library/Extensions/FileSecurity.kext
/Library/Extensions/ndcengine.kext
/Library/Extensions/NortonForMac.kext
/Library/Extensions/SymAPComm.kext
/Library/Extensions/SymFirewall.kext
/Library/Extensions/SymInternetSecurity.kext
/Library/Extensions/SymIPS.kext
/Library/Extensions/SymPersonalFirewall.kext
/Library/Frameworks/mach_inject_bundle.framework
/Library/InputManagers/Norton Confidential for Safari
/Library/InputManagers/Norton Safety Minder
/Library/InputManagers/SymWebKitUtils
/Library/Internet Plug-Ins/Norton Confidential for Safari.plugin
/Library/Internet Plug-Ins/Norton Family Safety.plugin
/Library/Internet Plug-Ins/Norton Safety Minder.plugin
/Library/Internet Plug-Ins/NortonFamilyBF.plugin
/Library/Internet Plug-Ins/NortonInternetSecurityBF.plugin
/Library/Internet Plug-Ins/NortonSafetyMinderBF.plugin
/Library/LaunchAgents/com.symantec*
/Library/LaunchDaemons/com.norton*
/Library/LaunchDaemons/com.symantec*
/Library/Logs/LUTool.txt
/Library/Logs/Norton*
/Library/Logs/o2spy.log
/Library/Logs/Symantec*
/Library/Logs/SymAPErr.log
/Library/Logs/SymAPOut.log
/Library/Logs/SymDebugLeaks.log
/Library/Logs/SymDeepsight*
/Library/Logs/SymFWDeepSightTrie.txt
/Library/Logs/SymFWLog.log
/Library/Logs/SymFWRules.log*
/Library/Logs/SymHTTPSubmissions.txt
/Library/Logs/SymInstall*
/Library/Logs/SymOxygen*
/Library/Logs/SymScanServerDaemon.log
/Library/Logs/SymSharedSettingsd.log
/Library/Logs/SymUninstall*
/Library/Plug-ins/DiskImages/NUMPlugin.bundle
/Library/Plug-ins/DiskImages/VRPlugin.bundle
/Library/Plug-ins/DiskImages [deleted if empty]
/Library/Plug-ins [deleted if empty]
/Library/PreferencePanes/APPrefPane.prefPane
/Library/PreferencePanes/FileSaver.prefPane
/Library/PreferencePanes/Norton Family Safety.prefPane
/Library/PreferencePanes/Norton Safety Minder.prefPane
/Library/PreferencePanes/Ribbon.Norton.prefPane
/Library/PreferencePanes/SymantecQuickMenu.prefPane
/Library/PreferencePanes/SymAutoProtect.prefPane
/Library/Preferences/ByHost/com.symantec*
/Library/Preferences/com.norton*
/Library/Preferences/com.symantec* [except com.symantec.sacm* and com.symantec.smac*]
/Library/Preferences/LiveUpdate Preferences
/Library/Preferences/LU Admin Preferences
/Library/Preferences/LU Host Admin.plist
/Library/Preferences/NAV8.0.003.plist
/Library/Preferences/Network/com.symantec*
/Library/Preferences/Network [deleted if empty]
/Library/Preferences/Norton AntiVirus Prefs Folder
/Library/Preferences/Norton Application Aliases
/Library/Preferences/Norton Personal Firewall Log
/Library/Preferences/Norton Scheduler OS X.plist
/Library/Preferences/Norton Utilities Preferences
/Library/Preferences/Norton Zone
/Library/Preferences/wcid
/Library/PrivateFrameworks/NPF.framework
/Library/PrivateFrameworks/NPFCoreServices.framework
/Library/PrivateFrameworks/NPFDataSource.framework
/Library/PrivateFrameworks/PlausibleDatabase.framework
/Library/PrivateFrameworks/SymAppKitAdditions.framework
/Library/PrivateFrameworks/SymAVScan.framework
/Library/PrivateFrameworks/SymBase.framework
/Library/PrivateFrameworks/SymConfidential.framework
/Library/PrivateFrameworks/SymDaemon.framework
/Library/PrivateFrameworks/SymFirewall.framework
/Library/PrivateFrameworks/SymInternetSecurity.framework
/Library/PrivateFrameworks/SymIPS.framework
/Library/PrivateFrameworks/SymIR.framework
/Library/PrivateFrameworks/SymLicensing.framework
/Library/PrivateFrameworks/SymNetworking.framework
/Library/PrivateFrameworks/SymOxygen.framework
/Library/PrivateFrameworks/SymPersonalFirewall.framework
/Library/PrivateFrameworks/SymScheduler.framework
/Library/PrivateFrameworks/SymSEP.framework
/Library/PrivateFrameworks/SymSharedSettings.framework
/Library/PrivateFrameworks/SymSubmission.framework
/Library/PrivateFrameworks/SymSystem.framework
/Library/PrivateFrameworks/SymUIAgent.framework
/Library/PrivateFrameworks/SymUIAgentUI.framework
/Library/PrivateFrameworks/SymWebKitUtils.framework
/Library/PrivilegedHelperTools/com.symantec*
/Library/PrivilegedHelperTools/NATRemoteLock.app
/Library/Receipts/CompatibilityCheck.pkg
/Library/Receipts/Decomposer.pkg
/Library/Receipts/DeletionTracking.pkg
/Library/Receipts/FileSaver.pkg
/Library/Receipts/LiveUpdate*
/Library/Receipts/NATRemoteLock.pkg
/Library/Receipts/NATSDPlugin.pkg
/Library/Receipts/NAVContextualMenu.pkg
/Library/Receipts/NAVcorporate.pkg
/Library/Receipts/NAVDefs.pkg
/Library/Receipts/NAVEngine.pkg
/Library/Receipts/NAVWidget.pkg
/Library/Receipts/navx.pkg
/Library/Receipts/NAV_App*
/Library/Receipts/NAV_AutoProtect*
/Library/Receipts/NFSCore.pkg
/Library/Receipts/NISLaunch.pkg
/Library/Receipts/Norton AntiVirus Application.pkg
/Library/Receipts/Norton AntiVirus Product Log.rtf
/Library/Receipts/Norton AntiVirus.pkg
/Library/Receipts/Norton AutoProtect.pkg
/Library/Receipts/Norton Disk Editor X.pkg
/Library/Receipts/Norton Internet Security Log.rtf
/Library/Receipts/Norton Personal Firewall 3.0 Log.rtf
/Library/Receipts/Norton Scheduled Scans.pkg
/Library/Receipts/Norton Scheduler.pkg
/Library/Receipts/Norton SystemWorks 3.0 Log.rtf
/Library/Receipts/Norton Utilities 8.0 Log.rtf
/Library/Receipts/nortonanti-theftPostflight.pkg
/Library/Receipts/nortonantitheftPostflight.pkg
/Library/Receipts/NortonAutoProtect.pkg
/Library/Receipts/NortonAVDefs*
/Library/Receipts/NortonDefragger.pkg
/Library/Receipts/NortonDiskDoctor.pkg
/Library/Receipts/NortonFirewall*
/Library/Receipts/NortonInternetSecurity*
/Library/Receipts/NortonLauncher.pkg
/Library/Receipts/NortonParentalControl.pkg
/Library/Receipts/NortonPersonalFirewall.pkg
/Library/Receipts/NortonPersonalFirewallMenu.pkg
/Library/Receipts/NortonPrivacyControl.pkg
/Library/Receipts/NortonQuickMenu*
/Library/Receipts/NortonZone.pkg
/Library/Receipts/NPC Installer Log
/Library/Receipts/NPC.pkg
/Library/Receipts/NSMCore.pkg
/Library/Receipts/NSMCore.Universal.pkg
/Library/Receipts/NSWLaunch.pkg
/Library/Receipts/NUMCompatibilityCheck.pkg
/Library/Receipts/NumDocs.pkg
/Library/Receipts/NUMLaunch.pkg
/Library/Receipts/PredeleteTool.pkg
/Library/Receipts/SavLog.pkg
/Library/Receipts/Scheduled Scans.pkg
/Library/Receipts/Scheduler.pkg
/Library/Receipts/SDProfileEditor.pkg
/Library/Receipts/SMC.pkg
/Library/Receipts/SNAC.pkg
/Library/Receipts/SpeedDisk.pkg
/Library/Receipts/StuffIt.pkg
/Library/Receipts/Symantec Alerts.pkg
/Library/Receipts/Symantec AntiVirus.pkg
/Library/Receipts/Symantec AutoProtect Prefs.pkg
/Library/Receipts/Symantec AutoProtect.pkg
/Library/Receipts/Symantec Decomposer.pkg
/Library/Receipts/Symantec Endpoint Protection.pkg
/Library/Receipts/Symantec Scheduled Scans.pkg
/Library/Receipts/Symantec Scheduler.pkg
/Library/Receipts/SymantecAVDefs*
/Library/Receipts/SymantecClientFirewall.pkg
/Library/Receipts/SymantecDecomposer.pkg
/Library/Receipts/SymantecDeepSightExtractor.pkg
/Library/Receipts/SymantecParentalControl.pkg
/Library/Receipts/SymantecQuickMenu.pkg
/Library/Receipts/SymantecSAQuickMenu.pkg
/Library/Receipts/SymantecSharedComponents*
/Library/Receipts/SymantecUninstaller*
/Library/Receipts/SymantecURLs.pkg
/Library/Receipts/SymAV10StuffItInstall.pkg
/Library/Receipts/SymAVScanServer.pkg
/Library/Receipts/SymConfidential*
/Library/Receipts/SymConfidentialData.pkg
/Library/Receipts/SymDaemon*
/Library/Receipts/SymDC.pkg
/Library/Receipts/SymDiskMountNotify.pkg
/Library/Receipts/SymErrorReporting.pkg
/Library/Receipts/SymEvent.pkg
/Library/Receipts/SymFileSecurity*
/Library/Receipts/SymFirewall*
/Library/Receipts/SymFS.pkg
/Library/Receipts/SymHelper.pkg
/Library/Receipts/SymHelpScripts.pkg
/Library/Receipts/SymInstallExtras.pkg
/Library/Receipts/SymInternetSecurity.pkg
/Library/Receipts/SymIntrusionPrevention*
/Library/Receipts/SymIPS.pkg
/Library/Receipts/SymLicensing*
/Library/Receipts/SymNCOApplication*
/Library/Receipts/SymOSXKernelUtilities.pkg
/Library/Receipts/SymOxygen.pkg
/Library/Receipts/SymPersonalFirewallCore*
/Library/Receipts/SymPersonalFirewallUI*
/Library/Receipts/SymProtector.pkg
/Library/Receipts/SymPseudoLicensing*
/Library/Receipts/SymSetupAssistant*
/Library/Receipts/SymSharedFrameworks*
/Library/Receipts/SymSharedSettings*
/Library/Receipts/SymStuffit.pkg
/Library/Receipts/SymSubmission.pkg
/Library/Receipts/SymUIAgent*
/Library/Receipts/SymWebFraud*
/Library/Receipts/SymWebKitUtils.pkg
/Library/Receipts/Unerase.pkg
/Library/Receipts/URL.pkg
/Library/Receipts/VolumeAssist.pkg
/Library/Receipts/VolumeRecover.pkg
/Library/Receipts/WCIDEngine.pkg
/Library/Receipts/Wipe Info.pkg
/Library/Receipts/ZoneStandalone.pkg
NOTE: Also removes above receipts ending with Dev.pkg (e.g., CompatibilityCheckDev.pkg)
/Library/ScriptingAdditions/SymWebKitUtils.osax
/Library/ScriptingAdditions/SymWebKitUtilsSL.osax
/Library/Services/Norton for Mac.service
/Library/Services/ScanService.service
/Library/Services/Symantec*
/Library/Services/SymSafeWeb.service
/Library/Services [deleted if empty]
/Library/StartupItems/NortonAutoProtect
/Library/StartupItems/NortonAutoProtect.kextcache
/Library/StartupItems/NortonLastStart
/Library/StartupItems/NortonMissedTasks
/Library/StartupItems/NortonPersonalFirewall
/Library/StartupItems/NortonPrivacyControl
/Library/StartupItems/NUMCompatibilityCheck
/Library/StartupItems/SMC
/Library/StartupItems/SymAutoProtect
/Library/StartupItems/SymAutoProtect.kextcache
/Library/StartupItems/SymDCInit
/Library/StartupItems/SymMissedTasks
/Library/StartupItems/SymProtector
/Library/StartupItems/SymQuickMenuOSFix
/Library/StartupItems/SymWebKitUtilsOSFix
/Library/StartupItems/TrackDelete
/Library/StartupItems/VolumeAssist
/Library/Symantec/tmp
/Library/Symantec [deleted if empty]
/Library/Widgets/Symantec Alerts.wdgt
/Library/Widgets/version.plist
/Library/Widgets [deleted if empty]
/NAVMac800QSFile
/Norton AntiVirus Installer Log
/Norton FS Data
/Norton FS Index
/Norton FS Volume
/Norton FS Volume 2
/opt/Symantec
/opt [deleted if empty]
/Personal [deleted if empty]
Items in /private/etc are listed as items beginning with /etc
Items in /private/tmp are listed as items beginning with /tmp
Items in /private/var are listed as items beginning with /var
/Solutions [deleted if empty]
/Support/Norton [deleted if empty]
/Support [deleted if empty]
/symaperr.log
/symapout.log
/SymAppKitAdditions.framework
/SymBase.framework
/SymNetworking.framework
/SymSystem.framework
/System/Library/Authenticators/SymAuthenticator.bundle
/System/Library/CFMSupport/Norton Shared Lib Carbon
/System/Library/CoreServices/NSWemergency
/System/Library/CoreServices/NUMemergency
/System/Library/Extensions/DeleteTrap.kext
/System/Library/Extensions/KTUM.kext
/System/Library/Extensions/ndcengine.kext
/System/Library/Extensions/NortonForMac.kext
/System/Library/Extensions/NPFKPI.kext
/System/Library/Extensions/SymDC.kext
/System/Library/Extensions/SymEvent.kext
/System/Library/Extensions/symfs.kext
/System/Library/Extensions/SymInternetSecurity.kext
/System/Library/Extensions/SymIPS.kext
/System/Library/Extensions/SymOSXKernelUtilities.kext
/System/Library/Extensions/SymPersonalFirewall.kext
/System/Library/StartupItems/NortonAutoProtect
/System/Library/StartupItems/SymMissedTasks
/System/Library/Symantec
/System/Library/SymInternetSecurity.kext
/SystemWorks Installer Log
/tmp/com.symantec.liveupdate.reboot
/tmp/com.symantec.liveupdate.restart
/tmp/O2Spy.log
/tmp/jlulogtemp
/tmp/LiveUpdate.*
/tmp/liveupdate
/tmp/lulogtemp
/tmp/SymSharedFrameworks*
/tmp/symask
/Users/dev/bin/smellydecode
/Users/dev/bin [deleted if empty]
/Users/dev [deleted if empty]
/Users/Shared/NAV Corporate
/Users/Shared/NIS Corporate
/usr/bin/MigrateQTF
/usr/bin/navx
/usr/bin/nortonscanner
/usr/bin/nortonsettings
/usr/bin/npfx
/usr/bin/savx
/usr/bin/scfx
/usr/bin/symsched
/usr/lib/libsymsea.*dylib
/usr/lib/libwpsapi.dylib
/usr/local/bin/CoreLocationProviderTest
/usr/local/bin/KeyGenerator
/usr/local/bin/LocationProviderInterfaceTest
/usr/local/bin/LocationProviderTest
/usr/local/bin/MigrateQTF
/usr/local/bin/navx
/usr/local/bin/nortonscanner
/usr/local/bin/nortonsettings
/usr/local/bin/SkyhookProviderTest
/usr/local/bin [deleted if empty]
/usr/local/lib/libAPFeature.a
/usr/local/lib/libcx_lib.so
/usr/local/lib/libecomlodr.dylib
/usr/local/lib/libgecko3parsers.dylib
/usr/local/lib/liblux.so.*
/usr/local/lib/libnlucallback.dylib
/usr/local/lib/libsymsea.*dylib
/usr/local/lib [deleted if empty]
/usr/share/man/man1/NAVScanIDs.h
/var/db/NATSqlDatabase.db
/var/db/receipts/$(SYM_SKU_REVDOMAIN).install.bom
/var/db/receipts/$(SYM_SKU_REVDOMAIN).install.plist
/var/db/receipts/com.symantec*
/var/db/receipts/com.symantec*
/var/db/receipts/com.Symantec*
/var/log/du.log*
/var/log/dulux.log*
/var/log/lut.log*
/var/log/lux.log*
/var/log/luxtool.log*
/var/log/mexd.log*
/var/log/microdef.log*
/var/log/nortondns.log
/var/log/Npfkernel.log.fifo
/var/root/Applications/Norton Internet Security.app
/var/root/Applications [deleted if empty]
/var/root/Library/Bundles/NAVIR.bundle
/var/root/Library/Bundles [deleted if empty]
/var/root/Library/Contextual Menu Items/NAVCMPlugIn.plugin
/var/tmp/com.symantec*
/var/tmp/com.Symantec*
/var/tmp/symantec_error_report*
{each user's home directory}/Application Support/Symantec
{each user's home directory}/Application Support [deleted if empty]
{each user's home directory}/Applications [deleted if empty]
{each user's home directory}/Applications/LiveUpdate Folder (OS X)
{each user's home directory}/Applications/Norton AntiVirus (OS X)
{each user's home directory}/Library/Application Support/Firefox/Profiles/*/extensions/*@symantec.com.xpi
{each user's home directory}/Library/Application Support/Norton*
{each user's home directory}/Library/Application Support/Symantec
{each user's home directory}/Library/Caches/com.apple.Safari/Extensions/Norton*
{each user's home directory}/Library/Caches/com.apple.Safari/Extensions/Symantec*
{each user's home directory}/Library/Caches/com.norton*
{each user's home directory}/Library/Caches/com.symantec*
{each user's home directory}/Library/Caches/Norton*
{each user's home directory}/Library/Caches/Symantec*
{each user's home directory}/Library/Documentation/Help/Norton Personal Firewall Help
{each user's home directory}/Library/Documentation/Help/Norton Privacy Control Help
{each user's home directory}/Library/LaunchAgents/com.symantec*
{each user's home directory}/Library/Logs/SymDebugLeaks.log
{each user's home directory}/Library/Logs/SymFWDeepSightTrie.txt
{each user's home directory}/Library/Logs/SymHTTPSubmissions.txt
{each user's home directory}/Library/Logs/SymInstall*
{each user's home directory}/Library/Logs/SymOxygen*
{each user's home directory}/Library/Logs/SymScanServerDaemon.log
{each user's home directory}/Library/Logs/SymSharedSettingsd.log
{each user's home directory}/Library/Logs/SymUninstall*
{each user's home directory}/Library/Preferences/ByHost/com.symantec*
{each user's home directory}/Library/Preferences/com.norton*
{each user's home directory}/Library/Preferences/com.symantec* [except com.symantec.sacm* and com.symantec.smac*]
{each user's home directory}/Library/Preferences/LiveUpdate Preferences
{each user's home directory}/Library/Preferences/LU Admin Preferences
{each user's home directory}/Library/Preferences/LU Host Admin.plist
{each user's home directory}/Library/Preferences/NAV8.0.003.plist
{each user's home directory}/Library/Preferences/Network/com.symantec*
{each user's home directory}/Library/Preferences/Norton AntiVirus Prefs Folder
{each user's home directory}/Library/Preferences/Norton Application Aliases
{each user's home directory}/Library/Preferences/Norton Personal Firewall Log
{each user's home directory}/Library/Preferences/Norton Scheduler OS X.plist
{each user's home directory}/Library/Preferences/Norton Utilities Preferences
{each user's home directory}/Library/Preferences/Norton Zone
{each user's home directory}/Library/Preferences/wcid
{each user's home directory}/Library/Safari/Extensions/Norton*
{each user's home directory}/Library/Safari/Extensions/Symantec*
{each user's home directory}/Library/Saved Application State/com.symantec*
