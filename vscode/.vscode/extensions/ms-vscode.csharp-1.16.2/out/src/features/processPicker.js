"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * See LICENSE.md in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process = require("child_process");
const fs = require("fs-extra");
const os = require("os");
const path = require("path");
const vscode = require("vscode");
const platform_1 = require("../platform");
const common_1 = require("../common");
class AttachPicker {
    constructor(attachItemsProvider) {
        this.attachItemsProvider = attachItemsProvider;
    }
    ShowAttachEntries() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.attachItemsProvider.getAttachItems()
                .then(processEntries => {
                let attachPickOptions = {
                    ignoreFocusOut: true,
                    matchOnDescription: true,
                    matchOnDetail: true,
                    placeHolder: "Select the process to attach to"
                };
                return vscode.window.showQuickPick(processEntries, attachPickOptions)
                    .then(chosenProcess => {
                    return chosenProcess ? chosenProcess.id : null;
                });
            });
        });
    }
}
exports.AttachPicker = AttachPicker;
class RemoteAttachPicker {
    static get commColumnTitle() { return Array(PsOutputParser.secondColumnCharacters).join("a"); }
    static get linuxPsCommand() { return `ps -axww -o pid=,comm=${RemoteAttachPicker.commColumnTitle},args=`; }
    static get osxPsCommand() { return `ps -axww -o pid=,comm=${RemoteAttachPicker.commColumnTitle},args= -c`; }
    static get debuggerCommand() { return "${debuggerCommand}"; }
    static get scriptShellCmd() { return "sh -s"; }
    static ValidateAndFixPipeProgram(program) {
        return __awaiter(this, void 0, void 0, function* () {
            return platform_1.PlatformInformation.GetCurrent().then(platformInfo => {
                // Check if we are on a 64 bit Windows
                if (platformInfo.isWindows() && platformInfo.architecture === "x86_64") {
                    let sysRoot = process.env.SystemRoot;
                    let oldPath = path.join(sysRoot, 'System32');
                    let newPath = path.join(sysRoot, 'sysnative');
                    // Escape backslashes, replace and ignore casing
                    let regex = RegExp(oldPath.replace(/\\/g, '\\\\'), "ig");
                    // Replace System32 with sysnative
                    let newProgram = program.replace(regex, newPath);
                    // Check if program strong contains System32 directory.
                    // And if the program does not exist in System32, but it does in sysnative.
                    // Return sysnative program
                    if (program.toLowerCase().startsWith(oldPath.toLowerCase()) &&
                        !fs.existsSync(program) && fs.existsSync(newProgram)) {
                        return newProgram;
                    }
                }
                // Return original program and let it fall through
                return program;
            });
        });
    }
    // Note: osPlatform is passed as an argument for testing.
    static getPipeTransportOptions(pipeTransport, osPlatform) {
        let pipeProgram = pipeTransport.pipeProgram;
        let pipeArgs = pipeTransport.pipeArgs;
        let pipeCwd = pipeTransport.pipeCwd;
        let quoteArgs = pipeTransport.quoteArgs != null ? pipeTransport.quoteArgs : true; // default value is true
        let platformSpecificPipeTransportOptions = this.getPlatformSpecificPipeTransportOptions(pipeTransport, osPlatform);
        if (platformSpecificPipeTransportOptions) {
            pipeProgram = platformSpecificPipeTransportOptions.pipeProgram || pipeProgram;
            pipeArgs = platformSpecificPipeTransportOptions.pipeArgs || pipeArgs;
            pipeCwd = platformSpecificPipeTransportOptions.pipeCwd || pipeCwd;
            quoteArgs = platformSpecificPipeTransportOptions.quoteArgs != null ? platformSpecificPipeTransportOptions.quoteArgs : quoteArgs;
        }
        return {
            pipeProgram: pipeProgram,
            pipeArgs: pipeArgs,
            pipeCwd: pipeCwd,
            quoteArgs: quoteArgs
        };
    }
    // If the current process is on a current operating system and a specific pipe transport
    // is included, then use that specific pipe transport configuration.
    //
    // Note: osPlatform is passed as an argument for testing.
    static getPlatformSpecificPipeTransportOptions(config, osPlatform) {
        if (osPlatform === "darwin" && config.osx) {
            return config.osx;
        }
        else if (osPlatform === "linux" && config.linux) {
            return config.linux;
        }
        else if (osPlatform === "win32" && config.windows) {
            return config.windows;
        }
        return null;
    }
    // Creates a pipe command string based on the type of pipe args.
    static createPipeCmd(pipeProgram, pipeArgs, quoteArgs) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.ValidateAndFixPipeProgram(pipeProgram).then((fixedPipeProgram) => __awaiter(this, void 0, void 0, function* () {
                if (typeof pipeArgs === "string") {
                    return Promise.resolve(this.createPipeCmdFromString(fixedPipeProgram, pipeArgs, quoteArgs));
                }
                else if (pipeArgs instanceof Array) {
                    return Promise.resolve(this.createPipeCmdFromArray(fixedPipeProgram, pipeArgs, quoteArgs));
                }
                else {
                    // Invalid args type
                    return Promise.reject(new Error("pipeArgs must be a string or a string array type"));
                }
            }));
        });
    }
    static createPipeCmdFromString(pipeProgram, pipeArgs, quoteArgs) {
        // Quote program if quoteArgs is true.
        let pipeCmd = this.quoteArg(pipeProgram);
        // If ${debuggerCommand} exists in pipeArgs, replace. No quoting is applied to the command here.
        if (pipeArgs.indexOf(this.debuggerCommand) >= 0) {
            pipeCmd = pipeCmd.concat(" ", pipeArgs.replace(/\$\{debuggerCommand\}/g, this.scriptShellCmd));
        }
        // Add ${debuggerCommand} to the end of the args. Quote if quoteArgs is true.
        else {
            pipeCmd = pipeCmd.concat(" ", pipeArgs.concat(" ", this.quoteArg(this.scriptShellCmd, quoteArgs)));
        }
        return pipeCmd;
    }
    static createPipeCmdFromArray(pipeProgram, pipeArgs, quoteArgs) {
        let pipeCmdList = [];
        // Add pipeProgram to the start. Quoting is handeled later.
        pipeCmdList.push(pipeProgram);
        // If ${debuggerCommand} exists, replace it.
        if (pipeArgs.filter(arg => arg.indexOf(this.debuggerCommand) >= 0).length > 0) {
            for (let arg of pipeArgs) {
                while (arg.indexOf(this.debuggerCommand) >= 0) {
                    arg = arg.replace(this.debuggerCommand, RemoteAttachPicker.scriptShellCmd);
                }
                pipeCmdList.push(arg);
            }
        }
        // Add ${debuggerCommand} to the end of the arguments.
        else {
            pipeCmdList = pipeCmdList.concat(pipeArgs);
            pipeCmdList.push(this.scriptShellCmd);
        }
        // Quote if enabled.
        return quoteArgs ? this.createArgumentList(pipeCmdList) : pipeCmdList.join(' ');
    }
    // Quote the arg if the flag is enabled and there is a space.
    static quoteArg(arg, quoteArg = true) {
        if (quoteArg && arg.includes(' ')) {
            return `"${arg}"`;
        }
        return arg;
    }
    // Converts an array of string arguments to a string version. Always quotes any arguments with spaces.
    static createArgumentList(args) {
        return args.map(arg => this.quoteArg(arg)).join(" ");
    }
    static ShowAttachEntries(args, platformInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            // Create remote attach output channel for errors.
            if (!RemoteAttachPicker._channel) {
                RemoteAttachPicker._channel = vscode.window.createOutputChannel('remote-attach');
            }
            else {
                RemoteAttachPicker._channel.clear();
            }
            // Grab selected name from UI
            // Args may be null if ran with F1
            let name = args ? args.name : null;
            if (!name) {
                // Config name not found. 
                return Promise.reject(new Error("Name not defined in current configuration."));
            }
            if (!args.pipeTransport || !args.pipeTransport.debuggerPath) {
                // Missing PipeTransport and debuggerPath, prompt if user wanted to just do local attach.
                return Promise.reject(new Error("Configuration \"" + name + "\" in launch.json does not have a " +
                    "pipeTransport argument with debuggerPath for pickRemoteProcess. Use pickProcess for local attach."));
            }
            else {
                let pipeTransport = this.getPipeTransportOptions(args.pipeTransport, os.platform());
                return RemoteAttachPicker.createPipeCmd(pipeTransport.pipeProgram, pipeTransport.pipeArgs, pipeTransport.quoteArgs)
                    .then((pipeCmd) => __awaiter(this, void 0, void 0, function* () { return RemoteAttachPicker.getRemoteOSAndProcesses(pipeCmd, pipeTransport.pipeCwd, platformInfo); }))
                    .then(processes => {
                    let attachPickOptions = {
                        ignoreFocusOut: true,
                        matchOnDescription: true,
                        matchOnDetail: true,
                        placeHolder: "Select the process to attach to"
                    };
                    return vscode.window.showQuickPick(processes, attachPickOptions);
                })
                    .then(item => { return item ? item.id : Promise.reject(new Error("Could not find a process id to attach.")); });
            }
        });
    }
    static getRemoteOSAndProcesses(pipeCmd, pipeCwd, platformInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            const scriptPath = path.join(common_1.getExtensionPath(), 'scripts', 'remoteProcessPickerScript');
            return execChildProcessAndOutputErrorToChannel(`${pipeCmd} < ${scriptPath}`, pipeCwd, RemoteAttachPicker._channel, platformInfo).then(output => {
                // OS will be on first line
                // Processess will follow if listed
                let lines = output.split(/\r?\n/);
                if (lines.length == 0) {
                    return Promise.reject(new Error("Pipe transport failed to get OS and processes."));
                }
                else {
                    let remoteOS = lines[0].replace(/[\r\n]+/g, '');
                    if (remoteOS != "Linux" && remoteOS != "Darwin") {
                        return Promise.reject(new Error(`Operating system "${remoteOS}"" not supported.`));
                    }
                    // Only got OS from uname
                    if (lines.length == 1) {
                        return Promise.reject(new Error("Transport attach could not obtain processes list."));
                    }
                    else {
                        let processes = lines.slice(1);
                        return sortProcessEntries(PsOutputParser.parseProcessFromPsArray(processes), remoteOS);
                    }
                }
            });
        });
    }
}
RemoteAttachPicker._channel = null;
exports.RemoteAttachPicker = RemoteAttachPicker;
class Process {
    constructor(name, pid, commandLine) {
        this.name = name;
        this.pid = pid;
        this.commandLine = commandLine;
    }
    toAttachItem() {
        return {
            label: this.name,
            description: this.pid,
            detail: this.commandLine,
            id: this.pid
        };
    }
}
class DotNetAttachItemsProviderFactory {
    static Get() {
        if (os.platform() === 'win32') {
            return new WmicAttachItemsProvider();
        }
        else {
            return new PsAttachItemsProvider();
        }
    }
}
exports.DotNetAttachItemsProviderFactory = DotNetAttachItemsProviderFactory;
class DotNetAttachItemsProvider {
    getAttachItems() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getInternalProcessEntries().then(processEntries => {
                return sortProcessEntries(processEntries, os.platform());
            });
        });
    }
}
function sortProcessEntries(processEntries, osPlatform) {
    // localeCompare is significantly slower than < and > (2000 ms vs 80 ms for 10,000 elements)
    // We can change to localeCompare if this becomes an issue
    let dotnetProcessName = (osPlatform === 'win32') ? 'dotnet.exe' : 'dotnet';
    processEntries = processEntries.sort((a, b) => {
        if (a.name.toLowerCase() === dotnetProcessName && b.name.toLowerCase() === dotnetProcessName) {
            return a.commandLine.toLowerCase() < b.commandLine.toLowerCase() ? -1 : 1;
        }
        else if (a.name.toLowerCase() === dotnetProcessName) {
            return -1;
        }
        else if (b.name.toLowerCase() === dotnetProcessName) {
            return 1;
        }
        else {
            return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
        }
    });
    let attachItems = processEntries.map(p => p.toAttachItem());
    return attachItems;
}
class PsAttachItemsProvider extends DotNetAttachItemsProvider {
    getInternalProcessEntries() {
        return __awaiter(this, void 0, void 0, function* () {
            // the BSD version of ps uses '-c' to have 'comm' only output the executable name and not
            // the full path. The Linux version of ps has 'comm' to only display the name of the executable
            // Note that comm on Linux systems is truncated to 16 characters:
            // https://bugzilla.redhat.com/show_bug.cgi?id=429565
            // Since 'args' contains the full path to the executable, even if truncated, searching will work as desired.
            const psCommand = os.platform() === 'darwin' ? RemoteAttachPicker.osxPsCommand : RemoteAttachPicker.linuxPsCommand;
            return execChildProcess(psCommand, null).then(processes => {
                return PsOutputParser.parseProcessFromPs(processes);
            });
        });
    }
}
exports.PsAttachItemsProvider = PsAttachItemsProvider;
class PsOutputParser {
    // Perf numbers:
    // OS X 10.10
    // | # of processes | Time (ms) |
    // |----------------+-----------|
    // |            272 |        52 |
    // |            296 |        49 |
    // |            384 |        53 |
    // |            784 |       116 |
    //
    // Ubuntu 16.04
    // | # of processes | Time (ms) |
    // |----------------+-----------|
    // |            232 |        26 |
    // |            336 |        34 |
    // |            736 |        62 |
    // |           1039 |       115 |
    // |           1239 |       182 |
    // ps outputs as a table. With the option "ww", ps will use as much width as necessary.
    // However, that only applies to the right-most column. Here we use a hack of setting
    // the column header to 50 a's so that the second column will have at least that many
    // characters. 50 was chosen because that's the maximum length of a "label" in the
    // QuickPick UI in VSCode.
    static get secondColumnCharacters() { return 50; }
    // Only public for tests.
    static parseProcessFromPs(processes) {
        let lines = processes.split(os.EOL);
        let processEntries = [];
        // lines[0] is the header of the table
        for (let i = 1; i < lines.length; i++) {
            let line = lines[i];
            if (!line) {
                continue;
            }
            let process = this.parseLineFromPs(line);
            if (process) {
                processEntries.push(process);
            }
        }
        return processEntries;
    }
    static parseProcessFromPsArray(lines) {
        let processEntries = [];
        // lines[0] is the header of the table
        for (let i = 1; i < lines.length; i++) {
            let line = lines[i];
            if (!line) {
                continue;
            }
            let process = this.parseLineFromPs(line);
            if (process) {
                processEntries.push(process);
            }
        }
        return processEntries;
    }
    static parseLineFromPs(line) {
        // Explanation of the regex:
        //   - any leading whitespace
        //   - PID
        //   - whitespace
        //   - executable name --> this is PsAttachItemsProvider.secondColumnCharacters - 1 because ps reserves one character
        //     for the whitespace separator
        //   - whitespace
        //   - args (might be empty)
        const psEntry = new RegExp(`^\\s*([0-9]+)\\s+(.{${PsOutputParser.secondColumnCharacters - 1}})\\s+(.*)$`);
        const matches = psEntry.exec(line);
        if (matches && matches.length === 4) {
            const pid = matches[1].trim();
            const executable = matches[2].trim();
            const cmdline = matches[3].trim();
            return new Process(executable, pid, cmdline);
        }
    }
}
exports.PsOutputParser = PsOutputParser;
class WmicAttachItemsProvider extends DotNetAttachItemsProvider {
    getInternalProcessEntries() {
        return __awaiter(this, void 0, void 0, function* () {
            const wmicCommand = 'wmic process get Name,ProcessId,CommandLine /FORMAT:list';
            return execChildProcess(wmicCommand, null).then(processes => {
                return WmicOutputParser.parseProcessFromWmic(processes);
            });
        });
    }
}
exports.WmicAttachItemsProvider = WmicAttachItemsProvider;
class WmicOutputParser {
    // Perf numbers on Win10:
    // | # of processes | Time (ms) |
    // |----------------+-----------|
    // |            309 |       413 |
    // |            407 |       463 |
    // |            887 |       746 |
    // |           1308 |      1132 |
    static get wmicNameTitle() { return 'Name'; }
    static get wmicCommandLineTitle() { return 'CommandLine'; }
    static get wmicPidTitle() { return 'ProcessId'; }
    // Only public for tests.
    static parseProcessFromWmic(processes) {
        let lines = processes.split(os.EOL);
        let currentProcess = new Process(null, null, null);
        let processEntries = [];
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            if (!line) {
                continue;
            }
            this.parseLineFromWmic(line, currentProcess);
            // Each entry of processes has ProcessId as the last line
            if (line.startsWith(WmicOutputParser.wmicPidTitle)) {
                processEntries.push(currentProcess);
                currentProcess = new Process(null, null, null);
            }
        }
        return processEntries;
    }
    static parseLineFromWmic(line, process) {
        let splitter = line.indexOf('=');
        if (splitter >= 0) {
            let key = line.slice(0, line.indexOf('='));
            let value = line.slice(line.indexOf('=') + 1);
            if (key === WmicOutputParser.wmicNameTitle) {
                process.name = value.trim();
            }
            else if (key === WmicOutputParser.wmicPidTitle) {
                process.pid = value.trim();
            }
            else if (key === WmicOutputParser.wmicCommandLineTitle) {
                const extendedLengthPath = '\\??\\';
                if (value.startsWith(extendedLengthPath)) {
                    value = value.slice(extendedLengthPath.length).trim();
                }
                process.commandLine = value.trim();
            }
        }
    }
}
exports.WmicOutputParser = WmicOutputParser;
function execChildProcess(process, workingDirectory) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            child_process.exec(process, { cwd: workingDirectory, maxBuffer: 500 * 1024 }, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                    return;
                }
                if (stderr && stderr.length > 0) {
                    reject(new Error(stderr));
                    return;
                }
                resolve(stdout);
            });
        });
    });
}
// VSCode cannot find the path "c:\windows\system32\bash.exe" as bash.exe is only available on 64bit OS.
// It can be invoked from "c:\windows\sysnative\bash.exe", so adding "c:\windows\sysnative" to path if we identify
// VSCode is running in windows and doesn't have it in the path.
function GetSysNativePathIfNeeded(platformInfo) {
    return __awaiter(this, void 0, void 0, function* () {
        let env = process.env;
        if (platformInfo.isWindows() && platformInfo.architecture === "x86_64") {
            let sysnative = process.env.WINDIR + "\\sysnative";
            env.Path = process.env.PATH + ";" + sysnative;
        }
        return env;
    });
}
function execChildProcessAndOutputErrorToChannel(process, workingDirectory, channel, platformInfo) {
    return __awaiter(this, void 0, void 0, function* () {
        channel.appendLine(`Executing: ${process}`);
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            return GetSysNativePathIfNeeded(platformInfo).then(newEnv => {
                child_process.exec(process, { cwd: workingDirectory, env: newEnv, maxBuffer: 500 * 1024 }, (error, stdout, stderr) => {
                    let channelOutput = "";
                    if (stdout && stdout.length > 0) {
                        channelOutput = channelOutput.concat(stdout);
                    }
                    if (stderr && stderr.length > 0) {
                        channelOutput = channelOutput.concat("stderr: " + stderr);
                    }
                    if (error) {
                        channelOutput = channelOutput.concat("Error Message: " + error.message);
                    }
                    if (error || (stderr && stderr.length > 0)) {
                        channel.append(channelOutput);
                        channel.show();
                        reject(new Error("See remote-attach output"));
                        return;
                    }
                    resolve(stdout);
                });
            });
        }));
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvY2Vzc1BpY2tlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9mZWF0dXJlcy9wcm9jZXNzUGlja2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7Ozs7Ozs7OztBQUVoRywrQ0FBK0M7QUFDL0MsK0JBQStCO0FBQy9CLHlCQUF5QjtBQUN6Qiw2QkFBNkI7QUFDN0IsaUNBQWlDO0FBRWpDLDBDQUFrRDtBQUNsRCxzQ0FBNkM7QUFVN0M7SUFDSSxZQUFvQixtQkFBd0M7UUFBeEMsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFxQjtJQUFJLENBQUM7SUFFcEQsaUJBQWlCOztZQUMxQixPQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxjQUFjLEVBQUU7aUJBQzNDLElBQUksQ0FBQyxjQUFjLENBQUMsRUFBRTtnQkFDbkIsSUFBSSxpQkFBaUIsR0FBNEI7b0JBQzdDLGNBQWMsRUFBRSxJQUFJO29CQUNwQixrQkFBa0IsRUFBRSxJQUFJO29CQUN4QixhQUFhLEVBQUUsSUFBSTtvQkFDbkIsV0FBVyxFQUFFLGlDQUFpQztpQkFDakQsQ0FBQztnQkFFRixPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLGNBQWMsRUFBRSxpQkFBaUIsQ0FBQztxQkFDaEUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFO29CQUNsQixPQUFPLGFBQWEsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO2dCQUNuRCxDQUFDLENBQUMsQ0FBQztZQUNYLENBQUMsQ0FBQyxDQUFDO1FBQ1gsQ0FBQztLQUFBO0NBQ0o7QUFuQkQsb0NBbUJDO0FBU0Q7SUFDVyxNQUFNLEtBQUssZUFBZSxLQUFLLE9BQU8sS0FBSyxDQUFDLGNBQWMsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDL0YsTUFBTSxLQUFLLGNBQWMs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