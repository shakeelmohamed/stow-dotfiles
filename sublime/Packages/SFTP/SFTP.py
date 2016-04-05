import sublime
import traceback
import os
import sys
import time
import re


st_version = 2
if int(sublime.version()) > 3000:
    st_version = 3


reloading = {
    'happening': False,
    'shown': False
}

reload_mods = []
for mod in sys.modules:
    if (mod[0:9] == 'SFTP.sftp' or mod[0:5] == 'sftp.' or mod == 'sftp') and sys.modules[mod] is not None:
        reload_mods.append(mod)
        reloading['happening'] = True

# Prevent popups during reload, saving the callbacks for re-adding later
if reload_mods:
    old_callbacks = {}
    hook_match = re.search("<class '(\w+).ExcepthookChain'>", str(sys.excepthook))
    if hook_match:
        _temp = __import__(hook_match.group(1), globals(), locals(), ['ExcepthookChain'], -1)
        ExcepthookChain = _temp.ExcepthookChain
        old_callbacks = ExcepthookChain.names
    sys.excepthook = sys.__excepthook__

mods_load_order = [
    'sftp',
    'sftp.times',
    'sftp.views',
    'sftp.paths',
    'sftp.debug',
    'sftp.errors',
    'sftp.threads',
    'sftp.secure_input',
    'sftp.proc',
    'sftp.vcs',
    'sftp.config',
    'sftp.panel_printer',
    'sftp.file_transfer',
    'sftp.ftplib2',
    'sftp.ftp_transport',
    'sftp.ftps_transport',
    'sftp.sftp_transport',
    'sftp.commands',
    'sftp.listeners'
]

mod_load_prefix = ''
if st_version == 3:
    mod_load_prefix = 'SFTP.'
    from imp import reload

for mod in mods_load_order:
    if mod_load_prefix + mod in reload_mods:
        reload(sys.modules[mod_load_prefix + mod])


need_package_control_upgrade = False
try:
    from sftp.commands import (
        SftpBrowseCommand,
        SftpBrowseServerCommand,
        SftpCancelUploadCommand,
        SftpCreateAltConfigCommand,
        SftpCreateConfigCommand,
        SftpCreateServerCommand,
        SftpCreateSubConfigCommand,
        SftpDeleteLocalAndRemotePathsCommand,
        SftpDeleteRemotePathCommand,
        SftpDeleteServerCommand,
        SftpDiffRemoteFileCommand,
        SftpDownloadFileCommand,
        SftpDownloadFolderCommand,
        SftpEditConfigCommand,
        SftpEditServerCommand,
        SftpInsertViewCommand,
        SftpLastServerCommand,
        SftpMonitorFileCommand,
        SftpRenameLocalAndRemotePathsCommand,
        SftpReplaceViewCommand,
        SftpShowPanelCommand,
        SftpSwitchConfigCommand,
        SftpSyncBothCommand,
        SftpSyncDownCommand,
        SftpSyncUpCommand,
        SftpThread,
        SftpUploadFileCommand,
        SftpUploadFolderCommand,
        SftpUploadOpenFilesCommand,
        SftpVcsChangedFilesCommand,
        SftpWritePanelCommand,
    )
    from sftp.listeners import (
        SftpAutoConnectListener,
        SftpAutoUploadListener,
        SftpCloseListener,
        SftpFocusListener,
        SftpLoadListener,
    )
    from sftp import debug as sftp_debug
    from sftp import paths as sftp_paths
    from sftp import times as sftp_times
except (ImportError):
    try:
        from .sftp.commands import (  # noqa
            SftpBrowseCommand,
            SftpBrowseServerCommand,
            SftpCancelUploadCommand,
            SftpCreateAltConfigCommand,
            SftpCreateConfigCommand,
            SftpCreateServerCommand,
            SftpCreateSubConfigCommand,
            SftpDeleteLocalAndRemotePathsCommand,
            SftpDeleteRemotePathCommand,
            SftpDeleteServerCommand,
            SftpDiffRemoteFileCommand,
            SftpDownloadFileCommand,
            SftpDownloadFolderCommand,
            SftpEditConfigCommand,
            SftpEditServerCommand,
            SftpInsertViewCommand,
            SftpLastServerCommand,
            SftpMonitorFileCommand,
            SftpRenameLocalAndRemotePathsCommand,
            SftpReplaceViewCommand,
            SftpShowPanelCommand,
            SftpSwitchConfigCommand,
            SftpSyncBothCommand,
            SftpSyncDownCommand,
            SftpSyncUpCommand,
            SftpThread,
            SftpUploadFileCommand,
            SftpUploadFolderCommand,
            SftpUploadOpenFilesCommand,
            SftpVcsChangedFilesCommand,
            SftpWritePanelCommand,
        )
        from .sftp.listeners import (  # noqa
            SftpAutoConnectListener,
            SftpAutoUploadListener,
            SftpCloseListener,
            SftpFocusListener,
            SftpLoadListener,
        )
        from .sftp import debug as sftp_debug
        from .sftp import paths as sftp_paths
        from .sftp import times as sftp_times
    except (ImportError) as e:
        if str(e).find('bad magic number') != -1:
            need_package_control_upgrade = True
        else:
            raise


def plugin_loaded():
    if need_package_control_upgrade:
        sublime.error_message(
            u'SFTP\n\nThe SFTP package seems to have been '
            u'installed using an older version of Package Control. Please '
            u'remove the SFTP package, upgrade Package Control to 2.0.0 '
            u'and then reinstall SFTP.\n\nIt may be necessary to delete '
            u'the "Packages/Package Control/" folder and then follow the '
            u'instructions at https://sublime.wbond.net/installation to '
            u'properly upgrade Package Control.'
        )
        return

    settings = sublime.load_settings('SFTP.sublime-settings')

    try:
        # This won't be defined if the wrong version is installed
        sftp_debug.set_debug(settings.get('debug', False))
    except (NameError):
        pass

    bin_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'bin')
    has_bin = os.path.exists(bin_folder)
    psftp_exe = os.path.join(bin_folder, 'psftp.exe')
    has_psftp = os.path.exists(psftp_exe)
    if os.name == 'nt' and (not has_bin or not has_psftp):
        sublime.error_message(
            u'SFTP\n\nThe SFTP package seems to have been '
            u'synced or copied from an OS X or Linux machine. The Windows '
            u'version of the package is different due to the inclusion of '
            u'a number of necessary exe files.\n\nTo fix the SFTP package '
            u'so that it may run properly, please run "Remove Package" and '
            u'then reinstall it using the "Install Package" command.\n\nTo '
            u'learn how to properly sync packages across different machines, '
            u'please visit https://sublime.wbond.net/docs/syncing'
        )


if sys.version_info < (3,):
    plugin_loaded()


hook_match = re.search("<class '(\w+).ExcepthookChain'>", str(sys.excepthook))

if not hook_match:
    class ExcepthookChain(object):
        callbacks = []
        names = {}

        @classmethod
        def add(cls, name, callback):
            if name == 'sys.excepthook':
                if name in cls.names:
                    return
                cls.callbacks.append(callback)
            else:
                if name in cls.names:
                    cls.callbacks.remove(cls.names[name])
                cls.callbacks.insert(0, callback)
            cls.names[name] = callback

        @classmethod
        def hook(cls, type, value, tb):
            for callback in cls.callbacks:
                callback(type, value, tb)

        @classmethod
        def remove(cls, name):
            if name not in cls.names:
                return
            callback = cls.names[name]
            del cls.names[name]
            cls.callbacks.remove(callback)
else:
    _temp = __import__(hook_match.group(1), globals(), locals(), ['ExcepthookChain'], -1)
    ExcepthookChain = _temp.ExcepthookChain


# Override default uncaught exception handler
def sftp_uncaught_except(type, value, tb):
    message = ''.join(traceback.format_exception(type, value, tb))

    if message.find('/sftp/') != -1 or message.find('\\sftp\\') != -1:
        def append_log():
            log_file_path = os.path.join(
                sublime.packages_path(),
                'User',
                'SFTP.errors.log'
            )
            send_log_path = log_file_path
            timestamp = sftp_times.timestamp_to_string(time.time(), '%Y-%m-%d %H:%M:%S\n')
            with open(log_file_path, 'a') as f:
                f.write(timestamp)
                f.write(message)
            if sftp_debug.get_debug() and sftp_debug.get_debug_log_file():
                send_log_path = sftp_debug.get_debug_log_file()
                sftp_debug.debug_print(message)
            sublime.error_message(
                'Sublime SFTP\n\nAn unexpected error occurred, please send '
                'the file %s to support@wbond.net' % send_log_path
            )
            sublime.active_window().run_command(
                'open_file',
                {'file': sftp_paths.fix_windows_path(send_log_path)}
            )
        if reloading['happening']:
            if not reloading['shown']:
                sublime.error_message(
                    'Sublime SFTP\n\nThe package was just upgraded, please '
                    'restart Sublime Text to finish the upgrade'
                )
                reloading['shown'] = True
        else:
            sublime.set_timeout(append_log, 10)

if reload_mods and old_callbacks:
    for name in old_callbacks:
        ExcepthookChain.add(name, old_callbacks[name])

ExcepthookChain.add('sys.excepthook', sys.__excepthook__)
ExcepthookChain.add('sftp_uncaught_except', sftp_uncaught_except)

if sys.excepthook != ExcepthookChain.hook:
    sys.excepthook = ExcepthookChain.hook


def unload_handler():
    try:
        SftpThread.cleanup()
    except (NameError):
        pass

    ExcepthookChain.remove('sftp_uncaught_except')
