# vscode-nuget-package-manager

An extension for Visual Studio Code that lets you easily add or remove 
.NET Core 1.1+ package references to/from your project's `.csproj` or `.fsproj`
files using Code's Command Palette.

## Features

- Search the NuGet package repository for packages using either (partial
or full) package name or another search term.
- Add PackageReference dependencies to your .NET Core 1.1+ `.csproj` or
`.fsproj` files from Visual Studio Code's Command Palette.
- Remove installed packages from your project's `.csproj` or `.fsproj` files via
Visual Studio Code's Command Palette.
- Handles workspaces with multiple `.csproj` or `.fsproj` files as well as
workspaces with single `.csproj`/`.fsproj` files.

*Adding a Package:*

![Adding a Package](https://github.com/jmrog/vscode-nuget-package-manager/raw/master/images/add-package.gif)

*Removing a Package:*

![Removing a Package](https://github.com/jmrog/vscode-nuget-package-manager/raw/master/images/remove-package.gif)

## Known Issues

- The XML-to-JavaScript parser that this extension uses currently strips out
comments from the project file. Unfortunately, there is no way around this
at the moment, but the eventual plan is to replace this dependency.
- The extension does not add DotNetCliToolsReference entries for tools.

## Release Notes

## 1.1.6
- Allow self-signed certificates for requests when http.proxyStrictSSL is false (closes #24)

## 1.1.5
- Cross-platform team development aid: don't add or remove XML declarations to/from first line of project files (closes #29)

### 1.1.4
- Respect http.proxyStrictSSL setting

### 1.1.3
- Support for http proxy settings (closes #18)

### 1.1.2
- Handle case where XML parser passes null to callback (closes #16)

### 1.1.1
- Fix bug with file search traversing deeply through node_modules (if present)

### 1.1.0
- Add F#/.fsproj support

### 1.0.1, 1.0.2
- Changes to README to remove leftover stuff (whoops)

### 1.0.0
- Refactored to now handle workspaces containing multiple `.csproj` files 
(closes #10, closes #12)
- Adds a number of tests and automated steps to build/test process (closes #7,
closes #1)

### 0.1.1
- Update preview images (and show both add and remove; closes #11)

### 0.1.0
- The "I'm a Dummy and Accidentally Typed 'Minor' Instead of 'Patch' When Publishing"
release. 
- No actual changes; this is identical to v0.0.4, but VS Code won't let me unpublish
specific versions and I initially typo'd the release number. :(

### 0.0.4
- Updated "Known Issues" to mention #9, which seems important

### 0.0.3
- Add PackageReference even if no PackageReference section already exists (closes #5)
- Add ItemGroup if no ItemGroup is found in project file
- Add tests for some operations (partial progress on #1)

### 0.0.2
- Remove `getQueryString` utility and use Node's querystring module
- Add slightly better error handling in Promise chain
- Update versioning; vsce only allows x.x.x

### 0.0.1-alpha

Initial release.

