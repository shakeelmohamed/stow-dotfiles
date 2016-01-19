#!/bin/sh
# File Name:    RemoveSymantecMacFiles.command
  Version=7.0.46
# Author:       Corey Swertfager, Symantec Corporation
# Watermark ID: CB70-6840-3597-44-15-4
# Created:      10/04/2001
# Modified:     12/30/2015
#
# WARNING: This script will remove all files and folders created by
#          Symantec OS X products (except Symantec Adminstration Console
#          for Macintosh files) and any files within those folders.
#          Therefore, you will lose ALL files that reside in those folders,
#          including any that you have created.
#
# Usage:   RemoveSymantecMacFiles.command [options] [volume ...]
#
# Summary: See ShowHelp() function.
#
# History: 5.00 - Ported code from version 4.27.
#                 Now removes crontab entries from any OS X boot volume.
#                 Now removes Symantec items from loginwindow.plist files.
#                 Now removes receipts from any volume.
#                 Now checks for Symantec kexts/processes in memory when
#                 determining when a restart is necessary.
#                 Added -f option to suppress output of removed files.
#                 Now shows names of files as they are removed, unless the
#                 -f option is specified.
#          5.01 - Now removes:
#                    /Library/Contextual Menu Items/SAVCMPlugIn.plugin
#          5.02 - Adjusted output when a folder/file cannot be removed.
#                 Removed warning when /Library/StartupItems remains.
#                 Now removes:
#                    /Library/Application Support/Symantec/Daemon/SymDaemon.bundle
#                    /Library/Application Support/Symantec/Daemon
#                    /Library/Application Support/Symantec/SymUIAgent
#                    /Library/Application Support/Symantec/WebFraud
#                    /Library/Contextual Menu Items/SymFileSecurityCM.plugin
#                    /Library/PrivateFrameworks/SymAppKitAdditions.framework
#                    /Library/PrivateFrameworks/SymBase.framework
#                    /Library/PrivateFrameworks/SymConfidential.framework
#                    /Library/PrivateFrameworks/SymSharedSettings.framework
#                    /Library/Receipts/SymConfidential.pkg
#                    /Library/Receipts/SymFileSecurity.pkg
#                    /Library/Receipts/SymSharedFrameworks.pkg
#                    /Library/Receipts/SymSharedSettings.pkg
#                    /private/etc/mach_init.d/SymSharedSettings.plist
#          5.03 - Now removes:
#                    /Applications/Norton Confidential.app
#                    /Library/Application Support/Symantec/IntrusionPrevention
#                    /Library/LaunchDaemons/com.symantec.symdaemon.plist
#                    /Library/LaunchDaemons/com.symantec.uiagent.bundle
#                    /Library/PrivateFrameworks/SymDaemon.framework
#                    /Library/PrivateFrameworks/SymInternetSecurity.framework
#                    /Library/PrivateFrameworks/SymUIAgent.framework
#                    /Library/PrivateFrameworks/SymUIAgentUI.framework
#                    /Library/Receipts/SymConfidentialData.pkg
#                    /Library/Receipts/SymDaemon.pkg
#                    /Library/Receipts/SymFileSecurity.pkg
#                    /Library/Receipts/SymInternetSecurity.pkg
#                    /Library/Receipts/SymIntrusionPrevention.pkg
#                    /Library/Receipts/SymNCOApplication.pkg
#                    /Library/Receipts/SymUIAgent.pkg
#                    /Library/Receipts/SymWebFraud.pkg
#                    /Library/Receipts/WCIDEngine.pkg
#                    /System/Library/Extensions/SymInternetSecurity.kext
#                    /System/Library/Extensions/SymIPS.kext
#                    /System/Library/SymInternetSecurity.kext
#          5.04 - Now removes:
#                    /Applications/Firefox.app/Contents/MacOS/extensions/{0e10f3d7-07f6-4f12-97b9-9b27e07139a5}
#                    /Library/Application Support/Symantec/Assistants/Norton Confidential
#                    /Library/Application Support/Symantec/Assistants/Symantec Setup Assistant.app
#                    /Library/Application Support/Symantec/Assistants/Symantec Setup Assistant.bundle
#                    /Library/Application Support/Symantec/Assistants
#                    /Library/Receipts/SymSetupAssistant.pkg
#          5.05 - Now removes:
#                    /Library/Preferences/com.symantec.sharedsettings
#          5.06 - Now removes:
#                    /Library/Application Support/Symantec/Settings
#          5.07 - Now removes:
#                    /Library/LaunchDaemons/com.symantec.uiagent.plist
#          5.08 - Now removes:
#                    */Library/Preferences/com.symantec.uninstaller.plist
#          5.09 - Now only removes when empty:
#                    /Library/Application Support/Symantec/Assistants
#                    /Library/Application Support/Symantec/Daemon
#          5.10 - Now removes:
#                    /Library/Application Support/Symantec/Daemon/error.log
#                 Added volume name to paths in progress.
#          5.11 - Now removes:
#                    /Applications/Firefox.app/Contents/MacOS/extensions/{29dd9c80-9ea1-4aaf-9305-a0314aba24e3}
#          5.12 - Now removes:
#                    /private/var/tmp/com.symantec.liveupdate.*
#          5.13 - OSXvnc StartupItems are now filtered out during Symantec
#                 process checking.
#          5.14 - Modified for OS 10.5 compatibility.
#                 No longer removes empty /Library/StartupItems.
#                 Now removes:
#                    /Library/InputManagers/Norton Confidential for Safari
#                 Now removes files installed by NAV 11 build 1.
#          5.15 - Now removes:
#                    /.symSchedScanLockxz
#                 RemoveInvisibleFilesFromVolume functions now removes:
#                    /.SymAVQSFile
#                 Added DeleteLaunchdPlists function to remove Symantec
#                 Scheduler launchd plists.
#                 Added messaging when there are no Symantec crontab
#                 entries to delete.
#                 Renamed Remove function to RemoveItem.
#                 RemoveItem function can now match several files.
#                 Now removes additional files installed by NAV 11.
#                 A list of files deleted by this program is now appended
#                 to ReadMe.txt.
#                 All com.symantec.* preferences are now shown when using
#                 the -L option to show all files that would be deleted.
#          5.16 - Now removes:
#                    */Library/Preferences/com.symantec.nortonantivirus.*
#                    */Library/Preferences/com.symantec.nortonconfidential.*
#                    */Library/Preferences/com.symantec.schedScanResults*
#                    */Library/Preferences/com.symantec.symsched*
#          5.17 - Adjusted grep filters in SymantecIsInMemory function.
#                 Now removes:
#                    /Applications/Norton AntiVirus.app
#          5.18 - Changed how ShowVersion is called for OS 10.5 compatibility.
#          5.19 - Now removes:
#                    /Library/Internet Plug-Ins/Norton Confidential for Safari.plugin
#          5.20 - Now removes:
#                    /Library/Receipts/SymantecAVDefs*
#                    /private/tmp/com.symantec.liveupdate.restart
#          5.21 - Added output to DeleteSymantecLoginItems function.
#                 Revised output of -l and -L options.
#                 Now removes:
#                    /Library/Receipts/SymStuffit.pkg
#          5.22 - Now removes:
#                    /Library/Application Support/Symantec/Protector
#                    /Library/Receipts/SymProtector.pkg
#                    /Library/StartupItems/SymProtector
#          5.23 - Now removes:
#                    /Library/Receipts/SavLog.pkg
#          5.24 - Changed the assignment order of CRONDIR to account for
#                 cases where OS 10.5 was installed over OS 10.4.
#          5.25 - Now removes:
#                    */Library/Preferences/com.Symantec.SAVX.*
#          5.26 - Now removes:
#                    /Library/Application Support/Symantec/Assistants/Client Firewall
#                    /Library/Application Support/Symantec/Assistants/SCF Assistant Startup.app
#                    /Library/Application Support/Symantec/DeepSight
#                    /Library/Application Support/Symantec/Firewall
#                    /Library/LaunchDaemons/com.symantec.deepsight-extractor.plist
#                    /Library/LaunchDaemons/com.symantec.npfbootstrap.plist
#                    /Library/PrivateFrameworks/SymFirewall.framework
#                    /Library/PrivateFrameworks/SymPersonalFirewall.framework
#                    /System/Library/Extensions/SymPersonalFirewall.kext
#                    /usr/bin/scfx
#          5.27 - Now removes:
#                    /Library/Application Support/Symantec/Daemon/debug.log
#                    /Library/Receipts/SymantecClientFirewall.pkg
#                    /Library/Receipts/SymFirewall.pkg
#                    /Library/Receipts/SymPersonalFirewallCore.pkg
#          5.28 - Now removes:
#                    /Library/Application Support/Symantec/Assistants/Norton Firewall
#                    /Library/Application Support/Symantec/Assistants/NPF Assistant Startup.app
#                    /Library/Receipts/NortonFirewall.pkg
#                    /Library/Receipts/SymPersonalFirewallUI.pkg
#                    /usr/bin/npfx
#          5.29 - Added ReceiptsTable variable and RunPredeleteScripts
#                 function to incorporate the running of predelete scripts.
#                 Added -e option to show predelete errors.
#          5.30 - Now removes:
#                    /Library/Application Support/Symantec/Assistants/NIS Assistant Startup.app
#                    /Library/Application Support/Symantec/Assistants/Norton Internet Security
#                    /Library/Receipts/NortonInternetSecurity.pkg
#          5.31 - Now removes temporary files used by this program.
#                 Added running of pre_delete scripts to RunPredeleteScripts functions.
#          5.32 - Adjusted DeleteSymantecLoginItems diff filtering.
#          5.33 - Now removes:
#                    /private/tmp/symask
#          5.34 - Now removes:
#                    /Library/LaunchDaemons/com.symantec*
#                    /Library/Preferences/com.symantec*
#                       [except com.symantec.sacm* and com.symantec.smac*]
#                    {each user's home directory}/Library/Preferences/com.symantec*
#                       [except com.symantec.sacm* and com.symantec.smac*]
#                    {each user's home directory}/Library/Preferences/Network/com.symantec*
#                    /Library/Preferences/Network/com.symantec*
#                 Added -x option to RemoveItem function.
#                 RemoveItem function now ignores letter case when a
#                 pattern or an exclusion is passed.
#                 Links in /Volumes are now ignored.
#          5.35 - Removed return statement that caused premature script end.
#          5.36 - Now removes items installed by NFS 100.001:
#                    /Library/Application Support/Symantec/Norton Family Safety
#                    /Library/Internet Plug-Ins/Norton Family Safety.plugin
#                    /Library/PreferencePanes/Norton Family Safety.prefPane
#                    /Library/Receipts/NFSCore.pkg
#          5.37 - Revised pattern to find Symantec processes.
#                 Now removes all Dev.pkg receipts.
#          5.38 - Now removes items installed by NSM 100.008:
#                    /Library/Application Support/Symantec/Norton Safety Minder
#                    /Library/Internet Plug-Ins/Norton Safety Minder.plugin
#                    /Library/PreferencePanes/Norton Safety Minder.prefPane
#                    /Library/PreferencePanes/Ribbon.Norton.prefPane
#                    /Library/Receipts/NSMCore.pkg
#          5.39 - Now removes:
#                    /Library/Caches/com.symantec*
#                    /Library/Caches/Norton*
#                    /Library/Caches/Symantec*
#                    /Library/Logs/Norton*
#                    /Library/Logs/Symantec*
#                    /Library/Logs/SymDeepsight*
#                    /Library/Logs/SymFWLog.log
#                    /Library/Logs/SymFWRules.log*
#                    /Library/Preferences/wcid
#                    /private/var/tmp/com.symantec*
#                    {each user's home directory}/Library/Caches/com.symantec*
#                    {each user's home directory}/Library/Caches/Norton*
#                    {each user's home directory}/Library/Caches/Symantec*
#                    {each user's home directory}/Library/Preferences/wcid
#          5.40 - Fixed an erroneous "invalid password" error message.
#                 Non-removal of /opt is no longer considered an error
#                 (some third party programs install files into there).
#          5.41 - Updated Usage(s) comments.
#          5.42 - Now removes:
#                    /Library/PrivateFrameworks/SymWebKitUtils.framework
#          5.43 - Now removes:
#                    /Library/InputManagers/Norton Safety Minder
#          5.44 - Now removes:
#                    /var/db/receipts/com.symantec*
#          5.45 - Now removes if empty folder:
#                    /Library/Preferences/Network
#                 Now removes:
#                    /Applications/Firefox.app/Contents/MacOS/extensions/nortonsafetyminder@symantec.com
#          5.46 - Added -d option.
#                 Updated help.
#          5.47 - Added running of predelete scripts stored in new Symantec
#                 Uninstaller's Receipt folder.
#                 Now removes:
#                    /Library/Application Support/Symantec/Uninstaller
#                 Added -Q and -QQ options.
#                 Added KillTerminal function.
#          5.48 - Restart prompt is now shown any time boot volume is checked
#                 and there are Symantec processes and/or kexts in memory,
#                 except when -l or -L is passed.
#                 Now removes:
#                    /Library/Application Support/Symantec/Registry
#                    /Library/Application Support/Symantec/Submissions
#                    /Library/Application Support/Symantec/SymWebKitUtils
#                    /Library/PrivateFrameworks/SymSubmission.framework
#                    /Library/Receipts/SymSubmission.pkg
#                    /Library/Receipts/SymWebKitUtils.pkg
#                 Now removes /Library/PrivateFrameworks/SymWebKitUtils.framework
#                 only if the framework does not contain SymWKULoader.dylib; its
#                 receipt is removed if SymWKULoader.dylib does not exist or if
#                 /Library/StartupItems/CleanUpSymWebKitUtils exists.
#          5.49 - Excluded /LiveUpdateAdminUtility/ from processes to find in
#                 SymantecIsInMemory function.
#          5.50 - Fixed RunPredeleteScripts function so that it runs more than
#                 just the first predelete script in Symantec Uninstaller's
#                 Receipts folder and allows for multiple predelete scripts in
#                 /Library/Receipts receipts.
#                 Now removes:
#                    /Library/InputManagers/SymWebKitUtils
#                    /Library/StartupItems/SymQuickMenuOSFix
#                    /Library/StartupItems/SymWebKitUtilsOSFix
#                 Restart prompt is now shown if CleanUpSymWebKitUtils exists in
#                 /Library/StartupItems.
#                 Running ofLiveUpdate.pkg predelete script is no longer skipped.
#          5.51 - Now removes:
#                    /Library/Application Support/Symantec/SEP
#                    /Library/Application Support/Symantec/SMC
#                    /Library/Application Support/Symantec/SNAC
#                    /Library/LaunchAgents/com.symantec*
#                    /Library/Receipts/SMC.pkg
#                    /Library/Receipts/SNAC.pkg
#                    /Library/Receipts/Symantec Endpoint Protection.pkg
#                    /Library/Receipts/SymantecSAQuickMenu.pkg
#                    /Library/Services/ScanService.service
#                    /Library/Services [deleted if empty]
#                    /Library/StartupItems/SMC
#                    /usr/lib/libsymsea.1.0.0.dylib
#                    /usr/lib/libsymsea.dylib
#                 Adjusted RunPredeleteScripts function to limit predelete script
#                 names to those ending with predelete or pre_delete; doing so
#                 prevents a bus error by no longer running "predeletetool".
#          5.52 - Added -m option to use more program when -l, -L, or -R
#                 options are used.
#                 Removed -r option, which deleted only receipts.
#                 Added -R option to include folder contents when showing
#                 installed files.
#                 Progress shown when using the -l, -L, or -R options is
#                 now sent to standard error to facilitate piping the
#                 generated report to a file without piping progress.
#          5.53 - Now removes:
#                    /Library/ScriptingAdditions/SymWebKitUtils.osax
#                    /Library/ScriptingAdditions/SymWebKitUtilsSL.osax
#                    /usr/local/lib/libgecko3parsers.dylib
#                    /usr/local/lib [deleted if empty]
#                    /usr/local [deleted if empty]
#          5.54 - Now removes:
#                    /private/var/db/receipts/com.symantec*
#          5.55 - Now removes:
#                    /Library/Receipts/LiveUpdate*
#                    /Library/Application Support/Symantec/AntiVirus.kextcache
#                 RunPredeleteScripts function now also runs predelete scripts for
#                 receipts in ReceiptsTable that pass option -a.
#          5.56 - Now removes:
#                    /private/tmp/jlulogtemp
#                    /private/tmp/LiveUpdate.*
#                    /private/tmp/liveupdate
#                    /private/tmp/lulogtemp
#                    /private/tmp/SymSharedFrameworks*
#                    /private/var/db/receipts/$(SYM_SKU_REVDOMAIN).install.bom
#                    /private/var/db/receipts/$(SYM_SKU_REVDOMAIN).install.plist
#                    /private/var/tmp/com.Symantec*
#          5.57 - Now removes:
#                    /Library/Application Support/nis_postuninstall.rb
#                    /Library/Application Support/nis_postuninstall.sh
#          5.58 - Now removes:
#                    /Library/Receipts/NSMCore.Universal.pkg
#          5.59 - Now removes:
#                    /Applications/Norton DNS Beta.app
#                    /Applications/Norton DNS.app
#                    /Library/Application Support/Symantec/Norton DNS
#                    /Library/LaunchDaemons/com.norton
#                    /private/var/log/nortondns.log
#                    {each user's home directory}/Library/Caches/com.norton
#                    {each user's home directory}/Library/Preferences/com.norton
#          5.60 - Now removes:
#                    /Library/Preferences/com.norton*
#                    {each user's home directory}/Library/Preferences/com.norton*
#                 The following removals were added in version 5.59, but the version
#                 history erroneously left off the trailing *:
#                    /Library/LaunchDaemons/com.norton*
#                    {each user's home directory}/Library/Caches/com.norton*
#                 The following removal were added in version 5.59, but the version
#                 history erroneously omitted its addition:
#                    /Library/Caches/com.norton*
#          5.61 - Removed CurrentUserTempFile/ProcessArgumentsCalled.
#          5.62 - Modified for case-sensitive volume compatibility.
#                 Now removes (based on NIS 5.0 builds 8-12 boms):
#                    /Library/Application Support/Symantec/ErrorReporting
#                    /Library/PrivateFrameworks/SymLicensing.framework
#                    /Library/Receipts/NAV_App*
#                    /Library/Receipts/NAV_AutoProtect*
#                    /Library/Receipts/NortonFirewall*
#                    /Library/Receipts/NortonInternetSecurity*
#                    /Library/Receipts/NortonQuickMenu*
#                    /Library/Receipts/SymantecSharedComponents*
#                    /Library/Receipts/SymantecUninstaller*
#                    /Library/Receipts/SymConfidential*
#                    /Library/Receipts/SymDaemon*
#                    /Library/Receipts/SymErrorReporting.pkg
#                    /Library/Receipts/SymFileSecurity*
#                    /Library/Receipts/SymFirewall*
#                    /Library/Receipts/SymIntrusionPrevention*
#                    /Library/Receipts/SymNCOApplication*
#                    /Library/Receipts/SymPersonalFirewallCore*
#                    /Library/Receipts/SymPersonalFirewallUI*
#                    /Library/Receipts/SymPseudoLicensing*
#                    /Library/Receipts/SymSetupAssistant*
#                    /Library/Receipts/SymSharedFrameworks*
#                    /Library/Receipts/SymSharedSettings*
#                    /Library/Receipts/SymUIAgent*
#                    /Library/Receipts/SymWebFraud*
#                    /Library/Services/SymSafeWeb.service
#                    /usr/bin/MigrateQTF
#          5.63 - Now removes:
#                 /usr/local/lib/libecomlodr.dylib
#          5.64 - Updated DeleteCrontabEntries to delete entries from both
#                 OS 10.4 and OS 10.5 crontab directories.
#          5.65 - Updated for NAV 12/NIS 5.
#          5.66 - Added check for launch location to suppress screen clearing, prompts,
#                 and quit message ("NOTE: If you double-clicked this script, quit Terminal
#                 application now.") when running from within app bundle or in support folder.
#                 Now removes:
#                    /Library/Receipts/SymLicensing*
#          5.67 - Fixed "[: too many arguments" error.
#          5.68 - Now removes in all versions:
#                    /Library/Application Support/Symantec/Daemon/timer
#                    /Library/Application Support/Symantec/Licensing
#          5.69 - Now removes:
#                    /Preferences/ByHost/com.symantec*
#                    {each user's home directory}/Preferences/ByHost/com.symantec*
#          5.70 - Now removes:
#                    /Library/Application Support/Symantec/Daemon/timer.log
#          6.0.0 - 09/01/2011:
#                  Now designates when Symantec Uninstaller.app should not
#                  remove an item when using the -l or -R options.
#                  The -l and -R options are now equivalent.
#          6.0.1 - 09/11/2011:
#                  Updated file list.
#          6.0.2 - 09/16/2011:
#                  Updated file list.
#          6.0.3 - 10/07/2011:
#                  Now removes:
#                     /Library/Application Support/nav_postuninstall.rb
#                     /Library/Application Support/nsm_postuninstall.rb
#                     /Library/Application Support/o2spy.log
#                     /Library/Application Support/Symantec/NortonM
#                     /Library/PrivateFrameworks/PlausibleDatabase.framework
#                     /Library/PrivateFrameworks/SymOxygen.framework
#          6.0.4 - 11/08/2011:
#                  Now removes:
#                     /Library/Application Support/nav_uninstalldashboard*
#                     /Library/Application Support/symantec_uninstalldashboard*
#          6.0.5 - 11/17/2011:
#                  Now removes:
#                     /Library/Application Support/Symantec/SymSAQuickMenu
#          6.0.6 - 12/06/2011:
#                  Now removes:
#                     /Library/PrivilegedHelperTools/NATRemoteLock.app
#                     /Library/Receipts/NATRemoteLock.pkg
#                     /Library/Receipts/NATSDPlugin.pkg
#                     /Library/Receipts/nortonantitheftPostflight.pkg
#                     /Library/Receipts/PredeleteTool.pkg
#                     /Library/Receipts/SymOxygen.pkg
#                     /usr/lib/libwpsapi.dylib
#          6.0.7 - 12/14/2011:
#                  Now removes:
#                     /Library/Receipts/nortonanti-theftPostflight.pkg
#                     /private/var/db/NATSqlDatabase.db
#          6.0.8 - 02/28/2012:
#                  Now removes:
#                     /private/tmp/com.symantec.liveupdate.reboot
#          6.0.9 - 03/30/2012:
#                  Now removes:
#                    /private/var/db/receipts/com.Symantec*
#          6.0.10 - 06/19/2012 - Corey Swertfager:
#                   Now removes:
#                      /Applications/Norton Zone*
#                      /Library/Application Support/nav_uninstalldashboard*
#                      /Library/Application Support/symantec_uninstalldashboard*
#                      /Library/Caches/com.apple.Safari/Extensions/Norton*
#                      /Library/Caches/com.apple.Safari/Extensions/Symantec*
#                      /Library/Internet Plug-Ins/NortonSafetyMinderBF.plugin
#                      /Library/Preferences/Norton Zone
#                      /Library/Receipts/ZoneStandalone.pkg
#                      {each user's home directory}/Library/Caches/com.apple.Safari/Extensions/Norton*
#                      {each user's home directory}/Library/Caches/com.apple.Safari/Extensions/Symantec*
#                      {each user's home directory}/Library/Preferences/Norton Zone
#                   Now actually removes (added missing quotes to RemoveItem calls):
#                      /Library/Application Support/nav_uninstalldashboard*
#                      /Library/Application Support/symantec_uninstalldashboard*
#          6.0.11 - 06/19/2012 - Corey Swertfager:
#                   Now removes:
#                      /Library/Application Support/NortonZone
#                      {each user's home directory}/Library/Application Support/NortonZone
#          6.0.12 - 07/06/2012 - Corey Swertfager:
#                   * Modified grep calls with regular expressions that contain pattern "$\|"
#                     to instead use extended regular expression "$|" for OS 10.8 compatibility,
#                     fixing the problem of predelete scripts not being run on OS 10.8.
#                   * Now removes:
#                        /usr/local/bin/KeyGenerator
#          6.0.13 - 08/03/2012 - Corey Swertfager:
#                   * Now removes:
#                        /Library/Application Support/Symantec/Mexico
#                        /Library/Frameworks/mach_inject_bundle.framework
#          6.0.14 - 08/27/2012 - Corey Swertfager:
#                   * Now removes Norton Zone saved sessions.
#          6.0.15 - 08/31/2012 - Corey Swertfager:
#                   * Removed logic that attempted to remove:
#                        {each user's home directory}/Library/Norton Zone
#          6.0.16 - 10/08/2012 - Corey Swertfager:
#                   * Now removes:
#                        {each user's home directory}/Library/Application Support/Symantec
#                        /Library/Internet Plug-Ins/NortonInternetSecurityBF.plugin
#                   * Now makes a second attempt to remove:
#                        /Library/Application Support/Symantec/ErrorReporting
#                        /Library/Application Support/Symantec [deleted if empty]
#          6.0.17 - 10/11/2012 - Corey Swertfager:
#                   Now removes:
#                      /Library/Application Support/Symantec/NisLaunch
#          6.0.18 - 10/19/2012 - Corey Swertfager:
#                   Now removes:
#                        {each user's home directory}/Library/Safari/Extensions/NortonSafetyMinderBF*
#          6.0.19 - 03/12/2013 - Corey Swertfager:
#                   * Now removes:
#                        /Library/Application Support/Symantec/Daemon [deleted whether empty or not]
#                        /Library/PrivilegedHelperTools/com.symantec*
#                   * Added KillNortonZone function.
#                   * Added watermark ID.
#          6.0.20 - 03/15/2013 - Corey Swertfager:
#                   * Now removes Norton Zone from loginwindow.plist files.
#                   * Revamped DeleteSymantecLoginItems function to account
#                     for varying key values.
#                   * KillNortonZone function now only runs killall Finder
#                     if Norton Zone process was killed.
#          6.0.21 - 04/26/2013 - Corey Swertfager:
#                   * Now removes:
#                        /Library/Application Support/Symantec/Silo
#                        /usr/local/bin/MigrateQTF
#                        /usr/local/bin [deleted if empty]
#          6.0.22 - 05/10/2013 - Corey Swertfager:
#                   * Now removes:
#                        /var/log/luxtool.log*
#          6.0.23 - 05/14/2013 - Corey Swertfager:
#                   * Now removes:
#                        /var/log/mexd.log
#          6.0.24 - 05/28/2013 - Corey Swertfager:
#                   * Now removes:
#                        /Library/Application Support/nat_*
#                        /Library/Application Support/nav_*
#                        /Library/Application Support/nis_*
#                        /Library/Application Support/nsm_*
#                        /Library/Application Support/norton_*
#                        /Library/Application Support/Symantec/Norton Anti-Theft
#                        /usr/local/bin/CoreLocationProviderTest
#                        /usr/local/bin/LocationProviderInterfaceTest
#                        /usr/local/bin/LocationProviderTest
#                        /usr/local/bin/SkyhookProviderTest
#          6.0.25 - 05/28/2013 - Corey Swertfager:
#                   * Now removes:
#                        /Applications/Norton *
#                        /predelete (installed by Norton Anti-Theft)
#                        {each user's home directory}/Application Support/Symantec
#                        {each user's home directory}/Application Support [deleted if empty]
#          6.1.0 - 06/28/2013 - Corey Swertfager:
#                  * ProcessArguments 1.0.1 is now used to process arguments to allow
#                    options to be combined in one argument that begins with a single
#                    hyphen (e.g., passing -ab to script would be equivalent to passing
#                    -a and -b separately; --ab would be treated as a single option).
#                    The -QQ and -re remain separate arguments for backwards compatibility.
#                  * Added -r option to restart automatically (equivalent to deprecated
#                    -re option).
#                  * Now removes, even when not empty:
#                       /Library/Application Support/Symantec
#                  * Now removes:
#                       /Applications/GatherSymantecInfo
#                       /Library/Application Support/Norton*
#                       /private/var/tmp/symantec_error_report*
#                       /usr/local/lib/libcx_lib.so
#                       /usr/local/lib/liblux.so.1
#                       /usr/local/lib/libnlucallback.dylib
#                       {each user's home directory}/Library/Application Support/Norton*
#                       {each user's home directory}/Library/Saved Application State/com.symantec*
#                  * Now removes Symantec Administration Console for Macintosh files.
#                  * Updated help: changed "Administration Console for Macintosh" to
#                    "Endpoint Protection".
#          6.1.1 - 07/10/2013 - Corey Swertfager:
#                  * Now removes:
#                       {each user's home directory}/Library/Logs/Symantec*
#          6.1.2 - 07/11/2013 - Corey Swertfager:
#                  * Now removes:
#                       /usr/local/lib/liblux.so.*
#          6.1.3 - 07/14/2013 - Corey Swertfager:
#                  * Updated ReadMe.txt.
#                  * Now removes:
#                       {each user's home directory}/Library/Safari/Extensions/Norton*
#          7.0.0 - 07/19/2013 - Corey Swertfager:
#                  * Now removes:
#                       /private/etc/symantec
#                       /var/log/lux.log*
#                  * Updated version to make sure tools updater finds this program.
#          7.0.1 - 08/19/2013 - Corey Swertfager:
#                  * Now removes:
#                       /var/log/du.log*
#                       /var/log/dulux.log*
#                       /var/log/lut.log*
#                       /var/log/mexd.log*
#                       /var/log/microdef.log*
#                  * Now removes logs listed in:
#                       /Library/Application Support/Symantec/Silo/NFM/LiveUpdate/Conf
#                       /private/etc/symantec/defutils.conf
#                       /private/etc/symantec/dulux.logging.conf
#                       /private/etc/symantec/lux.logging.conf
#                       /private/etc/symantec/microdef.logging.conf
#          7.0.2 - 09/05/2013 - Corey Swertfager:
#                  * Now removes:
#                       /Library/Extensions/FileSecurity.kext
#                       /Library/Extensions/SymAPComm.kext
#                       /Library/Extensions/SymFirewall.kext
#                       /Library/Extensions/SymInternetSecurity.kext
#                       /Library/Extensions/SymIPS.kext
#                       /Library/Extensions/SymPersonalFirewall.kext
#          7.0.3 - 09/05/2013 - Corey Swertfager:
#                  * Updated for NIS 6.
#          7.0.4 - 10/15/2013 - Corey Swertfager:
#                  * Now removes for all versions:
#                        /Library/Extensions/ndcengine.kext
#                        /Library/Extensions/NortonForMac.kext
#                        /Library/PrivateFrameworks/SymSEP.framework
#                        /System/Library/Extensions/ndcengine.kext
#                        /System/Library/Extensions/NortonForMac.kext
#                        /usr/bin/nortonscanner
#                        /usr/bin/nortonsettings
#                        /usr/lib/libsymsea.*dylib
#                        /usr/local/bin/nortonsettings
#                        /var/root/Applications/Norton Internet Security.app
#          7.0.5 - 10/28/2013 - Corey Swertfager:
#                  * Updated read me.
#          7.0.6 - 11/05/2013 - Corey Swertfager:
#                  * Updated read me.
#          7.0.7 - 12/03/2013 - Corey Swertfager:
#                  * Now removes:
#                       /Library/Logs/o2spy.log
#          7.0.8 - 12/10/2013 - Corey Swertfager:
#                  * Now removes com.norton.NFM.auth from login keychains.
#                  * Renamed RemoveNortonZoneSavedSessions function to
#                    RemoveLoginKeychainPasswords.
#          7.0.9 - 12/31/2013 - Corey Swertfager:
#                  * Added -F option to show only regular files installed.
#                  * Now removes:
#                       /Library/Internet Plug-Ins/NortonFamilyBF.plugin
#          7.0.10 - 01/15/2014 - Corey Swertfager:
#                   * Now removes:
#                        /Library/Application Support/regid.1992-12.com.symantec*
#          7.0.11 - 02/22/2014 - Corey Swertfager:
#                   * Now removes:
#                        /Library/Logs/SymDebugLeaks.log
#                        /Library/Logs/SymFWDeepSightTrie.txt
#                        /Library/Logs/SymHTTPSubmissions.txt
#                        /Library/Logs/SymInstall.log
#                        /Library/Logs/SymSharedSettingsd.log
#                        /Library/Logs/SymUninstall.log
#                        {each user's home directory}/Library/Logs/SymDebugLeaks.log
#                        {each user's home directory}/Library/Logs/SymFWDeepSightTrie.txt
#                        {each user's home directory}/Library/Logs/SymHTTPSubmissions.txt
#                        {each user's home directory}/Library/Logs/SymInstall.log
#                        {each user's home directory}/Library/Logs/SymSharedSettingsd.log
#                        {each user's home directory}/Library/Logs/SymUninstall.log
#                   * Now flags paths that contain "/com.symantec.errorreporting." or
#                     "/private/etc/liveupdate.conf" as items that are not removed by
#                     NIS 6 uninstaller.
#          7.0.12 - 05/02/2014 - Corey Swertfager:
#                   * Updated for NIS 6.1.
#          7.0.13 - 05/02/2014 - Corey Swertfager:
#                   * Updated for NIS 6.1.
#          7.0.14 - 05/16/2014 - Corey Swertfager:
#                   * Now removes:
#                        /private/tmp/O2Spy.log
#          7.0.15 - 06/03/2014 - Corey Swertfager:
#                   * Now removes:
#                        /Library/Logs/LUTool.txt
#                        /Library/Logs/SymOxygen*
#                   * Updated the way items in /etc, /tmp, and /var are removed to
#                     address Etrack incident 3524977.
#          7.0.16 - 06/19/2014 - Corey Swertfager:
#                   * Now verifies that all programs that this program uses are installed
#                     before attempting to run (Etrack 3539262). See RequiredPrograms below.
#                   * Now verifies results of sed commands are not null before using them.
#                   * DeleteSymantecLoginItems function now skips attempt to remove items
#                     from loginwindow.plist files if plutil is not installed when running
#                     Mac OS 10.4 or later.
#                   * Now flags the following as not removed by Symantec Uninstaller (Etrack 3449908):
#                       {each user's home directory}/Library/Saved Application State/com.symantec*
#          7.0.17 - 06/20/2014 - Corey Swertfager:
#                   * Updated for NIS 6.1.
#          7.0.18 - 07/02/2014 - Corey Swertfager:
#                   * Now removes:
#                        /Library/Services/Norton for Mac.service
#                   * Now exits with 0 instead of 2 when there is a file or folder that
#                     could not be removed.
#          7.0.19 - 07/24/2014 - Corey Swertfager:
#                   * Added KillSymantecProcesses function version 1.0.1.
#                   * To address Etrack 3442959, KillSymantecProcesses is called after predelete
#                     scripts are run before removing files from the boot volume; it is also called
#                     before the attempt to remove "/Library/Application Support/Symantec" again
#                     after all other files have been removed.
#                   * Updated SymantecIsInMemory function.
#          7.0.20 - 08/12/2014 - Corey Swertfager:
#                   * Added GetComputerUsers function to obtain home directories.
#                   * Added RemoveCrashReporterLogs function to remove logs located in:
#                        /Library/Logs/CrashReporter
#                        /Library/Logs/DiagnosticReports
#                        {each user's home directory}/Library/Logs/CrashReporter
#                        {each user's home directory}/Library/Logs/DiagnosticReports
#          7.0.21 - 08/25/2014 - Corey Swertfager:
#                   * Updated list of removed files in read me.
#          7.0.22 - 08/27/2014 - Corey Swertfager:
#                   * Replaced KillSymantecProcesses function with version 1.0.2.
#                   * Added -k option to bypass killing of Symantec processes.
#                   * Killing of Symantec processes is now bypassed if the name of this
#                     program is listed in ListOfProgramsThatShouldNotKillProcesses variable.
#          7.0.23 - 08/27/2014 - Corey Swertfager:
#                   * Removal of items in {each user's home directory}/Library/Logs and
#                     in /Library/Logs is now bypassed if the name of this program is listed
#                     in ListOfProgramsThatShouldNotRemoveLogs variable or if -g is passed.
#                   * Added -g option to bypass removal of items in /Library/Logs and in
#                     {each user's home directory}/Library/Logs.
#          7.0.24 - 08/28/2014 - Corey Swertfager:
#                   * Removal of all non-CrashReporter logs in /Library/Logs and in
#                     {each user's home directory}/Library/Logs is now handled by
#                     RemoveFilesFromLibraryAndUserDirectories function.
#          7.0.25 - 09/08/2014 - Corey Swertfager:
#                   * Now removes ".fsd" folders within:
#                        {each user's home directory}/Downloads
#          7.0.26 - 12/03/2014 - Corey Swertfager:
#                   * Now removes (Etrack 3676902):
#                        {each user's home directory}/Library/LaunchAgents/com.symantec*
#          7.0.27 - 12/08/2014 - Corey Swertfager:
#                   * Added unloading of SymUIAgent to KillSymantecProcesses function.
#          7.0.28 - 12/19/2014 - Corey Swertfager:
#                   * Now removes (Etrack 3689824), based on SCS 7.0 build 14:
#                        /Applications/Symantec Cloud Security.app
#                        /Library/Services/Symantec Cloud Security.service
#          7.0.29 - 01/12/2015 - Corey Swertfager:
#                   * Now removes, based on SCS 7.0 build 25:
#                        /usr/local/lib/libAPFeature.a
#          7.0.30 - 01/13/2015 - Corey Swertfager:
#                   * Updated help.
#          7.0.31 - 02/09/2015 - Corey Swertfager:
#                   * Updated help.
#          7.0.32 - 03/23/2015 - Corey Swertfager:
#                   * Updated DeleteSymantecLoginItems function to remove the
#                     following login items (Etrack 3750842):
#                        /Applications/Norton Internet Security.app
#                        /Applications/Norton Security.app
#                        /Applications/Symantec Cloud Security.app
#                   * Now removes Symantec items from com.apple.loginitems.plist files.
#                   * Now removes (Etrack 3738009):
#                        {each user's home directory}/Library/Application Support/Firefox/Profiles/*/extensions/*@symantec.com.xpi
#                        {each user's home directory}/Library/Safari/Extensions/Symantec*
#                   * Now creates /private/tmp/com.symantec.cleanup.restart
#                     (defined by variable SymantecCleanupRestartFile) whenever
#                     login items have been removed or when some Symantec process
#                     or kext remains in memory so that subsequent runs of this
#                     program will show prompt to restart until computer is restarted.
#                   * Now flags as should not be uninstalled (Etrack 3740028):
#                        {each user's home directory}/Library/LaunchAgents/com.symantec.SCSInstaller.plist
#          7.0.33 - 03/30/2015 - Corey Swertfager:
#                   * Updated for SCS 7.
#          7.0.34 - 04/24/2015 - Corey Swertfager:
#                   * Now removes system profile com.symc.enroll (Etrack 3762326).
#          7.0.35 - 05/07/2015 - Corey Swertfager:
#                   * Added -u option to only output files that are installed that
#                     should have been removed by the UI uninstaller (Etrack 3782491).
#          7.0.36 - 07/01/2015 - Corey Swertfager:
#                   * Now removes:
#                        /usr/local/lib/libsymsea.*dylib
#                        /usr/local/bin/nortonscanner
#          7.0.37 - 07/07/2015 - Corey Swertfager:
#                   * No longer removes when empty (Etrack 3817133):
#                        /usr/local
#          7.0.38 - 07/08/2015 - Corey Swertfager:
#                   * Now removes:
#                        /Applications/Symantec Unified Endpoint Protection.app
#                   * Updated DeleteSymantecLoginItems function to remove the
#                     following login item:
#                        /Applications/Symantec Unified Endpoint Protection.app
#          7.0.39 - 07/21/2015 - Corey Swertfager:
#                   * Now removes (Etrack 3823367):
#                        /Library/Application Support/Symantec_IPUA
#                   * Updated RemoveCrashReporterLogs() function to remove
#                     NFM* and .NFM* files (Etrack 3823960).
#                   * Updated RemoveFilesFromLibraryAndUserDirectories() function
#                     to remove SymBfw_NFM.log.
#          7.0.40 - 08/05/2015 - Corey Swertfager:
#                   * Now removes:
#                        /Library/Services/Symantec*
#          7.0.41 - 08/19/2015 - Corey Swertfager:
#                   * Now removes:
#                        /usr/local/bin/navx
#          7.0.42 - 08/26/2015 - Corey Swertfager:
#                   * Now removes (Etrack 3845478):
#                        /Applications/Symantec Endpoint Protection.app
#                   * No longer removes (Etrack 3845289):
#                        /Library/LaunchDaemons/com.symantec.saturn.plist
#                   * Updated RemoveItem() function: pattern passed to -x
#                     is now treated as an extended regular expression.
#          7.0.43 - 08/26/2015 - Corey Swertfager:
#                   * Now excludes removal of the following (Etrack 3846279)
#                     if the name of this program is listed in the variable
#                     ListOfProgramsThatShouldNotRemoveInstallerLaunchAgents:
#                        {each user's home directory}/Library/LaunchAgents/com.symantec.*Installer.plist
#          7.0.44 - 10/14/2015 - Corey Swertfager:
#                   * Now excludes removal of the following (Etrack 3858305):
#                        /etc/symantec/saturn
#                   * Now excludes removal of the following (Etrack 3864657)
#                     if the name of this program is listed in the variable
#                     ListOfProgramsThatShouldNotRemoveSymantecIPUA:
#                        /Library/Application Support/Symantec_IPUA
#                   * Now removes logs in:
#                        /Library/Application Support/CrashReporter
#                        /Library/Application Support/DiagnosticReports
#                        {each user's home directory}/Library/Application Support/CrashReporter
#                        {each user's home directory}/Library/Application Support/DiagnosticReports
#                   * Now removes LUTool crash logs.
#                   * Updated RemoveItem() function: added -d option.
#          7.0.45 - 10/29/2015 - Corey Swertfager:
#                   * Now removes:
#                        /Library/Logs/SymInstall*
#                        /Library/Logs/SymUninstall*
#                        {each user's home directory}/Library/Logs/SymInstall*
#                        {each user's home directory}/Library/Logs/SymUninstall*
#          7.0.46 - 12/30/2015 - Corey Swertfager:
#                   * Now flags the following as not removed by Symantec Uninstaller (Etrack 3882672):
#                         */Library/Preferences/com.symantec.antivirus.special.plist
#                   * No longer removes when this script is named SymantecRemovalTool (Etrack 3891031):
#                        /Library/LaunchAgents/com.symantec.ipua.plist
#                        /Library/Preferences/com.symantec.ipua.plist
#                        {each user's home directory}/Library/LaunchAgents/com.symantec.ipua.plist
#                        {each user's home directory}/Library/Preferences/com.symantec.ipua.plist

# *** Variable Initializations ***

PATH=/bin:/sbin:/usr/bin:/usr/sbin
SymantecCleanupRestartFile="/private/tmp/com.symantec.cleanup.restart"
AbbreviatedScriptName=`basename "$0" .command 2>/dev/null`
AutoRunScript=false
CurrentVolumeBeingUsed="/"
ExitCodeWhenSomeFileWasNotRemoved=0
ExitCodeWhenFilesRemain=7
FilesRemovedList="/private/tmp/${AbbreviatedScriptName}RemovesThese.txt"
FilesRemovedFilesOnlyList="/private/tmp/${AbbreviatedScriptName}RemovesThese-FilesOnly.txt"
FilesRemovedListOfOld="/Users/Shared/${AbbreviatedScriptName}RemovesThese.txt"
FilesWereSaved=false
FinishedExitCode=0
FullScriptName=`basename "$0" 2>/dev/null`
LANG=""
LaunchLocationGrepPattern='/Library/Application Support/Symantec/Uninstaller\|\.app/Contents/Resources'
ListOfProgramsThatShouldNotKillProcesses="SymantecRemovalTool"
ListOfProgramsThatShouldNotRemoveFSDFolders="SymantecRemovalTool"
ListOfProgramsThatShouldNotRemoveInstallerLaunchAgents="SymantecRemovalTool"
ListOfProgramsThatShouldNotRemoveLogs="SymantecRemovalTool"
ListOfProgramsThatShouldNotRemoveSymantecIPUA="SymantecRemovalTool"
LogFile="/private/tmp/${AbbreviatedScriptName}Log.txt"
LogFileOfOld="/Users/Shared/${AbbreviatedScriptName}Log.txt"
# ----- LoginKeychainPasswordsToDelete BEGIN ------------------------------------------------
#       (2 fields, tab delimited):
#          Item to delete / help text to show
LoginKeychainPasswordsToDelete="com.norton.NFM.auth	Norton Internet Security account info
com.norton.mexico.auth	Norton Zone saved sessions"
# ----- LoginKeychainPasswordsToDelete END --------------------------------------------------
# ----- NotRemovedByNIS6Uninstaller BEGIN ------------------------------------------------
#       A list of paths or partial paths that aren't removed by NIS 6 uninstaller.
#       Add only items that cannot be isolated by the -u option.
NotRemovedByNIS6Uninstaller='/com.symantec.errorreporting.
/etc/liveupdate.conf'
# ----- NotRemovedByNIS6Uninstaller END --------------------------------------------------
NotRemovedByNIS6UninstallerText=" [should not be removed by NIS 6 uninstaller]"
# ----- NotRemovedBySymantecUninstaller BEGIN ------------------------------------------------
#       A list of paths or partial paths that aren't removed by Symantec Uninstaller.app.
#       Add only items that cannot be isolated by the -u option.
NotRemovedBySymantecUninstaller='/Library/LaunchAgents/com.symantec.SCSInstaller.plist
/Library/LaunchDaemons/com.symantec.nis.uninstall.plist
/Library/Logs/SymantecTestPatchers.log
/Library/Preferences/com.symantec.antivirus.special.plist'
# ----- NotRemovedBySymantecUninstaller END --------------------------------------------------
NotRemovedBySymantecUninstallerText=" [should not be removed by Symantec Uninstaller.app]"
PrivateLinksPattern='^/etc/|^/tmp/|^/var/'
PrivateDirectoriesPattern='^/private/etc/|^/private/tmp/|^/private/var/'
PublicVersion=true
# ----- ReceiptsTable BEGIN ------------------------------------------------
#       (2 fields, tab delimited):
#          Receipt name / Receipt option (-a = delete receipt*, -s = skip run of predelete script)
ReceiptsTable='
# Check to make sure there are no vague receipts that may be used by
#    third party software before releasing to the public.
# This line may need to be removed to avoid deleting third party files:
CompatibilityCheck.pkg
# This line may need to be removed to avoid deleting third party files:
Decomposer.pkg
# This line may need to be removed to avoid deleting third party files:
DeletionTracking.pkg
FileSaver.pkg
LiveUpdate	-a
NATRemoteLock.pkg
NATSDPlugin.pkg
NAVContextualMenu.pkg
NAVcorporate.pkg
NAVDefs.pkg
NAVEngine.pkg
NAVWidget.pkg
navx.pkg
NAV_App	-a
NAV_AutoProtect	-a
NFSCore.pkg
NISLaunch.pkg
Norton AntiVirus Application.pkg
Norton AntiVirus Product Log.rtf
Norton AntiVirus.pkg
Norton AutoProtect.pkg
Norton Disk Editor X.pkg
Norton Internet Security Log.rtf
Norton Personal Firewall 3.0 Log.rtf
Norton Scheduled Scans.pkg
Norton Scheduler.pkg
Norton SystemWorks 3.0 Log.rtf
Norton Utilities 8.0 Log.rtf
nortonanti-theftPostflight.pkg
nortonantitheftPostflight.pkg
NortonAutoProtect.pkg
# Remove all NortonAVDefs receipts
NortonAVDefs	-a
NortonDefragger.pkg
NortonDiskDoctor.pkg
NortonFirewall	-a
NortonInternetSecurity	-a
NortonLauncher.pkg
NortonParentalControl.pkg
NortonPersonalFirewall.pkg
NortonPersonalFirewallMenu.pkg
NortonPrivacyControl.pkg
NortonQuickMenu	-a
NPC Installer Log
NPC.pkg
NSMCore.pkg
NSMCore.Universal.pkg
NSWLaunch.pkg
NUMCompatibilityCheck.pkg
NumDocs.pkg
NUMLaunch.pkg
PredeleteTool.pkg
SavLog.pkg
# This line may need to be removed to avoid deleting third party files:
Scheduled Scans.pkg
# This line may need to be removed to avoid deleting third party files:
Scheduler.pkg
SDProfileEditor.pkg
SMC.pkg
SNAC.pkg
SpeedDisk.pkg
# NAV 9 installs the StuffIt engine if it needs to and creates the
# StuffIt.pkg receipt for it. The following line may need to be removed
# (but should not need to be) to avoid deleting third party files:
StuffIt.pkg
Symantec Alerts.pkg
Symantec AntiVirus.pkg
Symantec AutoProtect Prefs.pkg
Symantec AutoProtect.pkg
Symantec Decomposer.pkg
Symantec Endpoint Protection.pkg
Symantec Scheduled Scans.pkg
Symantec Scheduler.pkg
# Remove all SymantecAVDefs receipts
SymantecAVDefs	-a
SymantecClientFirewall.pkg
SymantecDecomposer.pkg
SymantecDeepSightExtractor.pkg
SymantecParentalControl.pkg
SymantecQuickMenu.pkg
SymantecSAQuickMenu.pkg
SymantecSharedComponents	-a
SymantecUninstaller	-a
SymantecURLs.pkg
SymAV10StuffItInstall.pkg
SymAVScanServer.pkg
SymConfidential	-a
SymConfidentialData.pkg
SymDaemon	-a
SymDC.pkg
SymDiskMountNotify.pkg
SymErrorReporting.pkg
SymEvent.pkg
SymFileSecurity	-a
SymFirewall	-a
SymFS.pkg
SymHelper.pkg
SymHelpScripts.pkg
SymInstallExtras.pkg
SymInternetSecurity.pkg
SymIntrusionPrevention	-a
SymIPS.pkg
SymLicensing	-a
SymNCOApplication	-a
SymOxygen.pkg
SymOSXKernelUtilities.pkg
SymPersonalFirewallCore	-a
SymPersonalFirewallUI	-a
SymProtector.pkg
SymPseudoLicensing	-a
SymSetupAssistant	-a
SymSharedFrameworks	-a
SymSharedSettings	-a
SymStuffit.pkg
SymSubmission.pkg
SymUIAgent	-a
SymWebFraud	-a
SymWebKitUtils.pkg
Unerase.pkg
# This line may need to be removed to avoid deleting third party files:
URL.pkg
VolumeAssist.pkg
VolumeRecover.pkg
WCIDEngine.pkg
Wipe Info.pkg
ZoneStandalone.pkg
'
# ----- ReceiptsTable END --------------------------------------------------
# ----- RequiredPrograms BEGIN ------------------------------------------------
RequiredPrograms='
awk
basename
cat
cd
chmod
cp
crontab
date
defaults
dirname
echo
egrep
expr
find
grep
head
kill
ls
mkdir
more
printf
ps
pwd
read
rm
sed
sort
sudo
tail
tr
uniq
'
# ----- RequiredPrograms END --------------------------------------------------
SavedFilesDir="/private/tmp/${AbbreviatedScriptName}SavedFiles"

# *** Function Declarations ***

AssignVolume()
{
   # Usage:     AssignVolume $1
   # Argument:  $1 = Volume name. The name can begin with "/Volumes/"
   #                 unless it is "/" (boot volume).
   # Summary:   Assigns the name of the volume passed as $1 to VolumesToUse.
   #            If volume is assigned, 0 is returned; else, 1 is returned.
   #
   # If nothing passed, skip assignment
   [ -z "$1" ] && return 1
   VolumeToAssign=`CheckIfValidVolume "$1"`
   if [ -z "$VolumeToAssign" ] ; then
      VolumeToAssign=`CheckIfValidVolume "/Volumes/$1"`
      [ -z "$VolumeToAssign" ] && return 1
   fi
   [ "$VolumeToAssign" = "/" ] && BootVolumeWillBeSearched=true
   VolumesToUse="$VolumesToUse
$VolumeToAssign"
   return 0
}

CheckIfValidVolume()
{
   # Usage:     CheckIfValidVolume volume
   # Summary:   If volume is a valid volume path, the path, with extra
   #            slashes removed, is written to standard output.
   #
   local PathToPrint=""
   local VolumePathToCheck="$1"
   # If VolumePathToCheck is the boot volume
   if [ "$VolumePathToCheck" -ef / ] ; then
      PathToPrint=/
   # Else if VolumePathToCheck begins with /
   elif [ "`printf "%s" "$VolumePathToCheck" | grep '^/'`" ] ; then
      # If it is a directory and not a link
      if [ -d "$VolumePathToCheck" -a ! -L "$VolumePathToCheck" ] ; then
         # Strip any extra slashes
         VolumePathToCheck=`printf "%s" "$VolumePathToCheck" | sed 's|//*|/|g'`
         if [ "`dirname "$VolumePathToCheck"`" = "/Volumes" ] ; then
            PathToPrint="/Volumes/`basename "$VolumePathToCheck"`"
         fi
      fi
   fi
   [ "$PathToPrint" ] && echo "$PathToPrint"
}
	
DeleteCrontabEntries()
{
   # Usage:     DeleteCrontabEntries [$1]
   # Argument:  $1 = Volume name. The name should begin with "/Volumes/"
   #                 unless it is "/" (boot volume). If NULL, then / is
   #                 used as volume name.
   # Authors:   John Hansen, Corey Swertfager
   # Summary:   Deletes from / or volume specified the crontab entries
   #            created by Norton Scheduler and Symantec Scheduler.
   # Note:      User must be root when calling this function.
   #
   if [ "z$1" = z/ ] ; then
      VolumeToDeleteCrontabsFrom=""
   else
      VolumeToDeleteCrontabsFrom="$1"
   fi
   CRONDIRNEW="$VolumeToDeleteCrontabsFrom/private/var/at/tabs"   # OS 10.5 and later crontab directory
   CRONDIROLD="$VolumeToDeleteCrontabsFrom/private/var/cron/tabs"   # OS 10.4 and earlier crontab directory
   if [ ! -d "$CRONDIRNEW" -a ! -d "$CRONDIROLD" ] ; then
      if $CreateFilesRemovedListOnly ; then
         if [ -z "$VolumeToDeleteCrontabsFrom" ] ; then
            echo "No crontab directory was found on on the current boot volume." >> "$FilesRemovedList"
         else
            echo "No crontab directory was found on on the volume \"`basename "$VolumeToDeleteCrontabsFrom"`\"." >> "$FilesRemovedList"
         fi
         echo "" >> "$FilesRemovedList"
      else
         if [ -z "$VolumeToDeleteCrontabsFrom" ] ; then
            echo "No crontab directory was found on on the current boot volume."
         else
            echo "No crontab directory was found on on the volume \"`basename "$VolumeToDeleteCrontabsFrom"`\"."
         fi
      fi
      return 1
   fi
   TEMPFILETEMPLATE="/private/tmp/NortonTemp"
   GREP1="^#SqzS"
   GREP2="^#SYMANTEC SCHEDULER CRON ENTRIES"
   GREP3="^#PLEASE DO NOT EDIT\.$"
   GREP4="EvType1=.*EvType2=.*Sched="
   GREP5="Norton Solutions Support/Scheduler/schedLauncher"
   GREP6="Symantec/Scheduler/SymSecondaryLaunch.app/Contents/schedLauncher"
   SymantecCrontabEntryExists=false
   CurrentDir="`pwd`"	# Save initial directory location
   # Set IFS to only newline to get all crontabs
   IFS='
'
   for CRONDIR in `ls -d "$CRONDIRNEW" "$CRONDIROLD" 2>/dev/null` ; do
      cd "$CRONDIR"
      # List each crontab, pipe through grep command and replace
      for user in $ComputerUsers ; do
         # If there is no crontab file for this user, skip user
         [ ! -f "$user" ] && continue
         # If deleting from boot volume
         if [ -z "$VolumeToDeleteCrontabsFrom" ] ; then
            # Check to see if there is a Symantec crontab entry
            if [ "`crontab -u "$user" -l | grep -c "$GREP1\|$GREP2\|$GREP3\|$GREP4\|$GREP5\|$GREP6"`" != 0 ] ; then
               SymantecCrontabEntryExists=true
            else
               continue   # Nothing to remove, skip user
            fi
            $CreateFilesRemovedListOnly && break
            TEMPFILE="$TEMPFILETEMPLATE`date +"%Y%m%d%H%M%S"`"
            crontab -u "$user" -l | grep -v "$GREP1\|$GREP2\|$GREP3\|$GREP4\|$GREP5\|$GREP6" > $TEMPFILE
            # Restore crontab file if it has more entries, else remove
            if [ -s "$TEMPFILE" ] ; then
               crontab -u "$user" $TEMPFILE &>/dev/null
            else
               echo "y" | crontab -u "$user" -r &>/dev/null
            fi
         else
            # Check to see if there is a Symantec crontab entry
            if [ "`grep -c "$GREP1\|$GREP2\|$GREP3\|$GREP4\|$GREP5\|$GREP6" "$user"`" != 0 ] ; then
               SymantecCrontabEntryExists=true
            else
               continue   # Nothing to remove, skip user
            fi
            $CreateFilesRemovedListOnly && break
            TEMPFILE="$TEMPFILETEMPLATE`date +"%Y%m%d%H%M%S"`"
            grep -v "$GREP1\|$GREP2\|$GREP3\|$GREP4\|$GREP5\|$GREP6" "$user" > $TEMPFILE
            # Restore crontab file if it has more entries, else remove
            if [ -s "$TEMPFILE" ] ; then
               cat $TEMPFILE >"$user"
            else
               rm -f "$user" 2>/dev/null
            fi
         fi
         /bin/rm "$TEMPFILE" 2>/dev/null
      done
      [ $CreateFilesRemovedListOnly = true -a $SymantecCrontabEntryExists = true ] && break
   done
   cd "$CurrentDir"	# Return to intial directory
   if $SymantecCrontabEntryExists ; then
      if $CreateFilesRemovedListOnly ; then
         if [ -z "$VolumeToDeleteCrontabsFrom" ] ; then
            echo "Symantec crontab entries would be deleted from the current boot volume." >> "$FilesRemovedList"
         else
            echo "Symantec crontab entries would be deleted from the volume" >> "$FilesRemovedList"
            echo "\"`basename "$VolumeToDeleteCrontabsFrom"`\"." >> "$FilesRemovedList"
         fi
         echo "" >> "$FilesRemovedList"
      else
         if [ -z "$VolumeToDeleteCrontabsFrom" ] ; then
            echo "Symantec crontab entries were deleted from the current boot volume."
         else
            echo "Symantec crontab entries were deleted from the volume"
            echo "\"`basename "$VolumeToDeleteCrontabsFrom"`\"."
         fi
      fi
      NoFilesToRemove=false
   else
      if $CreateFilesRemovedListOnly ; then
         if [ -z "$VolumeToDeleteCrontabsFrom" ] ; then
            echo "There are no Symantec crontab entries on the current boot volume;" >> "$FilesRemovedList"
            echo "no crontab entries would be removed from it." >> "$FilesRemovedList"
         else
            echo "There are no Symantec crontab entries on the volume \"`basename "$VolumeToDeleteCrontabsFrom"`\";" >> "$FilesRemovedList"
            echo "no crontabs would be adjusted on that volume." >> "$FilesRemovedList"
         fi
         echo "" >> "$FilesRemovedList"
      elif [ -z "$VolumeToDeleteCrontabsFrom" ] ; then
         echo "There are no Symantec crontab entries to delete from the current boot volume."
      else
         echo "There are no Symantec crontab entries to delete from the volume"
         echo "\"`basename "$VolumeToDeleteCrontabsFrom"`\"."
      fi
   fi
   return 0
}

DeleteLaunchdPlists()
{
   # Usage:     DeleteLaunchdPlists [$1]
   # Argument:  $1 = Volume name. The name should begin with "/Volumes/"
   #                 unless it is "/" (boot volume). If NULL, then / is
   #                 used as volume name.
   # Summary:   Deletes from / or volume specified the launchd plists
   #            created by Symantec Scheduler.
   # Note:      User must be root when calling this function.
   #
   if [ "z$1" = z/ ] ; then
      VolumeToDeleteLaunchdPlistsFrom=""
   else
      VolumeToDeleteLaunchdPlistsFrom="$1"
   fi
   LaunchdPlists=`ls -d "$VolumeToDeleteLaunchdPlistsFrom/Library/LaunchDaemons/com.symantec.Sched"*.plist 2>/dev/null`
   if [ "$LaunchdPlists" ] ; then
      if $CreateFilesRemovedListOnly ; then
         if [ -z "$VolumeToDeleteLaunchdPlistsFrom" ] ; then
            echo "Symantec Scheduler launchd plists would be deleted from the current boot volume." >> "$FilesRemovedList"
         else
            echo "Symantec Scheduler launchd plists would be deleted from the volume" >> "$FilesRemovedList"
            echo "\"`basename "$VolumeToDeleteLaunchdPlistsFrom"`\"." >> "$FilesRemovedList"
         fi
         echo "" >> "$FilesRemovedList"
      else
         IFS='
'
         for EachPlist in $LaunchdPlists ; do
            rm -f "$EachPlist" 2>/dev/null
         done
         if [ -z "$VolumeToDeleteLaunchdPlistsFrom" ] ; then
            echo "Symantec Scheduler launchd plists were deleted from the current boot volume."
         else
            echo "Symantec Scheduler launchd plists were deleted from the volume"
            echo "\"`basename "$VolumeToDeleteLaunchdPlistsFrom"`\"."
         fi
      fi
      NoFilesToRemove=false
   else
      if $CreateFilesRemovedListOnly ; then
         if [ -z "$VolumeToDeleteLaunchdPlistsFrom" ] ; then
            echo "There are no Symantec Scheduler launchd plists on the current boot volume," >> "$FilesRemovedList"
            echo "so none would be removed from it." >> "$FilesRemovedList"
         else
            echo "There are no Symantec Scheduler launchd plists on the volume" >> "$FilesRemovedList"
            echo "\"`basename "$VolumeToDeleteLaunchdPlistsFrom"`\", so none would be removed from it." >> "$FilesRemovedList"
         fi
         echo "" >> "$FilesRemovedList"
      elif [ -z "$VolumeToDeleteLaunchdPlistsFrom" ] ; then
         echo "There are no Symantec Scheduler launchd plists to delete from the current boot"
         echo "volume."
      else
         echo "There are no Symantec Scheduler launchd plists to delete from the volume"
         echo "\"`basename "$VolumeToDeleteLaunchdPlistsFrom"`\"."
      fi
   fi
   return 0
}

DeleteSymantecLoginItems()
{
   # Usage:     DeleteSymantecLoginItems [volume]
   #
   # Argument:  volume - volume from which to remove login items; volume must
   #            begin with "/Volumes/" unless it is "/" (boot volume); if
   #            nothing is passed, / is assumed.
   #
   # Summary:   Deletes Symantec items from all com.apple.loginitems.plist and
   #            loginwindow.plist files on volume specified.
   #
   #            If a file is purged on the boot volume, file path defined by
   #            SymantecCleanupRestartFile is created so that reboot messaging
   #            can be displayed by scripts that use this function.
   #
   # Returns:   The number of files purged.
   #
   # Note:      If this function is run while booted in OS 10.1.x, it will
   #            not be able to adjust loginwindow.plist files on an OS 10.4
   #            or later volume because plutil did not ship with OS 10.1.x.
   #
   #            The com.apple.loginitems.plist files are not purged if
   #            /usr/libexec/PlistBuddy does not exist (PlistBuddy first
   #            appeared in OS 10.5).
   #
   #            GetComputerUsers() function must be run before calling this
   #            function so that ComputerUsersHomeDirsAndRootDir is defined.
   #
   #            CreateFilesRemovedListOnly and FilesRemovedList variables are
   #            used only in Norton Cleanup scripts.
   #
   # Version:   3.0.0
   #
   local ArrayItem
   local Base
   local Buffer
   local CheckSyntax
   local CreateFilesRemovedListOnly="$CreateFilesRemovedListOnly"
   local Line
   local NameKeyValue
   local NumberOfFilesPurged=0
   local OriginalPlistFile
   local PatternOfKeyNames=""
   local PatternOfKeyNamesToExclude="Norton Solutions|Symantec|SymSecondaryLaunch|Norton"
   local PatternOfPaths=""
   local PlistBuddyError
   local PropertyKeyToUse
   local StartupPathPatterns="/Applications/Norton Internet Security.app
/Applications/Norton Security.app
/Applications/Symantec Cloud Security.app
/Applications/Symantec Unified Endpoint Protection.app
/Library/Application Support/Norton Solutions
/Library/Application Support/Symantec
/Library/Application Support/Sym[an][na]tec/Scheduler/SymSecondaryLaunch.app
/Library/StartupItems/Norton
/Norton Zone.app"
   local SymantecLoginItemsWereFound=false
   local SymantecLoginItemWasFound
   local TargetVolume="$1"
   local TempFileTemplate=/private/tmp/Delete_Symantec_Login_Items
   local TempScrapFile=${TempFileTemplate}`date +"%Y%m%d%H%M%S"`-Scrap
   local TempPlistFile=${TempFileTemplate}`date +"%Y%m%d%H%M%S"`-PlistCopy
   [ "$1" -ef / ] && TargetVolume=""
   [ "z$CreateFilesRemovedListOnly" != ztrue -o ! -f "$FilesRemovedList" ] && CreateFilesRemovedListOnly=false
   [ -z "$SymantecCleanupRestartFile" ] && SymantecCleanupRestartFile="/private/tmp/com.symantec.cleanup.restart"
   which plutil &>/dev/null
   # If plutil program is not installed
   if [ $? != 0 ] ; then
      # If running OS 10.4 or later
      if [ $OSXmajorVersion -gt 3 ] ; then
         # Show message and skip plist adjustments because plists are in binary format in OS 10.4 and later
         if $CreateFilesRemovedListOnly ; then
            echo "NOTE: plutil is not installed, so loginwindow.plist files cannot be adjusted." >> "$FilesRemovedList"
         else
            echo "NOTE: plutil is not installed, so loginwindow.plist files cannot be adjusted."
         fi
         return
      fi
   fi
   IFS='
'
   for Line in $StartupPathPatterns ; do
      PatternOfPaths="$PatternOfPaths`[ "$PatternOfPaths" ] && echo '|'`$Line"
      Base=`basename "$Line" .app`
      if [ -z "`echo "$Base" | egrep -xe "$PatternOfKeyNamesToExclude"`" ] ; then
         PatternOfKeyNames="$PatternOfKeyNames`[ "$PatternOfKeyNames" ] && echo '|'`$Base"
      fi
   done
   # Remove login items from loginwindow.plist files
   for EachHomeDir in $ComputerUsersHomeDirsAndRootDir ; do
      if [ "$EachHomeDir" = / ] ; then
         OriginalPlistFile="$TargetVolume/Library/Preferences/loginwindow.plist"
      else
         OriginalPlistFile="$TargetVolume$EachHomeDir/Library/Preferences/loginwindow.plist"
      fi
      [ ! -f "$OriginalPlistFile" ] && continue
      rm -rf "$TempPlistFile" 2>/dev/null
      cp "$OriginalPlistFile" "$TempPlistFile"
      CheckSyntax=true
      plutil -convert xml1 "$TempPlistFile" 2>/dev/null
      # If plutil failed to convert the plist, don't check syntax later
      [ $? != 0 ] && CheckSyntax=false
      IsBinaryFormat=false
      # If original plist is different than converted plist, treat it as a binary file
      [ -n "`diff "$OriginalPlistFile" "$TempPlistFile" 2>/dev/null`" ] && IsBinaryFormat=true
      # If no Symantec login item was found, skip to next file
      [ `egrep -c -e "$PatternOfPaths" "$TempPlistFile"` = 0 ] && continue
      SymantecLoginItemsWereFound=true
      if $CreateFilesRemovedListOnly ; then
         echo "Symantec login items would be removed from:" >> "$FilesRemovedList"
         echo "   \"$OriginalPlistFile\"" >> "$FilesRemovedList"
         continue
      fi
      # Purge Symantec login item(s)
      printf "" > "$TempScrapFile"
      Buffer=""
      DoWriteBuffer=true
      for Line in `cat "$TempPlistFile"` ; do
         # If beginning of a dictionary key
         if [ "`printf "%s" "$Line" | grep '<dict>$'`" ] ; then
            [ "$Buffer" ] && echo "$Buffer" >> "$TempScrapFile"
            Buffer="$Line"
            DoWriteBuffer=true
         else
            if [ "$Buffer" ] ; then
               Buffer="$Buffer
$Line"
            else
               Buffer="$Line"
            fi
            # If end of a dictionary key
            if [ "`printf "%s" "$Line" | grep '</dict>$'`" ] ; then
               $DoWriteBuffer && echo "$Buffer" >> "$TempScrapFile"
               Buffer=""
               DoWriteBuffer=true
            # Else if Symantec path was found
            elif [ "`printf "%s" "$Line" | egrep "$PatternOfPaths"`" ] ; then
               DoWriteBuffer=false
            fi
         fi
      done
      [ "$Buffer" ] && echo "$Buffer" >> "$TempScrapFile"
      # If some login item information is missing
      if [ `grep -c '<dict>$' "$TempScrapFile"` != `grep -c '</dict>$' "$TempScrapFile"` ] ; then
         echo "ERROR: Could not remove Symantec login items from:"
         echo "       $OriginalPlistFile"
      # Else if syntax is to be checked and plist contains bad syntax
      elif [ $CheckSyntax = true -a -n "`plutil -s "$TempScrapFile" 2>/dev/null`" ] ; then
         echo "ERROR: Could not remove Symantec login items (plutil conversion failed) from:"
         echo "       $OriginalPlistFile"
      else
         echo "Removing Symantec login items from:"
         echo "   \"$OriginalPlistFile\""
         cat "$TempScrapFile" > "$OriginalPlistFile"
         $IsBinaryFormat && plutil -convert binary1 "$OriginalPlistFile" 2>/dev/null
         let NumberOfFilesPurged=$NumberOfFilesPurged+1
      fi
   done
   rm -f "$TempScrapFile" 2>/dev/null
   # Remove login items from com.apple.loginitems.plist files if PlistBuddy is installed
   if [ -f /usr/libexec/PlistBuddy ] ; then
      for EachHomeDir in $ComputerUsersHomeDirsAndRootDir ; do
         if [ "$EachHomeDir" = / ] ; then
            OriginalPlistFile="$TargetVolume/Library/Preferences/com.apple.loginitems.plist"
         else
            OriginalPlistFile="$TargetVolume$EachHomeDir/Library/Preferences/com.apple.loginitems.plist"
         fi
         [ ! -f "$OriginalPlistFile" ] && continue
         rm -rf "$TempPlistFile" 2>/dev/null
         cp "$OriginalPlistFile" "$TempPlistFile"
         PropertyKeyToUse=':privilegedlist:CustomListItems'
         NameKeyValue=`/usr/libexec/PlistBuddy "$TempPlistFile" -c "print ${PropertyKeyToUse}:0:Name" 2>/dev/null`
         if [ -z "$NameKeyValue" ] ; then
            PropertyKeyToUse=':SessionItems:CustomListItems'
            NameKeyValue=`/usr/libexec/PlistBuddy "$TempPlistFile" -c "print ${PropertyKeyToUse}:0:Name" 2>/dev/null`
            [ -z "$NameKeyValue" ] && continue
         fi
         PlistBuddyError=0
         SymantecLoginItemWasFound=false
         ArrayItem=0
         while [ "$NameKeyValue" ] ; do
            # If this is a Symantec login item that should be deleted
            if [ "`printf "%s" "$NameKeyValue" | egrep -xe "$PatternOfKeyNames"`" ] ; then
               SymantecLoginItemWasFound=true
               $CreateFilesRemovedListOnly && break
               /usr/libexec/PlistBuddy "$TempPlistFile" -c "delete ${PropertyKeyToUse}:$ArrayItem" 2>/dev/null
               PlistBuddyError=$?
               [ $PlistBuddyError != 0 ] && break
            else
               let ArrayItem=$ArrayItem+1
            fi
            NameKeyValue=`/usr/libexec/PlistBuddy "$TempPlistFile" -c "print ${PropertyKeyToUse}:$ArrayItem:Name" 2>/dev/null`
         done
         $SymantecLoginItemWasFound && SymantecLoginItemsWereFound=true
         if $CreateFilesRemovedListOnly ; then
            if $SymantecLoginItemWasFound ; then
               echo "Symantec login items would be removed from:" >> "$FilesRemovedList"
               echo "   \"$OriginalPlistFile\"" >> "$FilesRemovedList"
            fi
         # Else if some login item could not be deleted
         elif [ $PlistBuddyError != 0 ] ; then
            echo "ERROR: Could not remove Symantec login items from:"
            echo "       $OriginalPlistFile"
         elif $SymantecLoginItemWasFound ; then
            echo "Removing Symantec login items from:"
            echo "   \"$OriginalPlistFile\""
            cp "$TempPlistFile" "$OriginalPlistFile"
            let NumberOfFilesPurged=$NumberOfFilesPurged+1
         fi
      done
   fi
   rm -f "$TempPlistFile" 2>/dev/null
   if ! $SymantecLoginItemsWereFound ; then
      if $CreateFilesRemovedListOnly ; then
         echo "No Symantec login items were found." >> "$FilesRemovedList"
      else
         echo "No Symantec login items were found."
      fi
   fi
   $CreateFilesRemovedListOnly && echo "" >> "$FilesRemovedList"
   # If some Symantec items were purged from files on boot volume, trigger restart
   [ $NumberOfFilesPurged -gt 0 -a -z "$TargetVolume" ] && touch "$SymantecCleanupRestartFile"
   return $NumberOfFilesPurged
}

DetermineAction()
{
   # Usage:     DetermineAction
   # Summary:   Determines which action to take based on user input.
   #
   clear
   echo
   ShowVersion
   echo "
WARNING: This script will remove all files and folders created by Symantec
         OS X products (except Symantec Adminstration Console for Macintosh
         files) and any files within those folders. Therefore, you will
         lose ALL files that reside in those folders, including any that
         you have created.
"
   echo "1 - Remove all Symantec files/folders."
   echo
   echo "2 - Quit. Do not remove any files."
   echo
   printf "Enter choice (1 or 2): "
   read choice
   echo
   case "`echo "z$choice" | awk '{print tolower(substr($0,2))}'`" in
      1)   # Remove files
         CreateFilesRemovedListOnly=false
         ;;
      2|q|quit)   # Quit
         echo "Program cancelled. No files were removed."
         ExitScript 0
         ;;
      *)   # Show choices again
         DetermineAction
         ;;
   esac
}

ExitScript()
{
   # Usage:     ExitScript [-b] [-e] [exit_number [error_string]]
   # Summary:   Checks to see if ShowQuitMessage and RunScriptAsStandAlone
   #            variables are set to true. If so, a message is displayed;
   #            otherwise, no message is displayed. The script is then
   #            exited and passes exit_number to exit command. If no
   #            exit_number is passed, then 0 is passed to exit command. If
   #            a non-integer is passed as exit_number, 255 is passed to
   #            exit command. If error_string is passed, it is printed to
   #            to standard out before exiting and is padded by blank lines 
   #            if error_string is not "". Pass -b before exit_number to
   #            suppress beginning padding line, -e to suppress ending
   #            padding line, both to suppress both. Also removes temp
   #            files and kills Terminal if need be.
   #
   local PadBeginning=true
   local PadEnd=true
   while [ "$1" ] ; do
      case "$1" in
         -b)
            PadBeginning=false
            ;;
         -e)
            PadEnd=false
            ;;
         *)
            break
            ;;
      esac
      shift
   done
   rm -f "$FilesRemovedList" "$FilesRemovedFilesOnlyList" "$LogFile" 2>/dev/null 1>&2
   if $QuitTerminalForcefully ; then
      KillTerminal
   fi
   if [ $# -gt 1 ] ; then
      if [ -z "$2" ] ; then
         PadBeginning=false
         PadEnd=false
      fi
      $PadBeginning && echo 
      printf "%s\n" "$2"
      $PadEnd && echo
   fi
   if [ "z$ShowQuitMessage" = ztrue -a "z$RunScriptAsStandAlone" = ztrue ] ; then
      [ $# -lt 2 -o \( $PadEnd = false -a -n "$2" \) ] && echo
      echo "NOTE: If you double-clicked this program, quit Terminal application now."
      [ $PadEnd = true -o -z "$2" ] && echo
   fi
   [ -z "$1" ] && exit 0
   [ -z "`expr "$1" / 1 2>/dev/null`" ] && exit 255 || exit $1
}

FinishCleanup()
{
   # Usage:     FinishCleanup
   # Summary:   Displays then deletes the file named by LogFile, a log
   #            of files not removed by RemoveItem function, if ErrorOccurred
   #            is true. If NoFilesToRemove is true, a message is shown
   #            and the function is exited. If RemoveInvisibleFilesOnly
   #            is true, a message is shown and the function is exited;
   #            otherwise, a message is shown. Returns value assigned to
   #            ExitCodeWhenSomeFileWasNotRemoved if ErrorOccurred is true,
   #            0 otherwise.
   #
   if $DoShowOnlyFilesThatShouldHaveBeenUninstalled ; then
      FilesThatRemain=`cat "$FilesRemovedList" 2>/dev/null | grep '^/' | egrep -ve "$NotRemovedByNIS6UninstallerText|$NotRemovedBySymantecUninstallerText"`
      if [ "$FilesThatRemain" ] ; then
         echo "$FilesThatRemain"
         return $ExitCodeWhenFilesRemain
      else
         return 0
      fi
   elif $CreateFilesRemovedListOnly ; then
      clear >&2
      if $UseMore ; then
         ShowContents "$FilesRemovedList"
      else
         cat "$FilesRemovedList"
      fi
      echo ""  >&2
      echo "NOTE: No files have been removed."  >&2
      echo ""  >&2
      /bin/rm -rf "$FilesRemovedList" "$FilesRemovedFilesOnlyList" 2>/dev/null 1>&2
      return 0
   elif $ErrorOccurred ; then
      echo
      # Display LogFile
      ShowContents "$LogFile"
      # Remove LogFile
      /bin/rm -rf "$LogFile" 2>/dev/null 1>&2
      echo
      if $RemoveInvisibleFilesOnly ; then
         echo "NOTE: Not all of the invisible Symantec files were removed."
         echo "      Make sure each volume passed is unlocked and accessible."
      else
         echo "NOTE: Not all folders/files were removed."
         echo "      Perhaps a file or folder listed above is in use or a folder"
         echo "      listed above is not empty."
         if $RestartMayBeNeeded ; then
            echo
            echo "Some Symantec product files have been removed from the boot volume."
         else
            if $SomeFileWasRemoved ; then
               echo
               echo "Some folders or files have been removed."
            fi
         fi
      fi
      return $ExitCodeWhenSomeFileWasNotRemoved
   fi
   if $RemoveInvisibleFilesOnly ; then
      if $NoFilesToRemove ; then
         echo "There were no invisible Symantec files to be removed."
      else
         echo "AntiVirus QuickScan and/or Norton FS files have been removed."
      fi
      return 0
   fi
   if $NoFilesToRemove ; then
      echo "There were no files that needed to be removed. No files were removed."
      return 0
   fi
   $RemoveCrontabEntriesOnly && return 0
   echo
   if $RestartMayBeNeeded ; then
      printf "Symantec product files have been removed from the boot volume"
      if $SomeFileWasRemovedFromNonBootVolume ; then
         echo
         echo "and from other volume(s) listed above."
      else
         echo "."
      fi
   else
      echo "Symantec product files have been removed from the above volume(s)."
   fi
   return 0
}

GetAdminPassword()
{
   # Usage:     GetAdminPassword [$1]
   # Argument:  $1 - Prompt for password. If true is passed, a user that
   #                 is not root will always be asked for a password. If
   #                 something other than true is passed or if nothing is
   #                 passed, then a user that is not root will only be
   #                 prompted for a password if authentication has lapsed.
   # Summary:   Gets an admin user password from the user so that
   #            future sudo commands can be run without a password
   #            prompt. The script is exited with a value of 1 if
   #            the user enters an invalid password or if the user
   #            is not an admin user. If the user is the root user,
   #            then there is no prompt for a password (there is
   #            no need for a password when user is root).
   #            NOTE: Make sure ExitScript function is in the script.
   #
   # If root user, no need to prompt for password
   [ "`whoami`" = "root" ] && return 0
   echo >&2
   # If prompt for password
   if [ "$1" = "true" -o "$1" = "true" ] ; then
      ShowVersion >&2
      echo >&2
      sudo -k >&2   # Make sudo require a password the next time it is run
      echo "You must be an admin user to run this script." >&2
   fi
   # A dummy sudo command to get password
   sudo -p "Please enter your admin password: " date 2>/dev/null 1>&2
   if [ ! $? = 0 ] ; then       # If failed to get password, alert user and exit script
      echo "You entered an invalid password or you are not an admin user. Script aborted." >&2
      ExitScript 1
   fi
}

GetComputerUsers()
{
   # Usage:     GetComputerUsers [-r] [volume]
   #
   # Version:   1.0.1
   #
   # Summary:   Defines the following variables:
   #
   #               ComputerUsers
   #               ComputerUsersHomeDirs
   #               ComputerUsersHomeDirsAndRootDir
   #               ComputerUsersTable
   #
   #            Omitted are users whose home directories contain no Library
   #            directory and users that are not root whose home directory is
   #            /var/root. If volume is passed and there is no /Users on that
   #            volume, variables are all set to "". ComputerUsersTable is a
   #            list of users and their home directories, separated by tabs.
   #
   # Note:      This function must be run as root to find all users. When an
   #            OS X volume other than / is passed or if the dscl program fails
   #            or does not exist, non-root users that do not have their home
   #            directories in /Users are not included and root's home directory
   #            is assumed to be /var/root.
   #
   # History:   1.0.1 - 08/11/2014 - Corey Swertfager:
   #                    * Added ComputerUsersTable variable assignment.
   #                    * Now always includes root user in case this function
   #                      is not run as root.
   #                    * Added volume argument.
   #
   local CurrentDir
   local GCUHomeDir
   local CGLibraryDir
   local CGLibraryDirs
   local GCUUser
   local GCUUsers
   local SavedIFS="$IFS"
   local VolumePassed="$1"
   ComputerUsers=""
   ComputerUsersHomeDirs=""
   ComputerUsersHomeDirsAndRootDir=""
   ComputerUsersTable=""
   # If a directory other than / is passed
   if [ -d "$VolumePassed" -a ! "$VolumePassed" -ef / ] ; then
      # If not an OS X volume, skip it
      [ ! -d "$VolumePassed/Users" ] && return
      CurrentDir=`pwd`
      cd "$VolumePassed"
      CGLibraryDirs=`ls -d Users/*/Library 2>/dev/null | grep -v 'Users/Shared'`
      cd "$CurrentDir"
      # If no Library folders were found, skip
      [ -z "$CGLibraryDirs" ] && return
      CGLibraryDirs="$CGLibraryDirs
var/root/Library"
      IFS='
'
      for CGLibraryDir in $CGLibraryDirs ; do
         GCUHomeDir="/`dirname "$CGLibraryDir"`"
         GCUUser=`basename "$GCUHomeDir"`
         ComputerUsersHomeDirs="$ComputerUsersHomeDirs
$GCUHomeDir"
         ComputerUsers="$ComputerUsers
$GCUUser"
         ComputerUsersTable="$ComputerUsersTable
$GCUUser	$GCUHomeDir"
      done
   else
      GCUUsers=`dscl . list /Users 2>/dev/null | egrep '^[[:alnum:]]' | egrep -vx 'daemon|nobody'`
      if [ -z "$GCUUsers" ] ; then
         GCUUsers="`ls /Users | egrep '^[[:alnum:]]' | grep -vx Shared`
root"
      fi
      IFS='
'
      for GCUUser in $GCUUsers ; do
         GCUHomeDir=`echo $(eval echo ~"$GCUUser")`
         # If home directory could not be evaluated
         if [ "`printf "%s" "$GCUHomeDir" | grep '^~'`" ] ; then
            continue
         elif [ "$GCUUser" != root ] ; then
            if [ ! -d "$GCUHomeDir/Library" ] ; then
               continue
            elif [ "$GCUHomeDir" = /var/root ] ; then
               continue
            fi
         fi
         ComputerUsers="$ComputerUsers
$GCUUser"
         ComputerUsersHomeDirs="$ComputerUsersHomeDirs
$GCUHomeDir"
         ComputerUsersTable="$ComputerUsersTable
$GCUUser	$GCUHomeDir"
      done
   fi
   IFS="$SavedIFS"
   ComputerUsers=`echo "$ComputerUsers" | grep . | sort -f | uniq`
   ComputerUsersHomeDirs=`echo "$ComputerUsersHomeDirs" | grep / | sort -f | uniq`
   ComputerUsersHomeDirsAndRootDir="/
$ComputerUsersHomeDirs"
   ComputerUsersTable=`echo "$ComputerUsersTable" | grep / | sort -f | uniq`
}

KillNortonZone()
{
   $CreateFilesRemovedListOnly && return
   ZoneProcesses=`ps -axww | grep "Norton Zone.app/Contents/MacOS/Norton Zone" | grep -v grep | awk '{print $1}'`
   for EachZoneAppPID in $ZoneProcesses ; do
      kill -9 "$EachZoneAppPID"
   done
   [ "$ZoneProcesses" ] && killall Finder
}

KillSymantecProcesses()
{
   # Usage:   KillSymantecProcesses [-n] [ProcessPattern [ProductName]]
   #
   #          Kills Symantec processes that match extended regular expression
   #          ProcessPattern. If ProcessPattern is not passed, all processes
   #          that match those in ProcessPatternDefault are used. If ProductName
   #          is passed, that name is shown when kill attempt is made; otherwise
   #          "Symantec" is shown.
   #
   #          If -n is passed as the first argument, no kill is attempted and no
   #          output is shown.
   #
   #          Returns 1 if there remains some matching process in memory, 0 if not.
   # 
   # Version: 1.0.2
   #
   # History: 1.0.1 - 07/24/2014 - Corey Swertfager:
   #                  * Added ProcessPattern and ProductName arguments.
   #                  * Added definitions of ProcessesToSkipPattern and
   #                    ProcessPatternDefault.
   #                  * Added -n option.
   #          1.0.2 - 08/27/2014 - Corey Swertfager:
   #                  * Now uses egrep instead of grep for process matching.
   #                  * Now excludes process that include the name of the
   #                    script that is running this function.
   #                  * Now excludes Symantec Uninstaller.app and SymantecRemovalTool
   #                    when no ProcessPattern is passed.
   #                  * Changed -c to -n in Usage.
   #
   local aUID
   local DoKill=true
   local ExclusionPattern
   local NoKillOption="-n"
   local ProcessesToSkipPattern="/LiveUpdateAdminUtility/|/RemoveSymantecMacFiles\.command|/RemoveSymantecMacFiles\.command|/Symantec Uninstaller.app|/SymantecRemovalTool"
   local ProcessPattern
   local ProcessPatternDefault="/Application Support/Norton|/Application Support/Symantec|/Applications/Norton|/Applications/Symantec|PrivateFrameworks/NPF|PrivateFrameworks/Sym|/StartupItems/.*Norton|/StartupItems/NUMCompatibilityCheck|/StartupItems/SMac Client|/StartupItems/Sym|/StartupItems/TrackDelete|/StartupItems/VolumeAssist"
   local ProductName
   local SavedIFS="$IFS"
   local UIAGENT_USERS
   if [ "z$1" = "z$NoKillOption" ] ; then
      shift
      DoKill=false
   fi
   ProcessPattern="$1"
   ProductName="$2"
   ExclusionPattern=`basename "$0" 2>/dev/null | sed 's/\./\\\./g'`
   # If script name was successfully obtained
   if [ "$ExclusionPattern" ] ; then
      # Add / + current script name to ExclusionPattern
      ExclusionPattern=" egrep -|/$ExclusionPattern$|/$ExclusionPattern "
   else
      ExclusionPattern=" egrep -"
   fi
   if [ -z "$ProcessPattern" ] ; then
      ProcessPattern="$ProcessPatternDefault"
      ProcessesToSkipPattern="$ExclusionPattern|$ProcessesToSkipPattern"
   else
      ProcessesToSkipPattern="$ExclusionPattern"
   fi
   if [ -z "$ProductName" ] ; then
      ProductName="Symantec"
   fi
   Processes=`ps -wwax | egrep -i "$ProcessPattern" | egrep -v "$ProcessesToSkipPattern" | sort -f | uniq`
   if [ $DoKill = true -a -n "$Processes" ] ; then
      IFS='
'
      # If launchctl program exists, unload SymUIAgent
      if which launchctl &>/dev/null ; then
         # Code by Haridharan Nattamaig to unload SymUIAgent
         UIAGENT_USERS=`ps -aef | grep SymUIAgent | grep -v grep | awk '{print $1}' | sort | uniq`
         for aUID in ${UIAGENT_USERS} ; do
            id -u ${aUID} >& /dev/null
            if [ $? -eq 0 ] ; then
               echo "Unloading SymUIAgent for UID $aUID"
               sudo -u \#${aUID} launchctl unload /Library/LaunchAgents/com.symantec.uiagent.application.plist >& /dev/null
            fi
         done
      fi
      echo "Ending $ProductName processes..."
      for TheProcess in $Processes ; do
         echo "$TheProcess"
         kill -9 `echo "z $TheProcess" | awk '{print $2}'`
      done
      IFS="$SavedIFS"
      Processes=`ps -wwax | egrep -i "$ProcessPattern" | egrep -v "$ProcessesToSkipPattern" | sort -f | uniq`
   fi
   if [ "$Processes" ] ; then
      if $DoKill ; then
         echo "*** $ProductName processes still in memory:"
         echo "$Processes"
      fi
      return 1
   else
      if $DoKill ; then
         echo "*** There are no $ProductName processes in memory"
      fi
      return 0
   fi
}

KillTerminal()
{
   ProcessLines=`ps -axww | grep -e "/Applications/Utilities/Terminal.app" | grep -v grep | sort -f`
   if [ -z "$ProcessLines" ] ; then
      return
   elif [ `echo "$ProcessLines" | grep . -c` -gt 1 -a $QuitTerminalForcefullyForAll = false ] ; then
      echo "NOTE: Terminal was launched more than once so it could not be quit."
      echo "      Use the -QQ option to force Terminal to be quit for all users."
      return
   else
      echo "WARNING: Quitting Terminal."
   fi
   IFS='
'
   for ProcessLine in $ProcessLines ; do
      ProcessID=`printf "%s" "$ProcessLine" | awk '{print $1}'`
      kill -9 "$ProcessID"
   done
}

ProcessArguments()
{
   # Usage:     ProcessArguments [ --OptionTakesUnparsedArgument=string ] [ --OptionIsOneArgument=string ] "$@"
   #
   # Version:   1.0.1
   #
   # Summary:   Processes arguments passed to script. Arguments beginning with a
   #            single hyphen (-) are parsed into separate options except when an
   #            argument is negative integer. Arguments beginning with two hypens
   #            are treated as one argument; if the argument contains is an equals
   #            sign (=), the string after the first "=" is treated as a separate
   #            argument (i.e., the value assigned to the double-hyphen argument).
   #
   #            For each --OptionTakesUnparsedArgument passed before "$@", the string
   #            after "=" is used as an option that takes the next argument in full
   #            without parsing it (see examples below); string must be a hyphen
   #            followed by a single character.
   #
   #            For each --OptionIsOneArgument passed before "$@", the string after
   #            "=" is used as an option that should be treated as a single argument.
   #            This is useful when processing an argument that begins with a single
   #            hyphen to avoid having that argument parsed into separate options.
   #            The referenced option cannot be embedded within other options (see
   #            final example below).
   #
   #            "$@" must be the last argument passed to ProcessArguments. Put all custom
   #            option handling between "--- Customized argument handling begins here ---"
   #            and "--- Customized argument handling ends here ---".
   #
   # Note:      ProcessArgumentsNextArgument may be called to verify and obtain the
   #            next argument after or before a given option; see that function's usage
   #            for more details. OriginalArgumentNumber can be used to determine if
   #            two arguments were originally passed within the same string of options.
   #
   # Examples:  These examples have expanded the arguments passed as "$@".
   #
   #            ProcessArguments -ab -c
   #               Would process three arguments: -a, -b, and -c
   #            ProcessArguments --ab -c
   #               Would process two arguments: --ab and -c
   #            ProcessArguments --equation=a=b+c
   #               Would process two arguments: --equation and a=b+c
   #            ProcessArguments -10
   #               Would process one argument: -10
   #            ProcessArguments -10a
   #               Would process three arguments: -1, -0, -a
   #            ProcessArguments --OptionTakesUnparsedArgument=-e -e -ger
   #               Would process two arguments: -e and -ger
   #            ProcessArguments --OptionTakesUnparsedArgument=-e -peer
   #               Would process three arguments: -p, -e, and er
   #            ProcessArguments --OptionTakesUnparsedArgument=-e --OptionTakesUnparsedArgument=-t -eter -ter
   #               Would process four arguments: -e, ter, -t, and er
   #            ProcessArguments --OptionIsOneArgument=-hi -hi
   #               Would process one argument: -hi
   #            ProcessArguments --OptionIsOneArgument=-hi -his
   #               Would process three arguments: -h, -i, and -s
   #
   # History: 1.0.1 - 06/23/2013 - Corey Swertfager:
   #                  * Added processing of options within a string that begins
   #                    with a single hyphen.
   #                  * Added --OptionTakesUnparsedArgument option.
   #                  * Added --OptionIsOneArgument option.
   #
   local ArgList=""
   local ArgsToAdd
   local ArgWasAdded=false
   local CurrentArgNumber=1
   local CurrentArgument
   local CurrentCharacter
   local DoNotParseNextArgument=false
   local NextArgument=""
   local NumberOfArgumentsPassed
   local NumberOfArgumentsToUse=0
   local OptionToAdd
   local OriginalArgumentNumber=0
   local OriginalArgumentNumberList=""
   local RemainingOptionsInString
   local TableOfOptionsWithoutParsing="*** Each option in this table will have its succeeding argument left unparsed. ***"
   local TableOfUndividedArguments="*** Each item in this table should each be treated as single argument. ***"
   while [ "$1" ] ; do
      case "$1" in
         --OptionIsOneArgument)
            ExitScript 99 "WARNING: Bad use of --OptionIsOneArgument passed to ProcessArguments:
         \"$1\""
            ;;
         --OptionIsOneArgument=*)
            OptionToAdd=`printf "%s" "$1" | awk '{match($0,"=") ; print substr($0,RSTART+1)}'`
            [ -z "$OptionToAdd" ] && ExitScript 99 "WARNING: Bad use of --OptionIsOneArgument passed to ProcessArguments:
         \"$1\""
            TableOfUndividedArguments="$TableOfUndividedArguments
$OptionToAdd"
            ;;
         --OptionTakesUnparsedArgument|--OptionTakesUnparsedArgument=*)
            OptionToAdd=`printf "%s" "$1" | awk '{match($0,"=") ; print substr($0,RSTART+1)}'`
            [ -z "`printf "%s" "$OptionToAdd" | grep -xe '-.'`" ] && ExitScript 99 "WARNING: Bad use of --OptionTakesUnparsedArgument passed to ProcessArguments:
         \"$1\""
            TableOfOptionsWithoutParsing="$TableOfOptionsWithoutParsing
$OptionToAdd"
            ;;
         *)
            break
            ;;
      esac
      shift
   done
   NumberOfArgumentsPassed=$#
   while [ $# != 0 ] ; do
      let OriginalArgumentNumber=$OriginalArgumentNumber+1
      # If argument is in the list of arguments whose next argument should not be parsed
      if [ "`printf "%s" "$1" | grep -xF "$TableOfOptionsWithoutParsing"`" ] ; then
         ArgsToAdd="$1"
         OriginalArgumentNumberList="$OriginalArgumentNumberList
$OriginalArgumentNumber"
         DoNotParseNextArgument=true
      # Else if argument is in the list of arguments that should be treated as one argument
      elif [ "`printf "%s" "$1" | grep -xF "$TableOfUndividedArguments"`" ] ; then
         ArgsToAdd="$1"
         OriginalArgumentNumberList="$OriginalArgumentNumberList
$OriginalArgumentNumber"
      else
         case "$1" in
            -|-?)
               # If argument was a hyphen or a hyphen followed by a single character
               ArgsToAdd="$1"
               OriginalArgumentNumberList="$OriginalArgumentNumberList
$OriginalArgumentNumber"
               DoNotParseNextArgument=false
               ;;
            --*)
               # If a value was passed to the option that begins with --
               if [ "`printf "%s" "$1" | grep =`" ] ; then
                  # Add the option and its value as separate arguments
                  ArgsToAdd="`printf "%s" "$1" | awk -F = '{print $1}'`
`printf "%s" "$1" | awk '{match($0,"=") ; print substr($0,RSTART+1)}'`"
                  OriginalArgumentNumberList="$OriginalArgumentNumberList
$OriginalArgumentNumber
$OriginalArgumentNumber"
               else
                  ArgsToAdd="$1"
                  OriginalArgumentNumberList="$OriginalArgumentNumberList
$OriginalArgumentNumber"
               fi
               DoNotParseNextArgument=false
               ;;
            -*)
               # If argument should not be parsed or is a negative integer
               if [ $DoNotParseNextArgument = true -o -z "`printf "%s" "$1" | awk '{print substr($0,2)}' | tr -d '[:digit:]'`" ] ; then
                  # Treat argument as a single argument
                  ArgsToAdd="$1"
                  OriginalArgumentNumberList="$OriginalArgumentNumberList
$OriginalArgumentNumber"
                  DoNotParseNextArgument=false
               else
                  # Parse string into separate arguments
                  ArgsToAdd=""
                  RemainingOptionsInString=`printf "%s" "$1" | awk '{print substr($0,2)}'`
                  while [ "$RemainingOptionsInString" ] ; do
                     CurrentCharacter=`printf "%s" "$RemainingOptionsInString" | awk '{print substr($0,1,1)}'`
                     # Prefix the character with a hyphen and add as an argument
                     if [ "$ArgsToAdd" ] ; then
                        ArgsToAdd="$ArgsToAdd
-$CurrentCharacter"
                     else
                        ArgsToAdd="-$CurrentCharacter"
                     fi
                     OriginalArgumentNumberList="$OriginalArgumentNumberList
$OriginalArgumentNumber"
                     RemainingOptionsInString=`printf "%s" "$RemainingOptionsInString" | awk '{print substr($0,2)}'`
                     # If this is an option whose next string should not be parsed
                     if [ "`printf "%s" "$TableOfOptionsWithoutParsing" | grep -xe "-$CurrentCharacter"`" ] ; then
                        # If string has characters remaining after that option
                        if [ "$RemainingOptionsInString" ] ; then
                           # Add remainder of string as the unparsed string argument
                           ArgsToAdd="$ArgsToAdd
$RemainingOptionsInString"
                           OriginalArgumentNumberList="$OriginalArgumentNumberList
$OriginalArgumentNumber"
                        else
                           # Use next argument passed as unparsed string argument
                           DoNotParseNextArgument=true
                        fi
                        break
                     fi
                  done
               fi
               ;;
            *)
               ArgsToAdd="$1"
               OriginalArgumentNumberList="$OriginalArgumentNumberList
$OriginalArgumentNumber"
               DoNotParseNextArgument=false
               ;;
         esac
      fi
      if $ArgWasAdded ; then
         ArgList="$ArgList
$ArgsToAdd"
      else
         ArgList="$ArgsToAdd"
      fi
      ArgWasAdded=true
      shift
   done
   if [ $NumberOfArgumentsPassed -gt 0 ] ; then
      # Add a non-blank line to ArgList in case last argument passed was ""
      ArgList="$ArgList
           TheEnd"
      OriginalArgumentNumberList=`echo "$OriginalArgumentNumberList" | grep .`
      NumberOfArgumentsToUse=`printf "%s" "$ArgList" | grep "" -c`
      let NumberOfArgumentsToUse=$NumberOfArgumentsToUse-1
   fi
   # --- Customized argument handling begins here ---
   BootVolumeWillBeSearched=false
   CreateFilesRemovedListOnly=false
   DoKillProcesses=true
   DoRemoveFSDFolders=true
   DoRemoveInstallerLaunchAgents=true
   DoRemoveIPUA=true
   DoRemoveLogs=true
   DoRunPredeleteScripts=true
   DoShowOnlyFilesThatShouldHaveBeenUninstalled=false
   FindOption1=""
   FindOption2=""
   ListOnlyFilesThatExist=false
   NoFilesToRemove=true
   PauseBeforeRestarting=true
   QuitTerminalForcefully=false
   QuitTerminalForcefullyForAll=false
   QuitWithoutRestarting=false
   $AutoRunScript && QuitWithoutRestarting=true
   RemoveCrontabEntries=true
   RemoveCrontabEntriesOnly=false
   RemoveInvisibleFiles=true
   RemoveInvisibleFilesOnly=false
   RemoveFromAllVolumes=false
   RemoveFromOtherVolumes=false
   RestartAutomatically=false
   RestartMayBeNeeded=false
   ShowFilesAsRemoved=true
   ShowOnlyRegularFiles=false
   ShowPredeleteErrors=false
   ShowQuitMessage=true
   SomeFileWasRemoved=false
   SomeFileWasRemovedFromNonBootVolume=false
   SomeFileWasRemovedFromBootVolume=false
   UseMore=false
   while [ $CurrentArgNumber -le $NumberOfArgumentsToUse ] ; do
      CurrentArgument=`printf "%s" "$ArgList" | head -n $CurrentArgNumber | tail -n 1`
      OriginalArgumentNumber=`echo "$OriginalArgumentNumberList" | head -n $CurrentArgNumber | tail -n 1`
      case "$CurrentArgument" in
         -A)
            RemoveFromAllVolumes=true
            BootVolumeWillBeSearched=true
            ;;
         -c)
            RemoveCrontabEntriesOnly=true
            RemoveCrontabEntries=true
            RemoveInvisibleFilesOnly=false
            RemoveInvisibleFiles=false
            ;;
         -C)
            RemoveCrontabEntriesOnly=false
            RemoveCrontabEntries=false
            ;;
         -d)
            DoRunPredeleteScripts=false
            ;;
         -e)
            ShowPredeleteErrors=true
            ;;
         -F)
            CreateFilesRemovedListOnly=true
            ListOnlyFilesThatExist=true
            ShowOnlyRegularFiles=true
            FindOption1=-type
            FindOption2=f
            ;;
         -f)
            ShowFilesAsRemoved=false
            ;;
         -g)
            DoRemoveLogs=false
            ;;
         -H)
            ShowUsage 0
            ;;
         -h)
            ShowHelp 0
            ;;
         -i)
            RemoveInvisibleFilesOnly=true
            RemoveInvisibleFiles=true
            RemoveCrontabEntries=false
            RemoveCrontabEntriesOnly=false
            ;;
         -I)
            RemoveInvisibleFilesOnly=false
            RemoveInvisibleFiles=false
            ;;
         -k)
            DoKillProcesses=false
            ;;
         -l|-R)
            CreateFilesRemovedListOnly=true
            ListOnlyFilesThatExist=true
            ;;
         -L)
            CreateFilesRemovedListOnly=true
            ListOnlyFilesThatExist=false
            ;;
         -m)
            UseMore=true
            ;;
         -p)
            PauseBeforeRestarting=false
            ;;
         -q)
            QuitWithoutRestarting=true
            RestartAutomatically=false
            ;;
         -Q)
            # If -Q was previously passed, treat as -QQ
            if $QuitTerminalForcefully ; then
               # Treat as if -QQ was passed
               QuitTerminalForcefullyForAll=true
            else
               QuitTerminalForcefullyForAll=false
            fi
            QuitTerminalForcefully=true
            QuitWithoutRestarting=true
            RestartAutomatically=false
            ;;
         -QQ)
            QuitTerminalForcefully=true
            QuitTerminalForcefullyForAll=true
            QuitWithoutRestarting=true
            RestartAutomatically=false
            ;;
         -r|-re)
            RestartAutomatically=true
            QuitWithoutRestarting=false
            ;;
         -u)
            DoShowOnlyFilesThatShouldHaveBeenUninstalled=true
            ;;
         -V)
            echo $Version
            ExitScript 0
            ;;
         *)
            AssignVolume "$CurrentArgument"   # Assign it to a Volume variable
            # If not a valid volume
            if [ $? = 1 ] ; then
               ShowUsage 4 "ERROR: Invalid option or volume name: \"$CurrentArgument\"."
            fi
            RemoveFromOtherVolumes=true
            ;;
      esac
      let CurrentArgNumber=$CurrentArgNumber+1
   done
   if $DoShowOnlyFilesThatShouldHaveBeenUninstalled ; then
      CreateFilesRemovedListOnly=true
      ListOnlyFilesThatExist=true
   fi
   [ "`echo "$ListOfProgramsThatShouldNotKillProcesses" | grep -x "$FullScriptName"`" ] && DoKillProcesses=false
   [ "`echo "$ListOfProgramsThatShouldNotRemoveFSDFolders" | grep -x "$FullScriptName"`" ] && DoRemoveFSDFolders=false
   [ "`echo "$ListOfProgramsThatShouldNotRemoveInstallerLaunchAgents" | grep -x "$FullScriptName"`" ] && DoRemoveInstallerLaunchAgents=false
   [ "`echo "$ListOfProgramsThatShouldNotRemoveLogs" | grep -x "$FullScriptName"`" ] && DoRemoveLogs=false
   [ "`echo "$ListOfProgramsThatShouldNotRemoveSymantecIPUA" | grep -x "$FullScriptName"`" ] && DoRemoveIPUA=false
   # --- Customized argument handling ends here ---
}

ProcessArgumentsNextArgument()
{
   # Usage:     ProcessArgumentsNextArgument [exit_code] [-F | -P] [-p | -r ] [operator]
   #
   # Version:   1.0.0
   #
   # Arguments: exit_code   Pass integer in range 0-255 to ShowUsage when next
   #                        argument is missing or invalid. If exit_code is not
   #                        specified, 0 is assumed.
   #
   #            -F          Assign the full logical path to NextArgumentFullPath.
   #                        This is the default. ShowFullFilePath function must
   #                        be included in script. If no operator was passed, -E
   #                        is the assumed operator.
   #
   #            -P          Assign the full physical path to NextArgumentFullPath.
   #                        ShowFullFilePath function must be included in script.
   #                        If no operator was passed, -e is the assumed operator.
   #
   #            -p          Get previous argument instead of next argument. If
   #                        there is no previous argument, sets NextArgument to ""
   #                        and returns 1.
   #
   #            -r          Return 1 instead of exiting script if there is no next
   #                        argument. Sets NextArgument to "".
   #
   #            operator    Operator used to test next argument:
   #                           -d   Folder
   #                           -E   File, folder, or link
   #                           -e   File, folder, or link to an existing file/folder
   #                           -f   File
   #                           -i [min [max]]
   #                                Integer in range min-max; pass "" to min and
   #                                an integer to max if there is no minimum but
   #                                a maximum is desired; pass "" to to both min
   #                                and max if passing another option after the -i
   #                                option. Also tests to see if the value of the
   #                                next argument is out of range for the currently
   #                                running version of Mac OS.
   #                           -L   Link; does not check to see if link is broken
   #                                unless -P option was also passed
   #                           -l   Link to an existing file/folder
   #                           -n   Non-null string
   #
   # Summary:   Called by ProcessArguments 1.0.1 or later to assign values to:
   #
   #               CurrentArgNumber
   #               NextArgument
   #               NextArgumentFullPath
   #               NextArgumentOriginalArgumentNumber
   #
   #            using pre-existing values of:
   #
   #               ArgList
   #               CurrentArgNumber
   #               CurrentArgument
   #               OriginalArgumentNumberList
   #               NumberOfArgumentsToUse
   #
   #            Returns 0 if next or previous argument was assigned to NextArgument,
   #            CurrentArgNumber was incremented (or decremented if -p was passed),
   #            and NextArgumentOriginalArgumentNumber was assigned.
   #
   #            Assigns "" to NextArgument and NextArgumentFullPath and returns 1 if
   #            -p is passed and there is no previous argument, or if -r is passed
   #            and there is no next argument; otherwise, calls ShowUsage to show
   #            error message and exit script if operator test fails or if there is
   #            no next or previous argument.
   #
   # Note:      ShowFullFilePath function must be included in script in order to
   #            assign a value to NextArgumentFullPath.
   #
   # Examples:  ProcessArgumentsNextArgument
   #               Returns 0 if there was a next argument; otherwise, passes 0 to
   #               ShowUsage and displays error message about missing argument.
   #            ProcessArgumentsNextArgument -r
   #               Returns 0 if there was a next argument; otherwise, assigns "" to
   #               NextArgument and NextArgumentFullPath, then returns 1.
   #            ProcessArgumentsNextArgument 2 -d
   #               Returns 0 if NextArgument was set to a folder; otherwise, passes
   #               2 to ShowUsage and displays error message if the next argument is
   #               missing or is not a folder.
   #            ProcessArgumentsNextArgument 3 -r -d
   #               Returns 0 if NextArgument was set to a folder. If the next argument
   #               is missing, assigns "" to NextArgument and NextArgumentFullPath,
   #               then returns 1. If next argument is not a folder, passes 3 to
   #               ShowUsage and displays error message.
   #            ProcessArgumentsNextArgument 4 -i 1
   #               Returns 0 if NextArgument was set to an integer; otherwise, passes
   #               4 to ShowUsage and displays error message if the next argument is
   #               missing, is not an integer, or is less than 1.
   #            ProcessArgumentsNextArgument -i "" 100 5
   #               Returns 0 if NextArgument was set to an integer; otherwise, passes
   #               5 to ShowUsage and displays error message if the next argument is
   #               missing, is not an integer, or is greater than 100.
   #            ProcessArgumentsNextArgument -i "" "" 6
   #               Returns 0 if NextArgument was set to an integer; otherwise, passes
   #               6 to ShowUsage and displays error message if the next argument is
   #               missing or is not an integer.
   #
   local DoShowMissingError=true
   local DirectionText=after
   local ExitCode=0
   local ErrorText=""
   local GoToPreviousArgument=false
   local Max
   local Min
   local NextArgumentOriginal
   local PathOption=""
   local TestOperator=""
   NextArgumentFullPath=""
   while [ "$1" ] ; do
      case "$1" in
         -d)
            ErrorText="folder"
            TestOperator="$1"
            ;;
         -E)
            ErrorText="file, folder, or link"
            TestOperator="$1"
            ;;
         -e)
            ErrorText="file or folder"
            TestOperator="$1"
            ;;
         -F)
            PathOption="$1"
            if [ -z "$ErrorText" ] ; then
               ErrorText="file, folder, or link"
               TestOperator="-E"
            fi
            ;;
         -f)
            ErrorText="file"
            TestOperator="$1"
            ;;
         -i)
            ErrorText="integer"
            TestOperator="$1"
            Min="$2"
            Max="$3"
            shift 2
            ;;
         -L)
            ErrorText="link"
            TestOperator="$1"
            [ "z$PathOption" = "z-P" ] && ErrorText="unbroken link"
            ;;
         -l)
            ErrorText="unbroken link"
            TestOperator="-L"
            ;;
         -n)
            ErrorText="non-null string"
            TestOperator="$1"
            ;;
         -P)
            PathOption="$1"
            if [ -z "$ErrorText" ] ; then
               ErrorText="file or folder"
               TestOperator="-e"
            elif [ "$ErrorText" = "link" ] ; then
               ErrorText="unbroken link"
            fi
            ;;
         -p)
            GoToPreviousArgument=true
            DirectionText=before
            ;;
         -r)
            DoShowMissingError=false
            ;;
         *)
            ExitCode=`printf "%s" "$1" | tr -d -c "[:digit:]"`
            [ -z "$ExitCode" ] && ExitCode=0
            ;;
      esac
      shift
   done
   if $GoToPreviousArgument ; then
      if [ $CurrentArgNumber -gt 1 ] ; then
         let CurrentArgNumber=$CurrentArgNumber-1
         NextArgument=`printf "%s" "$ArgList" | head -n $CurrentArgNumber | tail -n 1`
         NextArgumentOriginalArgumentNumber=`echo "$OriginalArgumentNumberList" | head -n $CurrentArgNumber | tail -n 1`
      else
         NextArgument=""
         NextArgumentFullPath=""
         return 1
      fi
   # Else if there are no more arguments in ArgList
   elif [ $CurrentArgNumber = $NumberOfArgumentsToUse ] ; then
      if $DoShowMissingError ; then
         ShowUsage $ExitCode "ERROR: Nothing was passed after $CurrentArgument" >&2
      else
         NextArgument=""
         NextArgumentFullPath=""
         return 1
      fi
   else
      let CurrentArgNumber=$CurrentArgNumber+1
      NextArgument=`printf "%s" "$ArgList" | head -n $CurrentArgNumber | tail -n 1`
      NextArgumentOriginalArgumentNumber=`echo "$OriginalArgumentNumberList" | head -n $CurrentArgNumber | tail -n 1`
   fi
   NextArgumentFullPath=`ShowFullFilePath $PathOption "$NextArgument"`
   if [ "z$ErrorText" = zinteger ] ; then
      NextArgumentOriginal="$NextArgument"
      if [ -z "$NextArgument" ] ; then
         ShowUsage $ExitCode "ERROR: Argument passed $DirectionText $CurrentArgument is not an integer: \"$NextArgumentOriginal\"" >&2
      # Else if argument contains something other than a hyphen or digits
      elif [ "`printf "%s" "$NextArgument" | tr -d "[:digit:]-"`" ] ; then
         ShowUsage $ExitCode "ERROR: Argument passed $DirectionText $CurrentArgument is not an integer:
       \"$NextArgumentOriginal\"" >&2
      # Else if argument contains a hyphen that is not at the beginning
      elif [ "`printf "%s" "$NextArgument" | grep '..*-'`" ] ; then
         ShowUsage $ExitCode "ERROR: Argument passed $DirectionText $CurrentArgument is not an integer:
       \"$NextArgumentOriginal\"" >&2
      fi
      NextArgument=`expr "$NextArgument" / 1 2>/dev/null`
      test "$NextArgumentOriginal" -eq "$NextArgument" 2>/dev/null
      if [ $? != 0 ] ; then
         ShowUsage $ExitCode "ERROR: Value passed $DirectionText $CurrentArgument is out of range for this OS:
       $NextArgumentOriginal" >&2
      fi
      # If minimum value was specified
      if [ "$Min" ] ; then
         [ $NextArgument -lt $Min ] && ShowUsage $ExitCode "ERROR: Value passed $DirectionText $CurrentArgument ($NextArgumentOriginal) is less than
       minimum value ($Min)." >&2
      fi
      # If maximum value was specified
      if [ "$Max" ] ; then
         [ $NextArgument -gt $Max ] && ShowUsage $ExitCode "ERROR: Value passed $DirectionText $CurrentArgument ($NextArgumentOriginal) is greater than
       maximum value ($Max)." >&2
      fi
   elif [ "z$ErrorText" = "zfile, folder, or link" ] ; then
      [ ! -e "$NextArgument" -a ! -L "$NextArgument" ] && ShowUsage $ExitCode "ERROR: Argument passed $DirectionText $CurrentArgument is not a $ErrorText:
       \"$NextArgument\"" >&2
   elif [ "z$ErrorText" = "zunbroken link" ] ; then
      if [ ! -L "$NextArgument" ] ; then
         ShowUsage $ExitCode "ERROR: Argument passed $DirectionText $CurrentArgument is not a link:
       \"$NextArgument\"" >&2
      # Else if link is broken
      elif [ ! -e "$NextArgument" ] ; then
         ShowUsage $ExitCode "ERROR: The target of the link passed $DirectionText $CurrentArgument does not exist:
       \"$NextArgument\"" >&2
      fi
   elif [ "$ErrorText" ] ; then
      [ ! $TestOperator "$NextArgument" ] && ShowUsage $ExitCode "ERROR: Argument passed $DirectionText $CurrentArgument is not a $ErrorText:
       \"$NextArgument\"" >&2
   fi
   if [ "$PathOption" ] ; then
      if [ -z "$NextArgumentFullPath" ] ; then
         if [ -L "$NextArgument" ] ; then
            ShowUsage $ExitCode "ERROR: The target of the link passed $DirectionText $CurrentArgument does not exist:
       \"$NextArgument\"" >&2
         else
            ExitScript $ExitCode "WARNING: ShowFullFilePath function could not resolve path for:
         \"$NextArgument\"" >&2
         fi
      fi
   fi
   return 0
}

RemoveAllNortonFiles()
{
   # Usage:     RemoveAllNortonFiles $1
   # Argument:  $1 = Volume name. The name should begin with "/Volumes/"
   #                 unless it is "/" (boot volume).
   # Summary:   Removes all OS X Norton products' files and folders
   #            from volume named by $1 if RemoveInvisibleFilesOnly
   #            equals false; otherwise, removes only the invisible Norton
   #            files. Removes the invisible Norton files from other
   #            volumes that are passed to the script. Symantec crontab
   #            entries are removed if RemoveCrontabEntries = true.
   #
   # If not a valid volume, return 1
   [ -z "`CheckIfValidVolume "$1"`" ] && return 1
   CurrentVolumeBeingUsed="$1"
   GetComputerUsers "$CurrentVolumeBeingUsed"
   if $CreateFilesRemovedListOnly ; then
      printf "" > "$FilesRemovedFilesOnlyList"
      echo "" >> "$FilesRemovedList"
      if [ `echo "$ListOfVolumesToUse" | grep -c .` -gt 1 ] ; then
         if [ "$1" = / ] ; then
            echo "------ Volume: / (current boot volume) ------" >> "$FilesRemovedList"
         else
            echo "------ Volume: \"`basename "$1"`\" ------" >> "$FilesRemovedList"
         fi
         echo "" >> "$FilesRemovedList"
      fi
   fi
   $RemoveCrontabEntries && DeleteCrontabEntries "$1"
   $RemoveCrontabEntries && DeleteLaunchdPlists "$1"
   $RemoveCrontabEntriesOnly && return 0
   ! $RemoveInvisibleFilesOnly && DeleteSymantecLoginItems "$1"
   if $CreateFilesRemovedListOnly ; then
      if ! $RemoveInvisibleFilesOnly ; then
         RunPredeleteScripts "$1"
         echo "" >> "$FilesRemovedList"
      fi
      if $ListOnlyFilesThatExist ; then
         echo "The following files/folders currently exist and would be removed unless" >> "$FilesRemovedList"
         echo "otherwise noted:" >> "$FilesRemovedList"
      else
         echo "$FullScriptName would attempt to find and remove the following:" >> "$FilesRemovedList"
      fi
      echo "" >> "$FilesRemovedList"
   fi
   RemoveInvisibleFilesFromVolume "$1"
   $RemoveInvisibleFilesOnly && return 0
   # If not just creating a list of removed files
   if ! $CreateFilesRemovedListOnly ; then
      RunPredeleteScripts "$1"
      # If removing files from the boot volume
      if [ "z$CurrentVolumeBeingUsed" = z/ ] ; then
         echo "Removing system profile if it exists: com.symc.enroll"
         profiles -R -p com.symc.enroll &>/dev/null
         # Kill Symantec processes before attempting to remove visible files (Etrack 3442959)
         $DoKillProcesses && KillSymantecProcesses
      fi
   fi
   # If not an OS X volume, return 1
   [ ! -d "$1/Library/Application Support" ] && return 1
   if $CreateFilesRemovedListOnly ; then
      $DoShowOnlyFilesThatShouldHaveBeenUninstalled || echo "Finding visible Symantec files on:   $1" >&2
   elif $ShowFilesAsRemoved ; then
      echo "Locating visible Symantec files in:   $1"
   else
      echo "Removing visible Symantec files from:   $1"
   fi
   cd "$1"
   if [ "`pwd`" = "/" ] ; then
      VolumePrefix=""
   else
      VolumePrefix="`pwd`"
   fi
   KillNortonZone
   RemoveItem "/.com_symantec_symfs_private"
   RemoveItem "/.symSchedScanLockxz"
   RemoveItem "/Applications/Firefox.app/Contents/MacOS/extensions/{0e10f3d7-07f6-4f12-97b9-9b27e07139a5}"
   RemoveItem "/Applications/Firefox.app/Contents/MacOS/extensions/{29dd9c80-9ea1-4aaf-9305-a0314aba24e3}"
   RemoveItem "/Applications/Firefox.app/Contents/MacOS/extensions/nortonsafetyminder@symantec.com"
   RemoveItem "/Applications/GatherSymantecInfo"
   RemoveItem "/Applications/Late Breaking News"
   RemoveItem "/Applications/LiveUpdate"
   RemoveItem "/Applications/LiveUpdate Folder"
   RemoveItem "/Applications/LiveUpdate Folder (OS X)"
#  Remove navx incorrectly installed by NAV 800.007 installer:
   RemoveItem "/Applications/navx"
   RemoveItem "/Applications/Norton " "*"
   RemoveItem "/Applications/Symantec AntiVirus"
   RemoveItem "/Applications/Symantec Cloud Security.app"
   RemoveItem "/Applications/Symantec Endpoint Protection.app"
   RemoveItem "/Applications/Symantec Solutions"
   RemoveItem "/Applications/Symantec Unified Endpoint Protection.app"
#  The next 3 items are erroneously created by early builds of NAV 10 installer
   RemoveItem "/Applications/Symantec/LiveUpdate.app"
   RemoveItem "/Applications/Symantec/Read Me Files"
   RemoveItem "/Applications/Symantec" -e
   RemoveItem "/Applications/Trash Running Daemons"
   RemoveItem "/Applications/uDelete Preferences"
   RemoveItem "/Applications/Register Your Software"
   RemoveItem "/etc/liveupdate.conf"
   RemoveItem "/etc/mach_init.d/SymSharedSettings.plist"
   RemoveItem "/etc/Symantec.conf"
#  Folder erroneously created by NPF 300.001 - removed if empty:
   RemoveItem "/Firewall" -e -u
   RemoveItem "/Library/Application Support/NAVDiagnostic.log"
   RemoveItem "/Library/Application Support/NAV.history"
   RemoveItem "/Library/Application Support/nat_" "*" -u
   RemoveItem "/Library/Application Support/nat_" "*" -u
   RemoveItem "/Library/Application Support/nav_" "*" -u
   RemoveItem "/Library/Application Support/nis_" "*" -u
   RemoveItem "/Library/Application Support/nsm_" "*" -u
   RemoveItem "/Library/Application Support/Norton Application Aliases"
   RemoveItem "/Library/Application Support/Norton Solutions Support"
   RemoveItem "/Library/Application Support/norton_" "*" -u
   RemoveItem "/Library/Application Support/o2spy.log"
   RemoveItem "/Library/Application Support/regid.1992-12.com.symantec" "*"
   RemoveItem "/Library/Application Support/Symantec"
   $DoRemoveIPUA && RemoveItem "/Library/Application Support/Symantec_IPUA"
   RemoveItem "/Library/Application Support/symantec_uninstalldashboard" "*"
   RemoveItem "/Library/Application Support/SymRun"
   RemoveItem "/Library/Authenticators/SymAuthenticator.bundle"
   RemoveItem "/Library/CFMSupport/Norton Shared Lib"
   RemoveItem "/Library/CFMSupport/Norton Shared Lib Carbon"
   RemoveItem "/Library/Contextual Menu Items/NAVCMPlugIn.plugin"
   RemoveItem "/Library/Contextual Menu Items/SAVCMPlugIn.plugin"
   RemoveItem "/Library/Contextual Menu Items/SymFileSecurityCM.plugin"
   RemoveItem "/Library/Documentation/Help/LiveUpdate Help"
   RemoveItem "/Library/Documentation/Help/LiveUpdate-Hilfe"
   RemoveItem "/Library/Documentation/Help/Norton AntiVirus Help"
   RemoveItem "/Library/Documentation/Help/Norton AntiVirus-Hilfe"
   RemoveItem "/Library/Documentation/Help/Norton Help"
   RemoveItem "/Library/Documentation/Help/Norton Help Scripts"
   RemoveItem "/Library/Documentation/Help/Norton Help Scripts Folder"
   RemoveItem "/Library/Documentation/Help/Norton Utilities Help"
   RemoveItem "/Library/Extensions/FileSecurity.kext"
   RemoveItem "/Library/Extensions/ndcengine.kext"
   RemoveItem "/Library/Extensions/NortonForMac.kext"
   RemoveItem "/Library/Extensions/SymAPComm.kext"
   RemoveItem "/Library/Extensions/SymFirewall.kext"
   RemoveItem "/Library/Extensions/SymInternetSecurity.kext"
   RemoveItem "/Library/Extensions/SymIPS.kext"
   RemoveItem "/Library/Extensions/SymPersonalFirewall.kext"
   RemoveItem "/Library/Frameworks/mach_inject_bundle.framework"
   RemoveItem "/Library/InputManagers/Norton Confidential for Safari"
   RemoveItem "/Library/InputManagers/Norton Safety Minder"
   RemoveItem "/Library/InputManagers/SymWebKitUtils"
   RemoveItem "/Library/Internet Plug-Ins/Norton Confidential for Safari.plugin"
   RemoveItem "/Library/Internet Plug-Ins/Norton Family Safety.plugin"
   RemoveItem "/Library/Internet Plug-Ins/Norton Safety Minder.plugin"
   RemoveItem "/Library/Internet Plug-Ins/NortonFamilyBF.plugin"
   RemoveItem "/Library/Internet Plug-Ins/NortonInternetSecurityBF.plugin"
   RemoveItem "/Library/Internet Plug-Ins/NortonSafetyMinderBF.plugin"
   RemoveItem "/Library/LaunchDaemons/com.norton" "*"
   RemoveItem "/Library/LaunchDaemons/com.symantec" "*" -x 'com\.symantec\.saturn\.plist'
   RemoveCrashReporterLogs
   RemoveItem "/Library/Plug-ins/DiskImages/NUMPlugin.bundle"
   RemoveItem "/Library/Plug-ins/DiskImages/VRPlugin.bundle"
   RemoveItem "/Library/Plug-ins/DiskImages" -e -u
   RemoveItem "/Library/Plug-ins" -e -u
   RemoveItem "/Library/PreferencePanes/APPrefPane.prefPane"
   RemoveItem "/Library/PreferencePanes/FileSaver.prefPane"
   RemoveItem "/Library/PreferencePanes/Norton Family Safety.prefPane"
   RemoveItem "/Library/PreferencePanes/Norton Safety Minder.prefPane"
   RemoveItem "/Library/PreferencePanes/Ribbon.Norton.prefPane"
   RemoveItem "/Library/PreferencePanes/SymantecQuickMenu.prefPane"
   RemoveItem "/Library/PreferencePanes/SymAutoProtect.prefPane"
   RemoveItem "/Library/PrivateFrameworks/NPF.framework"
   RemoveItem "/Library/PrivateFrameworks/NPFCoreServices.framework"
   RemoveItem "/Library/PrivateFrameworks/NPFDataSource.framework"
   RemoveItem "/Library/PrivateFrameworks/PlausibleDatabase.framework"
   RemoveItem "/Library/PrivateFrameworks/SymAppKitAdditions.framework"
   RemoveItem "/Library/PrivateFrameworks/SymAVScan.framework"
   RemoveItem "/Library/PrivateFrameworks/SymBase.framework"
   RemoveItem "/Library/PrivateFrameworks/SymConfidential.framework"
   RemoveItem "/Library/PrivateFrameworks/SymDaemon.framework"
   RemoveItem "/Library/PrivateFrameworks/SymFirewall.framework"
   RemoveItem "/Library/PrivateFrameworks/SymInternetSecurity.framework"
   RemoveItem "/Library/PrivateFrameworks/SymIPS.framework"
   RemoveItem "/Library/PrivateFrameworks/SymIR.framework"
   RemoveItem "/Library/PrivateFrameworks/SymLicensing.framework"
   RemoveItem "/Library/PrivateFrameworks/SymNetworking.framework"
   RemoveItem "/Library/PrivateFrameworks/SymOxygen.framework"
   RemoveItem "/Library/PrivateFrameworks/SymPersonalFirewall.framework"
   RemoveItem "/Library/PrivateFrameworks/SymScheduler.framework"
   RemoveItem "/Library/PrivateFrameworks/SymSEP.framework"
   RemoveItem "/Library/PrivateFrameworks/SymSharedSettings.framework"
   RemoveItem "/Library/PrivateFrameworks/SymSubmission.framework"
   RemoveItem "/Library/PrivateFrameworks/SymSystem.framework"
   RemoveItem "/Library/PrivateFrameworks/SymUIAgent.framework"
   RemoveItem "/Library/PrivateFrameworks/SymUIAgentUI.framework"
   if [ ! -e "$VolumePrefix/Library/PrivateFrameworks/SymWebKitUtils.framework/Versions/A/Resources/SymWKULoader.dylib" \
        -o \( $CreateFilesRemovedListOnly = true -a $ListOnlyFilesThatExist = false \) ] ; then
      RemoveItem "/Library/PrivateFrameworks/SymWebKitUtils.framework"
   fi
   RemoveItem "/Library/PrivilegedHelperTools/com.symantec" "*"
   RemoveItem "/Library/PrivilegedHelperTools/NATRemoteLock.app"
   IFS='
'
   for EachReceiptLine in `echo "$ReceiptsTable" | grep . | grep -v '^#'` ; do
      ReceiptName=`echo "$EachReceiptLine" | awk -F "	" '{print $1}'`
      ReceiptArg=`echo "$EachReceiptLine" | awk -F "	" '{print $2}'`
      if [ "z$ReceiptArg" = z-a ] ; then
         RemoveItem "/Library/Receipts/$ReceiptName" "*"
         RemoveItem "/Library/Receipts/$ReceiptName"Dev "*"
      else
         if [ "z$ReceiptName" = zSymWebKitUtils.pkg -o "z$ReceiptName" = zSymWebKitUtilsDev.pkg ] ; then
            # If SymWKULoader exists and CleanUpSymWebKitUtils does not, skip deletion of SymWebKitUtils receipt
            [ -e "$VolumePrefix/Library/PrivateFrameworks/SymWebKitUtils.framework/Versions/A/Resources/SymWKULoader.dylib" -a ! -e /Library/StartupItems/CleanUpSymWebKitUtils ] && continue
         fi
         RemoveItem "/Library/Receipts/$ReceiptName"
         if [ "`echo "$ReceiptName" | grep '\.pkg$'`" ] ; then
            ReceiptName="`basename "$ReceiptName" .pkg`Dev.pkg"
            RemoveItem "/Library/Receipts/$ReceiptName"
         fi
      fi
   done
   RemoveItem "/Library/ScriptingAdditions/SymWebKitUtils.osax"
   RemoveItem "/Library/ScriptingAdditions/SymWebKitUtilsSL.osax"
   RemoveItem "/Library/Services/Norton for Mac.service"
   RemoveItem "/Library/Services/ScanService.service"
   RemoveItem "/Library/Services/Symantec" "*"
   RemoveItem "/Library/Services/SymSafeWeb.service"
   RemoveItem "/Library/Services" -e -u
   RemoveItem "/Library/StartupItems/NortonAutoProtect"
   RemoveItem "/Library/StartupItems/NortonAutoProtect.kextcache"
   RemoveItem "/Library/StartupItems/NortonLastStart"
   RemoveItem "/Library/StartupItems/NortonMissedTasks"
   RemoveItem "/Library/StartupItems/NortonPersonalFirewall"
   RemoveItem "/Library/StartupItems/NortonPrivacyControl"
   RemoveItem "/Library/StartupItems/NUMCompatibilityCheck"
   RemoveItem "/Library/StartupItems/SMC"
   RemoveItem "/Library/StartupItems/SymAutoProtect"
   RemoveItem "/Library/StartupItems/SymAutoProtect.kextcache"
   RemoveItem "/Library/StartupItems/SymDCInit"
   RemoveItem "/Library/StartupItems/SymMissedTasks"
   RemoveItem "/Library/StartupItems/SymProtector"
   RemoveItem "/Library/StartupItems/SymQuickMenuOSFix"
   RemoveItem "/Library/StartupItems/SymWebKitUtilsOSFix"
   RemoveItem "/Library/StartupItems/TrackDelete"
   RemoveItem "/Library/StartupItems/VolumeAssist"
   RemoveItem "/Library/Symantec/tmp"
   RemoveItem "/Library/Symantec" -E -u
   RemoveItem "/Library/Widgets/NAV.wdgt"
   RemoveItem "/Library/Widgets/Symantec Alerts.wdgt"
   RemoveItem "/Library/Widgets" -E -u
   RemoveItem "/Norton AntiVirus Installer Log"
#  Folder with files erroneously created by an early Corsair installer:
   RemoveItem "/opt/Symantec"
#  Folder erroneously created by that Corsair installer - removed if empty:
   RemoveItem "/opt" -E -u
#  Folder erroneously created by NPF 300.001 - removed if empty:
   RemoveItem "/Personal" -e -u
#  Folder erroneously created by NPF 300.001 - removed if empty:
   RemoveItem "/Solutions" -e -u
#  Folder erroneously created by NPF 300.001 - removed if empty:
   RemoveItem "/Support/Norton" -e -u
#  Folder erroneously created by NPF 300.001 - removed if empty:
   RemoveItem "/Support" -e -u
   RemoveItem "/symaperr.log"
   RemoveItem "/symapout.log"
#  Four frameworks erroneously installed by early builds of NAV 9.0.1:
   RemoveItem "/SymAppKitAdditions.framework"
   RemoveItem "/SymBase.framework"
   RemoveItem "/SymNetworking.framework"
   RemoveItem "/SymSystem.framework"
   RemoveItem "/System/Library/Authenticators/SymAuthenticator.bundle"
   RemoveItem "/System/Library/CFMSupport/Norton Shared Lib Carbon"
   RemoveItem "/System/Library/CoreServices/NSWemergency"
   RemoveItem "/System/Library/CoreServices/NUMemergency"
   RemoveItem "/System/Library/Extensions/DeleteTrap.kext"
   RemoveItem "/System/Library/Extensions/KTUM.kext"
   RemoveItem "/System/Library/Extensions/ndcengine.kext"
   RemoveItem "/System/Library/Extensions/NortonForMac.kext"
   RemoveItem "/System/Library/Extensions/NPFKPI.kext"
   RemoveItem "/System/Library/Extensions/SymDC.kext"
   RemoveItem "/System/Library/Extensions/SymEvent.kext"
   RemoveItem "/System/Library/Extensions/symfs.kext"
   RemoveItem "/System/Library/Extensions/SymInternetSecurity.kext"
   RemoveItem "/System/Library/Extensions/SymIPS.kext"
   RemoveItem "/System/Library/Extensions/SymOSXKernelUtilities.kext"
   RemoveItem "/System/Library/Extensions/SymPersonalFirewall.kext"
   RemoveItem "/System/Library/StartupItems/NortonAutoProtect"
   RemoveItem "/System/Library/StartupItems/SymMissedTasks"
   RemoveItem "/System/Library/Symantec"
   RemoveItem "/System/Library/SymInternetSecurity.kext"
   RemoveItem "/SystemWorks Installer Log"
   RemoveItem "/tmp/com.symantec.liveupdate.reboot"
   RemoveItem "/tmp/com.symantec.liveupdate.restart"
   RemoveItem "/tmp/jlulogtemp"
   RemoveItem "/tmp/LiveUpdate." "*"
   RemoveItem "/tmp/liveupdate"
   RemoveItem "/tmp/lulogtemp"
   RemoveItem "/tmp/O2Spy.log"
   RemoveItem "/tmp/SymSharedFrameworks" "*"
   RemoveItem "/tmp/symask"
   RemoveItem "/Users/dev/bin/smellydecode"
   RemoveItem "/Users/dev/bin" -E -u
   RemoveItem "/Users/dev" -E -u
   RemoveItem "/Users/Shared/NAV Corporate"
   RemoveItem "/Users/Shared/NIS Corporate"
   RemoveItem "/Users/Shared/RemoveSymantecMacFilesRemovesThese.txt"
   RemoveItem "/Users/Shared/RemoveSymantecMacFilesLog.txt"
   RemoveItem "/Users/Shared/RemoveSymantecMacFilesRemovesThese.txt"
   RemoveItem "/Users/Shared/RemoveSymantecMacFilesLog.txt"
   RemoveItem "/Users/Shared/SymantecRemovalToolRemovesThese.txt"
   RemoveItem "/Users/Shared/SymantecRemovalToolLog.txt"
   RemoveItem "/usr/bin/nortonscanner"
   RemoveItem "/usr/bin/nortonsettings"
   RemoveItem "/usr/bin/MigrateQTF"
   RemoveItem "/usr/bin/navx"
   RemoveItem "/usr/bin/npfx"
   RemoveItem "/usr/bin/savx"
   RemoveItem "/usr/bin/scfx"
   RemoveItem "/usr/bin/symsched"
   RemoveItem "/usr/lib/libsymsea." "dylib"
   RemoveItem "/usr/lib/libwpsapi.dylib"
   RemoveItem "/usr/local/bin/CoreLocationProviderTest"
   RemoveItem "/usr/local/bin/KeyGenerator"
   RemoveItem "/usr/local/bin/LocationProviderInterfaceTest"
   RemoveItem "/usr/local/bin/LocationProviderTest"
   RemoveItem "/usr/local/bin/MigrateQTF"
   RemoveItem "/usr/local/bin/navx"
   RemoveItem "/usr/local/bin/nortonscanner"
   RemoveItem "/usr/local/bin/nortonsettings"
   RemoveItem "/usr/local/bin/SkyhookProviderTest"
   RemoveItem "/usr/local/bin" -E -u
   RemoveItem "/usr/local/lib/libAPFeature.a"
   RemoveItem "/usr/local/lib/libcx_lib.so"
   RemoveItem "/usr/local/lib/libecomlodr.dylib"
   RemoveItem "/usr/local/lib/libgecko3parsers.dylib"
   RemoveItem "/usr/local/lib/liblux.so." "*"
   RemoveItem "/usr/local/lib/libnlucallback.dylib"
   RemoveItem "/usr/local/lib/libsymsea." "dylib"
   RemoveItem "/usr/local/lib" -E -u
   RemoveItem "/usr/share/man/man1/NAVScanIDs.h"
   RemoveItem "/var/db/NATSqlDatabase.db"
   RemoveItem '/var/db/receipts/$(SYM_SKU_REVDOMAIN).install.bom'
   RemoveItem '/var/db/receipts/$(SYM_SKU_REVDOMAIN).install.plist'
   RemoveItem "/var/db/receipts/com.symantec" "*"
   RemoveItem "/var/db/receipts/com.symantec" "*"
   RemoveItem "/var/db/receipts/com.Symantec" "*"
   RemoveItem "/var/log/du.log" "*"
   RemoveItem "/var/log/dulux.log" "*"
   RemoveItem "/var/log/lut.log" "*"
   RemoveItem "/var/log/lux.log" "*"
   RemoveItem "/var/log/luxtool.log" "*"
   RemoveItem "/var/log/mexd.log" "*"
   RemoveItem "/var/log/microdef.log" "*"
   RemoveItem "/var/log/nortondns.log"
   RemoveItem "/var/log/Npfkernel.log.fifo"
   RemoveItem "/var/root/Applications/Norton Internet Security.app"
   RemoveItem "/var/root/Applications" -E
   RemoveItem "/var/root/Library/Bundles/NAVIR.bundle"
   RemoveItem "/var/root/Library/Bundles" -E -u
   RemoveItem "/var/root/Library/Contextual Menu Items/NAVCMPlugIn.plugin"
   RemoveItem "/var/root/Library/Contextual Menu Items" -E -u
   RemoveItem "/var/tmp/com.symantec" "*"
   RemoveItem "/var/tmp/com.Symantec" "*"
   RemoveItem "/var/tmp/symantec_error_report" "*"
   # Delete logs listed in logging conf files within /etc/symantec
   IFS='
'
   for LUXLogFile in `cat "/Library/Application Support/Symantec/Silo/NFM/LiveUpdate/Conf/lux.logging.conf" /etc/symantec/dulux.logging.conf /etc/symantec/lux.logging.conf /etc/symantec/microdef.logging.conf 2>/dev/null | tr '\015' '\012' | grep logger.sink.file.filePath= | awk -F = '{print $2}' | sort -f | uniq` ; do
      RemoveItem "$LUXLogFile" "*"
   done
   if [ -f /etc/symantec/defutils.conf ] ; then
      DefUtilsLogContents=`cat /etc/symantec/defutils.conf 2>/dev/null | tr '\015' '\012'`
      DefUtilsLogDir=`printf "%s" "$DefUtilsLogContents" | grep defutillog_dir= | awk -F = '{print $2}'`
      if [ "$DefUtilsLogDir" ] ; then
         DefUtilsLogBaseName=`printf "%s" "$DefUtilsLogContents" | grep defutillog_name= | awk -F = '{print $2}'`
         [ "$DefUtilsLogBaseName" ] && RemoveItem "$DefUtilsLogDir/$DefUtilsLogBaseName".log "*"
      fi
   fi
   RemoveItem "/etc/symantec" -d -x "saturn"
   RemoveItem "/etc/symantec" -E -u
   if [ -f "$VolumePrefix/etc/syslog.conf" -a $CreateFilesRemovedListOnly = false ] ; then
      # Remove Norton Personal Firewall entries from /etc/syslog.conf
      sed -e "/Norton Personal Firewall/d" -e "/Npfkernel.log.fifo/d" "$VolumePrefix/etc/syslog.conf" > /tmp/NPF.syslog.conf
      if [ -s /tmp/NPF.syslog.conf ] ; then
         /bin/cp -f /tmp/NPF.syslog.conf "$VolumePrefix/etc/syslog.conf"
      fi
      /bin/rm -f /tmp/NPF.syslog.conf
   fi
   RemoveFilesFromLibraryAndUserDirectories "$1"
   RemoveItem /Library/Preferences/Network -E -u
   if [ -s "$FilesRemovedFilesOnlyList" ] ; then
      sort -f "$FilesRemovedFilesOnlyList" | uniq | grep . >> "$FilesRemovedList"
   fi
   RemoveLoginKeychainPasswords "$CurrentVolumeBeingUsed"
   # If removing files from the boot volume
   if [ $CreateFilesRemovedListOnly = false -a "z$CurrentVolumeBeingUsed" = z/ ] ; then
      # Kill Symantec processes and attempt to remove Symantec folder again in case Symantec
      # folder was re-created with incorrect permissions (Etrack 3442959) while other files
      # were removed
      $DoKillProcesses && KillSymantecProcesses &>/dev/null
      RemoveItem "/Library/Application Support/Symantec"
   fi
}
   
RemoveCrashReporterLogs()
{
   # Usage:     RemoveCrashReporterLogs
   # Summary:   Removes CrashReporter logs. GetComputerUsers function must be run
   #            and VolumePrefix must be defined before running this function.
   #
   # CrashLogGrepPattern will match visible or invisible (name begins with a period) Symantec files
   local CrashLogGrepPattern='/\.?com\.norton|/\.?com\.symantec|/\.?LiveUpdate|\.?/LUTool|/\.?NFM|/\.?Norton|/\.?Sym'
   local LogsToDelete=""
   local LogToDelete
   local UserDir
   IFS='
'
   for UserDir in $ComputerUsersHomeDirsAndRootDir ; do
      [ "$UserDir" = / ] && UserDir=""
      LogsToDelete="$LogsToDelete
`find "$VolumePrefix$UserDir/Library/Application Support/CrashReporter" "$VolumePrefix$UserDir/Library/Application Support/DiagnosticReports" "$VolumePrefix$UserDir/Library/Logs/CrashReporter" "$VolumePrefix$UserDir/Library/Logs/DiagnosticReports" -type f 2>/dev/null | egrep -i "$CrashLogGrepPattern"`"
   done
   LogsToDelete=`echo "$LogsToDelete" | grep / | sort -f`
   if [ "$VolumePrefix" ] ; then
      # Remove VolumePrefix from beginning of paths
      LogsToDelete=`echo "$LogsToDelete" | awk -v VOLUME="$VolumePrefix" '{print substr($0,length(VOLUME)+1)}'`
   fi
   if [ "$LogsToDelete" ] ; then
      for LogToDelete in $LogsToDelete ; do
         RemoveItem "$LogToDelete" -u
      done
   fi
}

RemoveEmptyDirectory()
{
   # Usage:     RemoveEmptyDirectory $1
   # Argument:  $1 = Full path name of directory
   # Summary:   Removes directory $1 if it is empty or if it contains
   #            only .DS_Store and/or .localized (the next best thing
   #            to being empty).
   #
   # If $1 is a directory and not a link
   if [ -d "$1" -a ! -L "$1" ] ; then
      # If folder contains only .DS_Store and/or .localized, or is empty
      if [ -z "`ls "$1" 2>/dev/null | grep -v "^\.DS_Store\|^\.localized"`" ] ; then
         $ShowFilesAsRemoved && echo "   Removing: \"$1\""
         # Clear immutable bit to remove any Finder lock
         chflags -R nouchg "$1" 2>/dev/null 1>&2
         /bin/rm -rf "$1" 2>/dev/null 1>&2   # Remove folder
      fi
   fi
}

RemoveFilesFromLibraryAndUserDirectories()
{
   # Usage:     RemoveFilesFromLibraryAndUserDirectories $1
   # Argument:  $1 = Name of volume from which to remove preferences.
   #                 The name must begin with "/Volumes/"
   #                 unless it is "/" (boot volume).
   # Summary:   Removes all Symantec files & folders from each user's
   #            preferences, /Library/Caches, and /Library/Preferences.
   #            Removes help files from /Library/Documentation. Removes
   #            folders incorrectly created by NAV 7.0.2 from each
   #            user's home directory.
   #
   local FSDDir
   local UserHomeDir
   local UserLibraryDir
   CurrentVolumeBeingUsed="$1"
   if [ "$1" = "/" ] ; then
      VolumeToCheck=""
   else
      VolumeToCheck="$1"
   fi
   # set IFS to only newline to get all user names
   IFS='
'
   for UserHomeDir in $ComputerUsersHomeDirsAndRootDir ; do
      if [ "$UserHomeDir" = "/" ] ; then
         UserHomeDir=""
      fi
      UserLibraryDir="$UserHomeDir/Library"
      # If UserLibraryDir is not a directory, skip to the next name
      [ ! -d "$VolumeToCheck$UserLibraryDir" ] && continue
      cd "$VolumeToCheck/"
      # If a user's home directory, delete folders from user's home directory
      # that were incorrectly created by NAV 7.0.2
      if [ "$UserHomeDir" ] ; then
         RemoveItem "$UserHomeDir/Applications/LiveUpdate Folder (OS X)"
         RemoveItem "$UserHomeDir/Applications/Norton AntiVirus (OS X)"
         RemoveItem "$UserHomeDir/Applications" -e -u
      fi
      FirefoxExtensions=`find "$UserLibraryDir/Application Support/Firefox/Profiles/"*/extensions/*"@symantec.com.xpi" 2>/dev/null`
      for FirefoxExtension in $FirefoxExtensions ; do
         RemoveItem "$FirefoxExtension"
      done
      RemoveItem "$UserLibraryDir/Application Support/Norton" "*"
      # If a user directory
      if [ "$UserHomeDir" ] ; then
         RemoveItem "$UserLibraryDir/Application Support/Symantec"
         RemoveItem "$UserHomeDir/Application Support/Symantec"
         RemoveItem "$UserHomeDir/Application Support" -e
         # If .fsd folders should be removed
         if $DoRemoveFSDFolders ; then
            # For each .fsd folder in user's Downloads folder
            for FSDDir in `find "$UserHomeDir/Downloads" -type d -name ".fsd" 2>/dev/null` ; do
               RemoveItem "$FSDDir"
            done
         fi
      else
         # Make second attempt to remove "/Application Support/Symantec/ErrorReporting"
         RemoveItem "$UserLibraryDir/Application Support/Symantec/ErrorReporting"
         RemoveItem "$UserLibraryDir/Application Support/Symantec"
      fi
      RemoveItem "$UserLibraryDir/Documentation/Help/Norton Privacy Control Help"
      RemoveItem "$UserLibraryDir/Documentation/Help/Norton Personal Firewall Help"
      RemoveItem "$UserLibraryDir/Caches/com.apple.Safari/Extensions/Norton" "*" -u
      RemoveItem "$UserLibraryDir/Caches/com.apple.Safari/Extensions/Symantec" "*" -u
      RemoveItem "$UserLibraryDir/Caches/com.norton" "*" -u
      RemoveItem "$UserLibraryDir/Caches/com.symantec" "*" -u
      RemoveItem "$UserLibraryDir/Caches/Norton" "*" -u
      RemoveItem "$UserLibraryDir/Caches/Symantec" "*" -u
      if $DoRemoveIPUA ; then
         # If not a user directory
         if [ -z "$UserHomeDir" ] ; then
            RemoveItem "$UserLibraryDir/LaunchAgents/com.symantec" "*"
         elif $DoRemoveInstallerLaunchAgents ; then
            RemoveItem "$UserLibraryDir/LaunchAgents/com.symantec" "*"
         else
            RemoveItem "$UserLibraryDir/LaunchAgents/com.symantec" "*" -x 'com\.symantec\..*Installer\.plist'
         fi
      else
         # If not a user directory
         if [ -z "$UserHomeDir" ] ; then
            RemoveItem "$UserLibraryDir/LaunchAgents/com.symantec" "*" -x 'com\.symantec\.ipua\.plist'
         elif $DoRemoveInstallerLaunchAgents ; then
            RemoveItem "$UserLibraryDir/LaunchAgents/com.symantec" "*" -x 'com\.symantec\.ipua\.plist'
         else
            RemoveItem "$UserLibraryDir/LaunchAgents/com.symantec" "*" -x 'com\.symantec\..*Installer\.plist' -x 'com\.symantec\.ipua\.plist'
         fi
      fi
      RemoveItem "$UserLibraryDir/Logs/LUTool.txt"
      RemoveItem "$UserLibraryDir/Logs/Norton" "*"
      RemoveItem "$UserLibraryDir/Logs/o2spy.log"
      RemoveItem "$UserLibraryDir/Logs/Symantec" "*"
#       RemoveItem "$UserLibraryDir/Logs/Symantec" "*" -u   # May need to add this back with refined matching
      RemoveItem "$UserLibraryDir/Logs/SymAPErr.log"
      RemoveItem "$UserLibraryDir/Logs/SymAPOut.log"
      RemoveItem "$UserLibraryDir/Logs/SymBfw_NFM.log"
      RemoveItem "$UserLibraryDir/Logs/SymDebugLeaks.log"
      RemoveItem "$UserLibraryDir/Logs/SymDeepsight" "*"
      RemoveItem "$UserLibraryDir/Logs/SymFWDeepSightTrie.txt"
      RemoveItem "$UserLibraryDir/Logs/SymFWLog.log"
      RemoveItem "$UserLibraryDir/Logs/SymFWRules.log" "*"
      RemoveItem "$UserLibraryDir/Logs/SymHTTPSubmissions.txt"
      RemoveItem "$UserLibraryDir/Logs/SymInstall" "*"
      RemoveItem "$UserLibraryDir/Logs/SymOxygen" "*"
      RemoveItem "$UserLibraryDir/Logs/SymScanServerDaemon.log"
      RemoveItem "$UserLibraryDir/Logs/SymSharedSettingsd.log"
      RemoveItem "$UserLibraryDir/Logs/SymUninstall" "*"
      RemoveItem "$UserLibraryDir/Preferences/ByHost/com.symantec" "*"
      RemoveItem "$UserLibraryDir/Preferences/com.norton" "*"
      if $DoRemoveIPUA ; then
         RemoveItem "$UserLibraryDir/Preferences/com.symantec" "*" -x 'com\.symantec\.sacm.*' -x 'com\.symantec\.smac.*'
      else
         RemoveItem "$UserLibraryDir/Preferences/com.symantec" "*" -x 'com\.symantec\.sacm.*' -x 'com\.symantec\.smac.*' -x 'com\.symantec\.ipua\.plist'
      fi
      RemoveItem "$UserLibraryDir/Preferences/LiveUpdate Preferences"
      RemoveItem "$UserLibraryDir/Preferences/LU Admin Preferences"
      RemoveItem "$UserLibraryDir/Preferences/LU Host Admin.plist"
      RemoveItem "$UserLibraryDir/Preferences/NAV8.0.003.plist"
      RemoveItem "$UserLibraryDir/Preferences/Network/com.symantec" "*"
      RemoveItem "$UserLibraryDir/Preferences/Norton AntiVirus Prefs Folder"
      RemoveItem "$UserLibraryDir/Preferences/Norton Application Aliases"
      RemoveItem "$UserLibraryDir/Preferences/Norton Personal Firewall Log"
      RemoveItem "$UserLibraryDir/Preferences/Norton Scheduler OS X.plist"
      RemoveItem "$UserLibraryDir/Preferences/Norton Utilities Preferences"
      RemoveItem "$UserLibraryDir/Preferences/Norton Zone"
      RemoveItem "$UserLibraryDir/Preferences/wcid"
      RemoveItem "$UserLibraryDir/Safari/Extensions/Norton" "*"
      RemoveItem "$UserLibraryDir/Safari/Extensions/Symantec" "*"
      RemoveItem "$UserLibraryDir/Saved Application State/com.symantec" "*" -u
   done
}

RemoveInvisibleFilesFromVolume()
{
   # Usage:     RemoveInvisibleFilesFromVolume $1
   # Argument:  $1 = Volume name. The name should begin with "/Volumes/"
   #                 unless it is "/" (boot volume).
   # Summary:   Removes the invisible Symantec for OS X files - Norton FS
   #            and AntiVirus QuickScan files - from $1.
   #
   ! $RemoveInvisibleFiles && return
   CurrentVolumeBeingUsed="$1"
   cd "$1"
   if $CreateFilesRemovedListOnly ; then
      $DoShowOnlyFilesThatShouldHaveBeenUninstalled || echo "Finding invisible Symantec files on: $1" >&2
   elif $ShowFilesAsRemoved ; then
      echo "Locating invisible Symantec files in: $1"
   else
      echo "Removing invisible Symantec files from: $1"
   fi
   RemoveItem "/.SymAVQSFile"
   RemoveItem "/NAVMac800QSFile"
   RemoveItem "/Norton FS Data"
   RemoveItem "/Norton FS Index"
   RemoveItem "/Norton FS Volume"
   RemoveItem "/Norton FS Volume 2"
}

RemoveItem()
{
   # Usage:     RemoveItem ["private_was_added"] FilePath [-d] [-e | -E] [-u] [-x <pattern>] [FileExtension]
   #
   # Summary:   Deletes the file or folder passed, FilePath, from the
   #            current directory. FilePath should be full path beginning
   #            with /.
   #
   # Options:
   #    -d      Treat FilePath as a directory in which to match FileExtension
   #            or when using the -x option. See FileExtension and -x option
   #            below. The -d must be passed prior to passing the -x option.
   #            FilePath itself will not be deleted, only the matching items
   #            within it will be deleted. If no FileExtension is passed, "*"
   #            is assumed.
   #    -e      Delete FilePath only if it is a directory that is empty or
   #            that contains only ".DS_Store" and/or ".localized" files.
   #            If the folder could not be deleted, error message is shown.
   #    -E      Same as the -e option, except no error message is shown if
   #            the folder could not be deleted.
   #    -u      Item is not removed by Symantec Uninstaller.app.
   #    -x <Pattern>
   #            Pattern to exclude from file list. Pattern will become
   #            ^FilePathPattern$ (or ^FilePath/Pattern$ if -d was passed
   #            before -x was passed) so add wildcards as needed. Make sure
   #            to prefix special characters you wish to match with \
   #            (example: to match a period, \.). You may pass several
   #            -x <pattern> groupings. Pattern is an extended regular
   #            expression. Letter case is ignored.
   #    <FileExtension>
   #            All files are deleted that match FilePath.*FileExtension or
   #            if -d was passed that match FilePath/.*FileExtension.
   #            To match any files that begin with FilePath, pass "*" as
   #            FileExtension (don't pass * unquoted). Only the last
   #            FileExtension passed will be used. Periods will be escaped
   #            (i.e., each . will become \.).
   #    "private_was_added"
   #            This gets passed as the first argument by RemoveItem() when
   #            FilePath is a link in PrivateLinksPattern. This option is
   #            only to be passed by RemoveItem() itself.
   #
   # Note:      Make sure to run the SetupCleanup function before the
   #            first run of this function and run the FinishCleanup
   #            function before exiting the script.
   #
   #            Make sure to change directory to root of the volume you
   #            want the file or folder removed from before calling this
   #            function.
   #
   #            FilePath must be the first argument unless "private_was_added"
   #            was passed as the first. The other options may appear after
   #            FilePath in any order.
   #
   local ExclusionPattern=""
   local FilePath="$1"
   shift
   # If / or no file name passed
   if [ "z$FilePath" = z/ -o -z "$FilePath" ] ; then
      return 
   # Else if this is a call by RemoveItem() with /private added to original path
   elif [ "z$FilePath" = zprivate_was_added ] ; then
      FilePath="$1"
      shift
   # Else if original path begins with /private/ and is targeted by a link in /
   elif [ "`echo "$FilePath" | egrep -e "$PrivateDirectoriesPattern"`" ] ; then
      # Remove /private from beginning of path
      FilePath=`echo "$FilePath" | awk '{print substr($0,9)}'`
   fi
   VolumeFromWhichToRemove="`pwd`"
   # If path passed begins with /etc/, /tmp/, or /var/
   if [ "`echo "$FilePath" | egrep -e "$PrivateLinksPattern"`" ] ; then
      PrivateLinkName=`echo "$FilePath" | awk -F / '{print $2}'`
      PrivateLinkRoot="$VolumeFromWhichToRemove/$PrivateLinkName"
      PrivateDirRoot="$VolumeFromWhichToRemove/private/$PrivateLinkName"
      # If path does not point to the same file as "/private/" + path
      if [ ! "$PrivateLinkRoot" -ef "$PrivateDirRoot" ] ; then
         FilePathOriginal="$FilePath"
         # Attempt to remove path from within /private first
         RemoveItem "private_was_added" "/private$FilePath" "$@"
         # Then attempt to remove path itself
         FilePath="$FilePathOriginal"
      fi
   fi
   if [ "$VolumeFromWhichToRemove" = "/" ] ; then
      FullFilePath="$FilePath"
   else
      FullFilePath="$VolumeFromWhichToRemove$FilePath"
   fi
   # If logs should not be removed
   if ! $DoRemoveLogs ; then
      # If file path contains "/Library/Logs/", skip removal
      if [ "`echo "$FullFilePath" | egrep '/Library/Logs/'`" ] ; then
         return
      fi
   fi
   PathDir=`dirname "$FullFilePath"`
   [ -z "$PathDir" ] && return
   # Set PathBasePattern = basename of path with each . translated to \.
   PathBasePattern=`basename "$FullFilePath" | sed s/"\."/"\\\\\."/g`
   [ -z "$PathBasePattern" ] && return
   DeleteOnlyIfEmptyDir=false
   ExtensionPassed=""
   PathIsDirectory=false
   SkipErrorMessageIfEmptyDirNotFound=false
   ShouldNotBeRemovedBySymantecUninstaller=false
   while [ "$1" ] ; do
      case "$1" in
         -d)
            PathDir="$FullFilePath"
            PathBasePattern=""
            PathIsDirectory=true
            ;;
         -e)
            DeleteOnlyIfEmptyDir=true
            SkipErrorMessageIfEmptyDirNotFound=false
            ;;
         -E)
            DeleteOnlyIfEmptyDir=true
            SkipErrorMessageIfEmptyDirNotFound=true
            ;;
         -u)
            ShouldNotBeRemovedBySymantecUninstaller=true
            ;;
         -x)
            if [ "$2" ] ; then
               shift
               if [ "$ExclusionPattern" ] ; then
                  ExclusionPattern="$ExclusionPattern|^$PathDir/$1$"
               else
                  ExclusionPattern="^$PathDir/$1$"
               fi
            fi
            ;;
         *)
            ExtensionPassed="$1"
            ;;
      esac
      shift
   done
   if [ "z$ExtensionPassed" = "z*" ] ; then
      ListOfPaths=`find "$PathDir" -depth 1 2>/dev/null | grep -i "^$PathDir/$PathBasePattern" | sort -f`
      PathToShow="$FullFilePath`$PathIsDirectory && echo /`*"
   elif [ "$ExtensionPassed" ] ; then
      ExtensionPassedPattern=`printf "%s" "$ExtensionPassed" | sed s/"\."/"\\\\\."/g`
      ListOfPaths=`find "$PathDir" -depth 1 2>/dev/null | grep -i "^$PathDir/$PathBasePattern.*$ExtensionPassedPattern$" | sort -f`
      PathToShow="$FullFilePath*$ExtensionPassed"
   elif $PathIsDirectory ; then
      ListOfPaths=`find "$FullFilePath" -depth 1 2>/dev/null | sort -f`
      PathToShow="$FullFilePath/*"
   else
      ListOfPaths=`ls -d "$FullFilePath" 2>/dev/null`
      PathToShow="$FullFilePath"
   fi
   # If there are items to exclude from the list and there are matching items
   if [ "z$ExclusionPattern" != z -a -n "$ListOfPaths" ] ; then
      ListOfPaths=`printf "%s" "$ListOfPaths" | egrep -i -v -e "$ExclusionPattern"`
   fi
   if $CreateFilesRemovedListOnly ; then
      # If -E passed, then don't list the item
      $SkipErrorMessageIfEmptyDirNotFound && return
      if ! $ListOnlyFilesThatExist ; then
         echo "$PathToShow`$DeleteOnlyIfEmptyDir && echo " [folder deleted only if empty]"`" >> "$FilesRemovedList"
      # Else if file exists
      elif [ "$ListOfPaths" ] ; then
         ItemsToAddToList=""
         IFS='
'
         if $DeleteOnlyIfEmptyDir ; then
            $ShowOnlyRegularFiles || ItemsToAddToList="$ListOfPaths"
         else
            for EachItemListed in $ListOfPaths ; do
               if [ -f "$EachItemListed" ] ; then
                  ItemsToAddToList="$ItemsToAddToList
$EachItemListed"
               elif [ -L "$EachItemListed" -a $ShowOnlyRegularFiles = false ] ; then
                  ItemsToAddToList="$ItemsToAddToList
$EachItemListed"
               else
                  ItemsToAddToList="$ItemsToAddToList
`find "$EachItemListed" $FindOption1 $FindOption2 2>/dev/null`"
               fi
            done
         fi
         for EachItemFound in $ItemsToAddToList ; do
            if $ShouldNotBeRemovedBySymantecUninstaller ; then
               AddedText="$NotRemovedBySymantecUninstallerText"
            elif [ "`echo "$EachItemFound" | grep -F "$NotRemovedByNIS6Uninstaller"`" ] ; then
               AddedText="$NotRemovedByNIS6UninstallerText"
            elif [ "`echo "$EachItemFound" | grep -F "$NotRemovedBySymantecUninstaller"`" ] ; then
               AddedText="$NotRemovedBySymantecUninstallerText"
            else
               AddedText=""
            fi
            if $ShowOnlyRegularFiles ; then
               # If would be an empty folder or would not be removed by Symantec Uninstaller, don't add item to the list
               [ $DeleteOnlyIfEmptyDir = true -o -n "$AddedText" ] && continue
            fi
            echo "$EachItemFound`$DeleteOnlyIfEmptyDir && echo " [folder deleted only if empty]"`$AddedText" >> "$FilesRemovedFilesOnlyList"
         done
         NoFilesToRemove=false
         FilesFoundOnThisVolume=true
      fi
      return
   fi
   IFS='
'
   for EachFullPath in $ListOfPaths ; do
      # If -e or -E was passed
      if $DeleteOnlyIfEmptyDir ; then
         #   remove directory only if empty
         RemoveEmptyDirectory "$EachFullPath"
         # If -E passed, then skip error reporting
         $SkipErrorMessageIfEmptyDirNotFound && continue
      else
         $ShowFilesAsRemoved && echo "   Removing: \"$EachFullPath\""
         # Clear immutable bit to remove any Finder lock
         chflags -R nouchg "$EachFullPath" 2>/dev/null 1>&2
         /bin/rm -rf "$EachFullPath" 2>/dev/null 1>&2   # Remove file/folder
      fi
      # If file still exists
      if [ "`ls -d "$EachFullPath" 2>/dev/null`" ] ; then
         TheFileWasRemoved=false
      else
         TheFileWasRemoved=true
         SomeFileWasRemoved=true
      fi
      # If the file/folder was not removed
      if ! $TheFileWasRemoved ; then
         if ! $ErrorOccurred ; then
            # Create LogFile
            echo "Symantec files/folders not removed:" >"$LogFile"
            chmod a=rw "$LogFile"
            ErrorOccurred=true
         fi
         echo "   $EachFullPath" >>"$LogFile"
      # Else if boot volume
      elif [ "$CurrentVolumeBeingUsed" = "/" ] ; then
         RestartMayBeNeeded=true
         SomeFileWasRemovedFromBootVolume=true
      else
         SomeFileWasRemovedFromNonBootVolume=true
      fi
      NoFilesToRemove=false
      FilesFoundOnThisVolume=true
   done
}

RemoveLoginKeychainPasswords()
{
   # Usage:     RemoveLoginKeychainPasswords volume
   # Summary:   Removes items from login keychains.
   #            If volume is not / (current boot volume), removal is skipped.
   #            If volume is not specified, / is assumed.
   #
   local VolumeBeingPurged="$1"
   local ComputerUserEntry
   local EachLoginKeychain
   local HelpTextToShow
   local LoginKeychainPasswordToDelete
   local LoginKeychainPasswordToDeleteLine
   local UserDir
   local UserOfKeychain
   # If volume not specified, assume it is boot volume
   [ -z "$VolumeBeingPurged" ] && VolumeBeingPurged=/
   # If volume being cleaned up is not the boot volume, skip purge
   [ "z$VolumeBeingPurged" != z/ ] && return
   $DoShowOnlyFilesThatShouldHaveBeenUninstalled || echo "Looking for Symantec login keychain items" 2>/dev/null
   IFS='
'
   for ComputerUserEntry in $ComputerUsersTable ; do
      UserOfKeychain=`echo "$ComputerUserEntry" | awk -F '	' '{print $1}'`
      UserDir=`echo "$ComputerUserEntry" | awk -F '	' '{print $2}'`
      EachLoginKeychain="$UserDir/Library/Keychains/login.keychain"
      [ ! -f "$EachLoginKeychain" ] && continue
      for LoginKeychainPasswordToDeleteLine in $LoginKeychainPasswordsToDelete ; do
         LoginKeychainPasswordToDelete=`echo "$LoginKeychainPasswordToDeleteLine" | awk -F '	' '{print $1}'`
         HelpTextToShow=`echo "$LoginKeychainPasswordToDeleteLine" | awk -F '	' '{print $2}'`
         /usr/bin/security find-generic-password -s "$LoginKeychainPasswordToDelete" "$EachLoginKeychain" 2>/dev/null 1>&2
         if [ $? = 0 ] ; then
            if $CreateFilesRemovedListOnly ; then
               echo "$HelpTextToShow ($LoginKeychainPasswordToDelete) would be removed" >> "$FilesRemovedList"
               echo "from $UserOfKeychain's login keychain" >> "$FilesRemovedList"
               echo "" >> "$FilesRemovedList"
            else
               echo "Removing $HelpTextToShow ($LoginKeychainPasswordToDelete)"
               echo "from $UserOfKeychain's login keychain"
               /usr/bin/security delete-generic-password -s "$LoginKeychainPasswordToDelete" "$EachLoginKeychain" 2>/dev/null 1>&2
            fi
         fi
      done
   done
}

RemoveNortonZoneDirectories()
{
   # Usage:     RemoveNortonZoneDirectories user_home_directory
   # Summary:   Removes Norton Zone paths listed in zoneDirectoryManagerRegistryKey in
   #            user_home_directory/Preference/com.symantec.nds.Norton-Zone.plist
   #
   local UserHomeDir="$1"
   local ZonePath
   local ZonePaths
   [ ! -d "$UserHomeDir" ] && return
   ZonePaths=`defaults read "$UserHomeDir/Library/Preferences/"com.symantec.nds.Norton-Zone zoneDirectoryManagerRegistryKey 2>/dev/null | grep = | awk -F '"' '{print $2}'`
   IFS='
'
   for ZonePath in $ZonePaths ; do
      RemoveItem "$ZonePath"
   done
   RemoveItem "$UserHomeDir/Norton Zone" "*"
}

RestartComputer()
{
   # Usage:     RestartComputer
   # Summary:   Prompts to see if user would like to restart. Restarts
   #            computer using 'reboot' command if 'yes' or 'y' is
   #            entered; exits the script otherwise.
   # Note:      User must be root or an admin for reboot to work, so this
   #            function should only be used in scripts run as root or
   #            admin user.
   #
   echo
   if $RunningFromWithinAppBundleOrSupportFolder ; then
      ExitScript $FinishedExitCode
   elif $QuitWithoutRestarting ; then
      echo "Exited the script without restarting the computer."
      ExitScript $FinishedExitCode
   elif ! $RestartAutomatically ; then
      echo "Do you wish to restart the computer now (WARNING: Unsaved changes"
      printf "in other open applications will be lost if you do!) (y/n)? "
      if `YesEntered` ; then
         RestartAutomatically=true
      fi
      echo
   fi
   if $RestartAutomatically ; then
      if $PauseBeforeRestarting ; then
         printf "Computer will restart in 3 seconds (ctrl-C to cancel restart)..."
         sleep 1 &>/dev/null
         printf " 3"
         sleep 1 &>/dev/null
         printf " 2"
         sleep 1 &>/dev/null
         printf " 1"
         sleep 1 &>/dev/null
      fi
      echo
      echo "Computer is restarting..."
      reboot
   else
      echo "Exited the script without restarting the computer."
      ExitScript $FinishedExitCode
   fi
}

RunPredeleteScripts()
{
   # Usage:     RunPredeleteScripts [$1]
   # Argument:  $1 = Path of current volume.
   # Summary:   If $1 is "" or /, predelete scripts in receipts listed in
   #            ReceiptsTable are run.
   #
   local EachReceiptLine
   local EachReceiptMatchingAll
   local ReceiptList
   local ReceiptListMatchingAll=""
   local VolumePathPassed="$1"
   [ "z$VolumePathPassed" = z/ ] && VolumePathPassed=""
   if $CreateFilesRemovedListOnly ; then
      if [ "$VolumePathPassed" ] ; then
         echo "Receipt predelete scripts would not be run on that volume." >> "$FilesRemovedList"
      elif $DoRunPredeleteScripts ; then
         echo "Receipt predelete scripts would be run as they are found." >> "$FilesRemovedList"
      else
         echo "Receipt predelete scripts would not be run because the -d option was specified." >> "$FilesRemovedList"
      fi
      return
   elif [ "$VolumePathPassed" ] ; then
      echo "Receipt predelete scripts were not run on that volume."
      return
   elif ! $DoRunPredeleteScripts ; then
      echo "Receipt predelete scripts were not run because the -d option was specified."
      return
   fi
   SYMANTEC_SAVED_DATA_DIR="/private/tmp/$FullScriptName-SYMANTEC_SAVED_DATA_DIR-`date +"%Y%m%d%H%M%S"`"
   mkdir -p "$SYMANTEC_SAVED_DATA_DIR" 2>/dev/null
   IFS='
'
   echo "Looking for predelete scripts in Symantec Uninstaller's Receipts folder"
   for PredeleteScript in `find "/Library/Application Support/Symantec/Uninstaller" 2>/dev/null | grep -E 'predelete$|pre_delete$'` ; do
      if [ -x "$PredeleteScript" ] ; then
         echo "--- Running $PredeleteScript ---"
         export SYMANTEC_SAVED_DATA_DIR
         if $ShowPredeleteErrors ; then
            "$PredeleteScript"
         else
            "$PredeleteScript" 2>/dev/null 1>&2
         fi
      fi
   done
   echo "Looking for predelete scripts in /Library/Receipts"
   ReceiptList=`echo "$ReceiptsTable" | grep '\.pkg' | grep -v '^#'`
   for EachReceiptMatchingAll in `echo "$ReceiptsTable" | grep '	-a' | grep -v '^#' | awk -F '	' '{print $1}'` ; do
      ReceiptListMatchingAll="$ReceiptListMatchingAll
`ls -d "/Library/Receipts/$EachReceiptMatchingAll"* 2>/dev/null`"
   done
   for EachReceiptMatchingAll in $ReceiptListMatchingAll ; do
      ReceiptList="$ReceiptList
`basename "$EachReceiptMatchingAll"`"
   done
   for EachReceiptLine in $ReceiptList ; do
      ReceiptArg=`echo "$EachReceiptLine" | awk -F "	" '{print $2}'`
      [ "z$ReceiptArg" = z-s ] && continue
      ReceiptName=`echo "$EachReceiptLine" | awk -F "	" '{print $1}'`
      [ -z "`echo "$ReceiptName" | grep '\.pkg$'`" ] && continue
      if [ -d "/Library/Receipts/$ReceiptName" ] ; then
         for PredeleteScript in `find "/Library/Receipts/$ReceiptName" 2>/dev/null | grep -E 'predelete$|pre_delete$'` ; do
            if [ -x "$PredeleteScript" ] ; then
               echo "--- Running $PredeleteScript ---"
               export SYMANTEC_SAVED_DATA_DIR
               if $ShowPredeleteErrors ; then
                  "$PredeleteScript"
               else
                  "$PredeleteScript" 2>/dev/null 1>&2
               fi
            fi
         done
      fi
      ReceiptName="`basename "$ReceiptName" .pkg`Dev.pkg"
      if [ -d "/Library/Receipts/$ReceiptName" ] ; then
         for PredeleteScript in `find "/Library/Receipts/$ReceiptName" 2>/dev/null | grep -E 'predelete$|pre_delete$'` ; do
            if [ -x "$PredeleteScript" ] ; then
               echo "--- Running $PredeleteScript ---"
               export SYMANTEC_SAVED_DATA_DIR
               if $ShowPredeleteErrors ; then
                  "$PredeleteScript"
               else
                  "$PredeleteScript" 2>/dev/null 1>&2
               fi
            fi
         done
      fi
   done
   rm -rf "$SYMANTEC_SAVED_DATA_DIR" 2>/dev/null
}

SetupCleanup()
{
   # Usage:     SetupCleanup
   # Summary:   Initializes variables needed for the RemoveItem function.
   #
   ErrorOccurred=false
   NoFilesToRemove=true
   /bin/rm -rf "$FilesRemovedList" "$FilesRemovedFilesOnlyList" 2>/dev/null 1>&2
   if $CreateFilesRemovedListOnly ; then
      if $ListOnlyFilesThatExist ; then
         echo "Summary of what $FullScriptName would do, based on files" > "$FilesRemovedList"
         echo "`$RemoveCrontabEntries && echo "and crontab entries "`that currently exist:" >> "$FilesRemovedList"
      else
         echo "Summary of what $FullScriptName would attempt to do:" > "$FilesRemovedList"
      fi
   fi
}

ShowContents()
{
   # Usage1:    ShowContents [-c] [-w] File [TextToShow]
   # Usage2:    ShowContents [-c] [-w] -s String [TextToShow]
   # Summary:   Displays contents of File or String. If there are more than
   #            $LINES or 23 lines, more command is used, using TextToShow as
   #            the name of the file; if TextToShow is not passed, "....." is
   #            used. If -c is specified, screen is cleared beforehand. 
   #            If -w is specified, then width of strings will be factored
   #            into the line count (this option makes output slower when
   #            the number of lines is less than $LINES or 23).
   #
   local SCLineCount
   local SCCurrentDir
   local SCTempFolder
   local SCTempFile
   local SCColumns
   local SCColumnsMax
   local SCColumnsMaxDefault=80
   local SCColumnsRemainder
   local CSDoAdjustForWidth=false
   local CSDoUseString=false
   local SCEachLine
   local SCGrepPattern='.'
   local SCLineFactor
   local SCLines
   local SCLinesMax
   local SCLinesMaxDefault=23
   local SCText
   while [ "$1" ] ; do
      if [ "z$1" = z-c ] ; then
         clear
      elif [ "z$1" = z-s ] ; then
         CSDoUseString=true
      elif [ "z$1" = z-w ] ; then
         CSDoAdjustForWidth=true
      else
         break
      fi
      shift
   done
   [ "$COLUMNS" ] && SCColumnsMax=`expr "$COLUMNS" - 0 2>/dev/null`
   [ -z "$SCColumnsMax" ] && SCColumnsMax=$SCColumnsMaxDefault
   [ "$LINES" ] && SCLinesMax=`expr "$LINES" - 1 2>/dev/null`
   [ -z "$SCLinesMax" ] && SCLinesMax=$SCLinesMaxDefault
   [ $SCColumnsMax -ge $SCColumnsMaxDefault ] && SCGrepPattern='.................................................................................'
   if $CSDoUseString ; then
      SCLineCount=`printf "%s\n" "$1" | grep -c ""`
      $CSDoAdjustForWidth && SCText=`printf "%s\n" "$1" | grep "$SCGrepPattern"`
   elif [ -f "$1" ] ; then
      SCLineCount=`grep -c "" "$1"`
      $CSDoAdjustForWidth && SCText=`grep "$SCGrepPattern" "$1"`
   else
      return 1
   fi
   if $CSDoAdjustForWidth ; then
      if [ $SCLineCount -le $SCLinesMax ] ; then
         IFS='
'
         for SCColumns in `printf "%s" "$SCText" | awk '{print length($0)}'` ; do
            [ $SCLineCount -gt $SCLinesMax ] && break
            SCLineFactor=`expr $SCColumns / $SCColumnsMax`
            [ `expr $SCColumns % $SCColumnsMax` -gt 0 ] && let SCLineFactor=$SCLineFactor+1
            [ $SCLineFactor -gt 1 ] && let SCLineCount=$SCLineCount+$SCLineFactor-1
         done
      fi
   fi
   if $CSDoUseString ; then
      if [ $SCLineCount -gt $SCLinesMax ] ; then
         SCCurrentDir=`pwd`
         SCTempFolder="/private/tmp/$FullScriptName-SC-`date +"%Y%m%d%H%M%S"`"
         mkdir "$SCTempFolder" 2>/dev/null
         [ ! -d "$SCTempFolder" ] && return 1
         cd "$SCTempFolder" 2>/dev/null
         [ "$2" ] && SCTempFile="$2" || SCTempFile="....."
         printf "%s\n" "$1" >"$SCTempFile"
         more -E "$SCTempFile"
         cd "$SCCurrentDir" 2>/dev/null
         rm -rf "$SCTempFolder" 2>/dev/null
      else
         printf "%s\n" "$1"
      fi
   elif [ -f "$1" ] ; then
      if [ $SCLineCount -gt $SCLinesMax ] ; then
         SCCurrentDir=`pwd`
         SCTempFolder="/private/tmp/$FullScriptName-SC-`date +"%Y%m%d%H%M%S"`"
         mkdir "$SCTempFolder" 2>/dev/null
         [ ! -d "$SCTempFolder" ] && return 1
         [ "$2" ] && SCTempFile="$2" || SCTempFile="....."
         cat "$1" >"$SCTempFolder/$SCTempFile"
         cd "$SCTempFolder" 2>/dev/null
         more -E "$SCTempFile"
         cd "$SCCurrentDir" 2>/dev/null
         rm -rf "$SCTempFolder" 2>/dev/null
      else
         cat "$1"
      fi
   fi
   return 0
}

ShowFullFilePath()
{
   # Usage:     ShowFullFilePath [-a] [-P | -L] [-e] Path [[-e] Path]
   # Version:   1.0.2
   # Summary:   Prints the full path starting at / of Path if Path exists
   #            and Path is accessible by the user calling this function.
   #            Run this function as root to ensure full path displaying.
   #            If there is more than one existing file that matches the
   #            name, then only the first path that the shell matches is
   #            printed unless -a or more than one path is specified.
   #            You can specify wild card characters ? and * and other
   #            argument operators in the Path (e.g., "../*", "a?.txt",
   #            "[ab]*").
   # Options:   -a   Show all matching paths, sorted alphanumerically. If
   #                 -P is not passed, the same file may be shown multiple
   #                 times if there is more than one matching link that
   #                 points to it.
   #            -e <Path>
   #                 Treat argument after -e as a path. Use -e to treat
   #                 -a, -e, -L, or -P as a path.
   #            -L   Show logical path, even if a file pointed to by a link
   #                 doesn't exist. This is the default.
   #            -P   Show physical path. If a link points to a file that
   #                 does not exist, the path won't be shown.
   # History: 1.0.1 - Added -e option and ability to pass multiple paths.
   #                  Arguments can now be passed in any order.
   #                  Fixed error that could occur when resolving links
   #                  with long paths.
   #          1.0.2 - Modified for case-sensitive volume compatibility.
   #                  Made temporary file names more distinctive.
   #
   local SFFPArgCount=$#
   local SFFPCurrentDir
   local SFFPCurrentDirTranslated
   local SFFPEachLine
   local SFFPEachPath
   local SFFPFile
   local SFFPLDir
   local SFFPLLinkLS
   local SFFPLLinkPath
   local SFFPLPath
   local SFFPPathOption=-L
   local SFFPSaveIFS="$IFS"
   local SFFPShowAll=false
   local SFFPTempBase=/private/tmp/ShowFullFilePath-`/usr/bin/basename "$0"`-`/bin/date +"%Y%m%d%H%M%S"`
   local SFFPTempFile="$SFFPTempBase.tmp"
   local SFFPTempFile2="$SFFPTempBase-2.tmp"
   /bin/rm -f "$SFFPTempFile" 2>/dev/null
   while [ $SFFPArgCount != 0 ] ; do
      case "$1" in
         -a)
            SFFPShowAll=true
            ;;
         -L|-P)
            SFFPPathOption="$1"
            ;;
         *)
            [ "z$1" = z-e ] && shift
            if [ "$1" ] ; then
               [ -s "$SFFPTempFile" ] && SFFPShowAll=true
               /usr/bin/printf "%s\n" "$1" >>"$SFFPTempFile"
            fi
            ;;
      esac
      shift
      let SFFPArgCount=$SFFPArgCount-1
   done
   [ ! -s "$SFFPTempFile" ] && return
   SFFPCurrentDir=`/bin/pwd`
   SFFPCurrentDirTranslated=`/bin/pwd $SFFPPathOption 2>/dev/null`
   if [ ! -d "$SFFPCurrentDirTranslated" ] ; then
      /bin/rm -f "$SFFPTempFile" 2>/dev/null
      return
   fi
   cd "$SFFPCurrentDirTranslated" 2>/dev/null
   if [ $? != 0 ] ; then
      /bin/rm -f "$SFFPTempFile" 2>/dev/null
      return
   fi
   /usr/bin/printf "" >"$SFFPTempFile2"
   IFS='
'
   for SFFPEachLine in `/bin/cat "$SFFPTempFile" 2>/dev/null` ; do
      cd "$SFFPCurrentDirTranslated" 2>/dev/null
      [ $? != 0 ] && break
      if [ "z$SFFPPathOption" = z-P ] ; then
         SFFPLPath="$SFFPEachLine"
         while [ -L "$SFFPLPath" ] ; do
            [ ! -e "$SFFPLPath" ] && break
            cd "`/usr/bin/dirname "$SFFPLPath" 2>/dev/null`" 2>/dev/null
            [ $? != 0 ] && break
            SFFPLDir=`/bin/pwd -P 2>/dev/null`
            [ ! -d "$SFFPLDir" ] && break
            SFFPLLinkLS=`/bin/ls -ld "$SFFPLPath" 2>/dev/null`
            [ -z "$SFFPLLinkLS" ] && break
            # If link or link target contains " -> " in its name
            if [ "`echo "z$SFFPLLinkLS" | grep ' -> .* -> '`" ] ; then
               SFFPLLinkPath=`/usr/bin/printf "%s" "$SFFPLLinkLS" | /usr/bin/awk -v THESTR="$SFFPLPath -> " '{ match($0,THESTR) ; print substr($0,RSTART+RLENGTH)}'`
            else
               SFFPLLinkPath=`echo "$SFFPLLinkLS" | awk -F " -> " '{print $2}'`
            fi
            # If link target begins with /
            if [ "`/usr/bin/printf "%s" "$SFFPLLinkPath" | grep '^/'`" ] ; then
               SFFPLPath="$SFFPLLinkPath"
            else
               SFFPLPath="$SFFPLDir/$SFFPLLinkPath"
            fi
            [ "`/usr/bin/printf "%s" "$SFFPLPath" | grep '^//'`" ] && SFFPLPath=`echo "$SFFPLPath" | /usr/bin/awk '{print substr($0,2)}'`
         done
         cd "$SFFPCurrentDirTranslated" 2>/dev/null
         [ $? != 0 ] && break
         if [ ! -e "$SFFPLPath" ] ; then
            $SFFPShowAll && continue || break
         fi
         SFFPEachPath="$SFFPLPath"
      else
         SFFPEachPath="$SFFPEachLine"
      fi
      if [ -d "$SFFPEachPath" ] ; then
         cd "$SFFPEachPath" 2>/dev/null
         if [ $? != 0 ] ; then
            $SFFPShowAll && continue || break
         fi
         SFFPFile=""
      elif [ -d "`/usr/bin/dirname "$SFFPEachPath" 2>/dev/null`" ] ; then
         cd "`/usr/bin/dirname "$SFFPEachPath" 2>/dev/null`" 2>/dev/null
         if [ $? != 0 ] ; then
            $SFFPShowAll && continue || break
         fi
         SFFPFile=`basename "$SFFPEachPath" 2>/dev/null`
         [ "z$SFFPFile" = z/ -o "z$SFFPFile" = z. -o "z$SFFPFile" = z.. ] && SFFPFile=""
      elif $SFFPShowAll ; then
         continue
      else
         break
      fi
      SFFPDir=`/bin/pwd $SFFPPathOption 2>/dev/null`
      if [ ! -d "$SFFPDir" ] ; then
         $SFFPShowAll && continue || break
      fi
      SFFPPath="$SFFPDir`[ "z$SFFPFile" != z -a "z$SFFPDir" != z/ -a "z$SFFPDir" != z// ] && echo /`$SFFPFile"
      if [ ! -e "$SFFPPath" -a ! -L "$SFFPPath" ] ; then
         $SFFPShowAll && continue || break
      fi
      [ "`echo "$SFFPPath" | grep '^//'`" ] && SFFPPath=`echo "$SFFPPath" | /usr/bin/awk '{print substr($0,2)}'`
      echo "$SFFPPath" >>"$SFFPTempFile2"
      # If neither option -a nor more than one path was passed, don't show any more names
      ! $SFFPShowAll && break
   done
   IFS=$SFFPSaveIFS
   [ -s "$SFFPTempFile2" ] && /usr/bin/sort -f "$SFFPTempFile2" | /usr/bin/uniq
   /bin/rm -f "$SFFPTempFile" "$SFFPTempFile2" 2>/dev/null
   cd "$SFFPCurrentDir" 2>/dev/null
}

ShowHelp()
{
   # Usage:     ShowHelp [$1]
   # Argument:  $1 = Exit code.
   # Summary:   Displays script usage and help then exits script.
   #            If a number is passed to $1, then script exits with
   #            that number; else, script is not exited.
   #
   TEMPFILETEMPLATE="/private/tmp/SymantecTemp"
   TEMPFILE="$TEMPFILETEMPLATE`date +"%Y%m%d%H%M%S"`-1"
   ShowVersion >>"$TEMPFILE"
   $AutoRunScript && echo "
Note:    This script requires no user interaction if run as root. You can
         run this script on several machines at once by using Symantec
         Endpoint Protection to push this script to client Macs." >>"$TEMPFILE"
   echo "
WARNING: This script will remove all files and folders created by Symantec
         Mac OS X products (LiveUpdate Administration Utility files) and
         any files within those folders. Therefore, you will lose ALL files
         that reside in those folders, including any that you have created.

Usage:   $FullScriptName [-CcdeFfghIikLlmpQqRrV] [-QQ] [-re] [volume ...]

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

         Each volume name may begin with \"/Volumes/\", unless it is \"/\".
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
         -L     List all files that $FullScriptName will attempt
                to find and delete. Nothing is deleted by this option.
         -m     Show output from -l, -L, or -R options using more program.
                This is no longer the default action as of version 5.52
                of $FullScriptName.
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
                exit with $ExitCodeWhenFilesRemain; otherwise, exit with 0. No progress is shown
                and nothing is deleted.
         -V     Show version only.

Examples:
         $FullScriptName
                Deletes all Symantec files and Symantec crontab entries
                from the boot volume.

         $FullScriptName /Volumes/OS\ 10.2
                Deletes all Symantec files and Symantec crontab entries
                from the volume named \"OS 10.2\".
                Nothing is deleted from the boot volume.

         $FullScriptName Runner /
                Deletes all Symantec files and Symantec crontab entries
                from the volume named \"Runner\" and from the boot volume.

         $FullScriptName -i \"Test Disk\"
                Deletes only invisible Symantec files from the volume named
                \"Test Disk\".

         $FullScriptName -A -r
                Deletes all Symantec files and Symantec crontab entries
                from all mounted volumes that have OS X installed on them.
                Deletes only invisible Symantec files from volumes that do
                not have OS X installed on them.
                Computer is restarted automatically if necessary.

         $FullScriptName -Ai
                Deletes only invisible Symantec files from all volumes.

         $FullScriptName -I
                Deletes all but the invisible Symantec files from the boot
                volume. Crontab entries are removed from the boot volume.

         $FullScriptName -C
                Deletes all Symantec files from the boot volume. No crontab
                entries are removed.

         $FullScriptName -L -A
                Lists all the files that $FullScriptName looks
                for on all volumes. The files may or may not be currently
                installed. Nothing is deleted.

         $FullScriptName -R -A
                Lists only the Symantec files that are currently installed
                on all volumes. Files within existing folders will also be
                shown. Nothing is deleted.

         $FullScriptName -l -i
                Lists the invisible Symantec files that are currently
                installed on the boot volume. Nothing is deleted.

Note:    You must be root or an admin user to run this script. You can
         simply double-click on $FullScriptName to remove all
         Symantec files and crontab entries from the boot volume.
" >>"$TEMPFILE"
   ShowContents "$TEMPFILE"
   /bin/rm "$TEMPFILE" 2>/dev/null
   [ "$1" ] && exit $1
}

ShowUsage()
{
   # Usage:     ShowUsage [$1 [$2]]
   # Arguments: $1 = Exit code.
   #            $2 = Error message to display before showing usage.
   # Summary:   Displays script usage. If an exit code is passed,
   #            script is exited with that value.
   #
   if [ "$2" ] ; then
      echo
      echo "$2"
      echo
   fi
   ShowHelp | grep "^Usage.*:"
   [ "$2" ] && echo
   [ -n "$1" ] && exit "$1"
}

ShowVersion()
{
   # Usage:     ShowVersion
   # Summary:   Displays the name and version of script.
   #
   echo "********* $FullScriptName $Version *********"
}

SymantecIsInMemory()
{
   # Usage:     SymantecIsInMemory
   # Summary:   If a Symantec process or kext is in memory,
   #            0 is returned; 1 is returned.
   #
   local SymantecIsInMemoryResult=1
   # If there are no more Symantec processes in memory
   if KillSymantecProcesses -n ; then
      # Check to see if Symantec kexts are in memory
      kextstat 2>/dev/null 1>&2
      # If kextstat failed to run
      if [ $? -gt 0 ] ; then
         # try running kmodstat (for old versions of OS X)
         if [ "`kmodstat | grep -i Symantec | grep -v " grep -"` 2>/dev/null" ] ; then
            SymantecIsInMemoryResult=0
         fi
      elif [ "`kextstat | grep -i Symantec | grep -v " grep -"`" ] ; then
         SymantecIsInMemoryResult=0
      fi
      if [ $SymantecIsInMemoryResult = 0 ] ; then
         echo "*** There are Symantec kexts loaded."
      fi
   else
      SymantecIsInMemoryResult=0
   fi
   return $SymantecIsInMemoryResult
}

YesEntered()
{
   # Usage:     YesEntered
   # Summary:   Reads a line from standard input. If "y" or "yes"
   #            was entered, true is shown and 0 is returned; otherwise,
   #            false is shown and 1 is returned. The case of letters is
   #            ignored. Sample call:
   #               if `YesEntered`
   #
   read YesEnteredString
   YesEnteredString=`echo "z$YesEnteredString" | awk '{print tolower(substr($0,2))}'`
   if [ "'$YesEnteredString" = "'y" -o "'$YesEnteredString" = "'yes" ] ; then
      echo true
      return 0
   fi
   echo false
   return 1
}

# *** Beginning of Commands to Execute ***

# Verify that all required programs are installed - Etrack 3539262
which which &>/dev/null
if [ $? = 0 ] ; then
   MissingRequiredPrograms=""
   SavedIFS="$IFS"
   IFS='
'
   for RequiredProgram in $RequiredPrograms ; do
      which "$RequiredProgram" &>/dev/null
      [ $? != 0 ] && MissingRequiredPrograms="$MissingRequiredPrograms
         $RequiredProgram"
   done
   IFS="$SavedIFS"
else
   MissingRequiredPrograms="
         which"
fi
if [ "$MissingRequiredPrograms" ] ; then
   echo
   echo "WARNING: Could not continue because the following program(s) could not be found:"
   echo "$MissingRequiredPrograms"
   echo
   exit 2
fi
ScriptPath=`ShowFullFilePath "$0" -P`
ScriptDir=`dirname "$ScriptPath"`
if [ $# -eq 0 ] ; then   # If no arguments were passed to script
   # Run script as if it was double-clicked in Finder so that
   # screen will be cleared and quit message will be displayed.
   RunScriptAsStandAlone=true
else
   # Run script in command line mode so that
   # screen won't be cleared and quit message won't be displayed.
   RunScriptAsStandAlone=false
fi
# If script was run from support folder or from within an app bundle
if [ "`echo "$ScriptDir" | grep -e "$LaunchLocationGrepPattern"`" ] ; then
   RunScriptAsStandAlone=false
   RunningFromWithinAppBundleOrSupportFolder=true
else
   RunningFromWithinAppBundleOrSupportFolder=false
fi
if $RunScriptAsStandAlone ; then
   clear >&2
fi
ProcessArguments --OptionIsOneArgument="-QQ" --OptionIsOneArgument="-re" "$@"
if [ "`whoami`" != "root" ] ; then   # If not root user,
   if $PublicVersion ; then
      GetAdminPassword true   #    Prompt user for admin password
   elif ! $DoShowOnlyFilesThatShouldHaveBeenUninstalled ; then
      ShowVersion >&2
      echo >&2
   fi
   # Run this script again as root
   sudo -p "Please enter your admin password: " "$0" "$@"
   ErrorFromSudoCommand=$?
   # If unable to authenticate
   if [ $ErrorFromSudoCommand -eq 1 ] ; then
      echo "You entered an invalid password or you are not an admin user. Script aborted." >&2
      ExitScript 1
   fi
   if $PublicVersion ; then
      sudo -k   # Make sudo require a password the next time it is run
   fi
   exit $ErrorFromSudoCommand #    Exit so script doesn't run again
fi
OSXVersion=`cat  /System/Library/CoreServices/SystemVersion.plist 2>/dev/null | tr '\015' '\012' | grep . | grep -A1 '<key>ProductVersion' | tail -n 1 | grep '<string>10\.' | awk -F '>' '{print $2}' | awk -F '<' '{print $1}'`
OSXmajorVersion=`printf "%s" "$OSXVersion" | awk -F . '{print $2}'`
# If no volumes were passed to script, the boot volume will be searched
if [ -z "$VolumesToUse" ] ; then
   BootVolumeWillBeSearched=true
fi
if [ $PublicVersion = true -a $CreateFilesRemovedListOnly = false -a \
     $RemoveCrontabEntriesOnly = false -a $RemoveInvisibleFilesOnly = false -a \
     $AutoRunScript = false -a $RunningFromWithinAppBundleOrSupportFolder = false ] ; then
   DetermineAction
fi
if [ $RemoveFromAllVolumes = true -a $CreateFilesRemovedListOnly = false -a $RemoveCrontabEntriesOnly = false -a $RemoveInvisibleFilesOnly = false -a $AutoRunScript = false -a $RunningFromWithinAppBundleOrSupportFolder = false ] ; then
   echo
   printf "Are you sure you want to remove Symantec files from ALL mounted volumes (y/n)? "
   if `YesEntered` ; then
      echo
   else
      echo
      echo "Script aborted. No files were removed."
      ExitScript 0
   fi
fi
SetupCleanup
WillTense=will
if $CreateFilesRemovedListOnly ; then
   if ! $DoShowOnlyFilesThatShouldHaveBeenUninstalled ; then
      echo "Generating a list of files that would be removed by" >&2
      echo "   $FullScriptName (no files will be removed at this time)..." >&2
   fi
   WillTense=would
elif $RemoveInvisibleFilesOnly ; then
   echo "Removing AntiVirus QuickScan files and Norton FS files..."
else
   if $BootVolumeWillBeSearched ; then
      if [ $RestartAutomatically = true -a $RemoveCrontabEntriesOnly = false ] ; then
         echo
         echo "Note: Computer will be restarted automatically if necessary."
         echo
      elif $QuitWithoutRestarting ; then
         echo
         echo "Note: This script will automatically quit when finished."
         echo
      fi
   fi
   echo "Removing Symantec files..."
   ! $RemoveInvisibleFiles && echo "Invisible Symantec files will not be deleted."
fi
if $RemoveCrontabEntriesOnly ; then
   echo "Only crontab entries $WillTense be removed."
fi
! $RemoveCrontabEntries && echo "Symantec crontab entries $WillTense not be removed."
! $RemoveInvisibleFiles && echo "AntiVirus QuickScan and Norton FS files $WillTense not be removed."
if $RemoveFromAllVolumes ; then
   VolumesToUse="/
"`ls -d /Volumes/*`
elif ! $RemoveFromOtherVolumes ; then
   VolumesToUse=/
fi
ListOfVolumesToUse=`echo "$VolumesToUse" | sort -f | uniq`
IFS='
'
for EachVolume in $ListOfVolumesToUse ; do
   [ -L "$EachVolume" ] && continue
   FilesFoundOnThisVolume=false
   RemoveAllNortonFiles "$EachVolume"
   if [ $CreateFilesRemovedListOnly = true -a $FilesFoundOnThisVolume = false -a $ListOnlyFilesThatExist = true ] ; then
      echo "No matching files were found on \"`basename "$EachVolume"`\"." >> "$FilesRemovedList"
   fi
done
FinishCleanup
FinishedExitCode=$?
if [ $BootVolumeWillBeSearched = true -a $CreateFilesRemovedListOnly = false ] ; then
   # If some Symantec process or kext is in memory, touch restart file
   if SymantecIsInMemory ; then
      touch "$SymantecCleanupRestartFile" /Library/Extensions /System/Library/Extensions
      # May run kextcache in a future release:
      # echo "Rebuilding kext caches"
      # kextcache -u /
   fi
   if [ -f "$SymantecCleanupRestartFile" ] ; then
      echo
      echo "NOTE: You should now restart the computer to get Symantec processes"
      echo "      and kexts out of memory and/or to remove login items."
      RestartComputer
   elif [ -e /Library/StartupItems/CleanUpSymWebKitUtils ] ; then
      echo
      echo "NOTE: You should now restart the computer to have CleanUpSymWebKitUtils"
      echo "      finish removing SymWebKitUtils.framework."
      RestartComputer
   fi
fi
ExitScript $FinishedExitCode

# *** End of Commands to Execute ***
