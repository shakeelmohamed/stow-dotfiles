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
        let quoteArgs = pipeTransport.quoteArgs != null ? pipeTransport.quoteArgs : true; // default value is true
        let platformSpecificPipeTransportOptions = this.getPlatformSpecificPipeTransportOptions(pipeTransport, osPlatform);
        if (platformSpecificPipeTransportOptions) {
            pipeProgram = platformSpecificPipeTransportOptions.pipeProgram || pipeProgram;
            pipeArgs = platformSpecificPipeTransportOptions.pipeArgs || pipeArgs;
            quoteArgs = platformSpecificPipeTransportOptions.quoteArgs != null ? platformSpecificPipeTransportOptions.quoteArgs : quoteArgs;
        }
        return {
            pipeProgram: pipeProgram,
            pipeArgs: pipeArgs,
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
                    .then((pipeCmd) => __awaiter(this, void 0, void 0, function* () { return RemoteAttachPicker.getRemoteOSAndProcesses(pipeCmd, platformInfo); }))
                    .then(processes => {
                    let attachPickOptions = {
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
    static getRemoteOSAndProcesses(pipeCmd, platformInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            const scriptPath = path.join(common_1.getExtensionPath(), 'scripts', 'remoteProcessPickerScript');
            return execChildProcessAndOutputErrorToChannel(`${pipeCmd} < ${scriptPath}`, null, RemoteAttachPicker._channel, platformInfo).then(output => {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvY2Vzc1BpY2tlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9mZWF0dXJlcy9wcm9jZXNzUGlja2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7Ozs7Ozs7OztBQUVoRywrQ0FBK0M7QUFDL0MsK0JBQStCO0FBQy9CLHlCQUF5QjtBQUN6Qiw2QkFBNkI7QUFDN0IsaUNBQWlDO0FBRWpDLDBDQUFrRDtBQUNsRCxzQ0FBNkM7QUFVN0M7SUFDSSxZQUFvQixtQkFBd0M7UUFBeEMsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFxQjtJQUFJLENBQUM7SUFFcEQsaUJBQWlCOztZQUMxQixPQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxjQUFjLEVBQUU7aUJBQzNDLElBQUksQ0FBQyxjQUFjLENBQUMsRUFBRTtnQkFDbkIsSUFBSSxpQkFBaUIsR0FBNEI7b0JBQzdDLGtCQUFrQixFQUFFLElBQUk7b0JBQ3hCLGFBQWEsRUFBRSxJQUFJO29CQUNuQixXQUFXLEVBQUUsaUNBQWlDO2lCQUNqRCxDQUFDO2dCQUVGLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsY0FBYyxFQUFFLGlCQUFpQixDQUFDO3FCQUNoRSxJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUU7b0JBQ2xCLE9BQU8sYUFBYSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBQ25ELENBQUMsQ0FBQyxDQUFDO1lBQ1gsQ0FBQyxDQUFDLENBQUM7UUFDWCxDQUFDO0tBQUE7Q0FDSjtBQWxCRCxvQ0FrQkM7QUFRRDtJQUNXLE1BQU0sS0FBSyxlQUFlLEtBQUssT0FBTyxLQUFLLENBQUMsY0FBYyxDQUFDLHNCQUFzQixDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMvRixNQUFNLEtBQUssY0FBYyxLQUFLLE9BQU8seUJBQXlCLGtCQUFr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