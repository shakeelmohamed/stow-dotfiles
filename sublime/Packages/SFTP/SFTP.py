# coding: utf-8
from __future__ import unicode_literals, division, absolute_import, print_function

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
    hook_match = re.search(r"<class '(\w+).ExcepthookChain'>", str(sys.excepthook))
    if hook_match:
        _temp = __import__(hook_match.group(1), globals(), locals(), ['ExcepthookChain'], -1)
        ExcepthookChain = _temp.ExcepthookChain
        old_callbacks = ExcepthookChain.names
    sys.excepthook = sys.__excepthook__

mods_load_order = [
    'sftp',
    'sftp.vendor.asn1crypto._errors',
    'sftp.vendor.asn1crypto._int',
    'sftp.vendor.asn1crypto._ordereddict',
    'sftp.vendor.asn1crypto._teletex_codec',
    'sftp.vendor.asn1crypto._types',
    'sftp.vendor.asn1crypto._inet',
    'sftp.vendor.asn1crypto._iri',
    'sftp.vendor.asn1crypto.version',
    'sftp.vendor.asn1crypto.pem',
    'sftp.vendor.asn1crypto.util',
    'sftp.vendor.asn1crypto.parser',
    'sftp.vendor.asn1crypto.core',
    'sftp.vendor.asn1crypto.algos',
    'sftp.vendor.asn1crypto.keys',
    'sftp.vendor.asn1crypto.x509',
    'sftp.vendor.asn1crypto.crl',
    'sftp.vendor.asn1crypto.csr',
    'sftp.vendor.asn1crypto.ocsp',
    'sftp.vendor.asn1crypto.cms',
    'sftp.vendor.asn1crypto.pdf',
    'sftp.vendor.asn1crypto.pkcs12',
    'sftp.vendor.asn1crypto.tsp',
    'sftp.vendor.asn1crypto',
    'sftp.ecdsa',
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
    'sftp.listeners',
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
        SftpEnterLicenseKeyCommand,
        SftpRemoveLicenseKeyCommand,
        SftpEnableDebugModeCommand,
        SftpDisableDebugModeCommand,
        SftpEditSettingsCommand,
        SftpOpenDefaultSettingsCommand,
        SftpOpenUserSettingsCommand,
        SftpEditKeyBindingsCommand,
        SftpOpenDefaultKeyBindingsCommand,
        SftpOpenUserKeyBindingsCommand,
        cmd_init,
        cmd_cleanup,
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
            SftpEnterLicenseKeyCommand,
            SftpRemoveLicenseKeyCommand,
            SftpEnableDebugModeCommand,
            SftpDisableDebugModeCommand,
            SftpEditSettingsCommand,
            SftpOpenDefaultSettingsCommand,
            SftpOpenUserSettingsCommand,
            SftpEditKeyBindingsCommand,
            SftpOpenDefaultKeyBindingsCommand,
            SftpOpenUserKeyBindingsCommand,
            cmd_init,
            cmd_cleanup,
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
            'SFTP\n\nThe SFTP package seems to have been '
            'installed using an older version of Package Control. Please '
            'remove the SFTP package, upgrade Package Control to 2.0.0 '
            'and then reinstall SFTP.\n\nIt may be necessary to delete '
            'the "Packages/Package Control/" folder and then follow the '
            'instructions at https://packagecontrol.io/installation to '
            'properly upgrade Package Control.'
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
            'SFTP\n\nThe SFTP package seems to have been '
            'synced or copied from an OS X or Linux machine. The Windows '
            'version of the package is different due to the inclusion of '
            'a number of necessary exe files.\n\nTo fix the SFTP package '
            'so that it may run properly, please run "Remove Package" and '
            'then reinstall it using the "Install Package" command.\n\nTo '
            'learn how to properly sync packages across different machines, '
            'please visit https://packagecontrol.io/docs/syncing'
        )

    cmd_init()


if sys.version_info < (3,):
    plugin_loaded()


hook_match = re.search(r"<class '(\w+).ExcepthookChain'>", str(sys.excepthook))

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
                'SFTP\n\nAn unexpected error occurred, please submit '
                'the file %s with a Request at https://codexns.io/account' % send_log_path
            )
            sublime.active_window().run_command(
                'open_file',
                {'file': sftp_paths.fix_windows_path(send_log_path)}
            )
        if reloading['happening']:
            if not reloading['shown']:
                sublime.error_message(
                    'SFTP\n\nThe package was just upgraded, please '
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


def plugin_unloaded():
    try:
        SftpThread.cleanup()
    except (NameError):
        pass

    cmd_cleanup()

    ExcepthookChain.remove('sftp_uncaught_except')

if st_version == 2:
    def unload_handler():
        plugin_unloaded()
