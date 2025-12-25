#!/bin/bash

###################
# General utilities
###################
#
#
#If you need to have ffmpeg@6 first in your PATH, run:
export PATH="/opt/homebrew/opt/ffmpeg@6/bin:$PATH"

#For compilers to find ffmpeg@6 you may need to set:
  export LDFLAGS="-L/opt/homebrew/opt/ffmpeg@6/lib"
  export CPPFLAGS="-I/opt/homebrew/opt/ffmpeg@6/include"

#For pkg-config to find ffmpeg@6 you may need to set:
  export PKG_CONFIG_PATH="/opt/homebrew/opt/ffmpeg@6/lib/pkgconfig"

alias serveme="python3 -m http.server 9000"

iphonebackups() {
    cd "$HOME/Library/Application Support/MobileSync/Backup"
}

gdrive() {
    cd "$HOME/Google Drive File Stream/My Drive"
}

alias o=open

actuallyrm() {
    /bin/rm "$@"
}

alias subl="/Applications/Sublime\ Text.app/Contents/SharedSupport/bin/subl"

# Moves to trash instead of wiping completely, npm install -g trash-cli
rm() {
    trash "$@"
}
trashcli() {
    npm i -g trash-cli
}
alias trashy=trashcli

rename() {
    for i in $1*
    do
        mv "$i" "${i/$1/$2}"
    done
}

# Remove OS X Terminal logs, see http://osxdaily.com/2010/05/06/speed-up-a-slow-terminal-by-clearing-log-files/
alias wipelogs="sudo rm -rf /private/var/log/asl/*.asl"

alias cpr="cp -r $@"

tarme() {
    tar cf "$1.tar.gz" "$1"
}

untar() {
    for filename in $@; do
        tar xf "$filename"
    done
}

unzipall() {
    unzip '*.zip' -d combinedfolder
}

zipme() {
    zip -r "$1.zip" "$1"
}

zipmeencrypted() {
    echo "$1"
    zip -er "$1.zip" "$1"
}

# long sha to short sha
shortsha() {
    echo "$1" | cut -c1-12
}

alias fixwifi="sudo route -n flush && sudo networksetup -setv4off Wi-Fi && sudo networksetup -setdhcp Wi-Fi"

alias nproc="sysctl -n hw.logicalcpu"

# Cross-platform ~notepad~
alias notepad.exe="vim $@"

# Restart zsh
alias restart="exec zsh"

# Edit this file
alias shakshock="subl $HOME/shak.sh"
alias shh=shakshock
alias gitshock="subl $HOME/git.sh"
alias gitsh=gitshock

# Bicep curls
alias bicep="curl $@"
alias 💪="curl $@"

mkgo() {
    if [ ! -d "$1" ]; then
        mkdir "$1"
    fi
    cd "$1"
}

# depends on "brew install coreutils"
alias readlink=greadlink

###################
# TODO: organize
###################

# Android things
export ANDROID_HOME="$HOME/Android"
export PATH=$PATH:$ANDROID_HOME"/tools":$ANDROID_HOME"/platform-tools"

# Pyenv
export PYENV_ROOT="$HOME/.pyenv"
export PATH=$PYENV_ROOT:$PATH

if which pyenv > /dev/null;
    then eval "$(pyenv init -)";
fi
if which pyenv-virtualenv-init > /dev/null;
    then eval eval "$(pyenv virtualenv-init -)"
fi

# NVM
export NVM_DIR=$HOME/.nvm
# Made this a function so prompt loads 95% faster, actually.
# See: http://github.com/creationix/nvm/issues/539
nvminit() {
    source $(brew --prefix nvm)/nvm.sh
}


# tree command
alias tree="find . -print | sed -e 's;[^/]*/;|____;g;s;____|; |;g'"

alias mvnpkg="mvn package -Dmaven.test.skip=true"


sourcetree() {
    if [ "$#" -eq 0 ]; then
        1="$(pwd)"
    fi
    open -a SourceTree "$1"
}
alias srctree=sourcetree
alias srct=sourcetree

alias stash="cd $HOME/work/bitbucket"
alias bitbucket=stash

pycharm() {
    if [ "$#" -eq 0 ]; then
        1="$(pwd)"
    fi
    open -a Pycharm "$1"
}

intellij() {
    if [ "$#" -eq 0 ]; then
        1="$(pwd)"
    fi
    open -a "IntelliJ IDEA" "$1"
}

timestamp() {
    echo "$(date +%s)"
}

tempgo() {
    mkgo "$HOME"/_temp
    mkgo "$(timestamp)"
}

alias desk="cd $HOME/Desktop"
alias down="cd $HOME/Downloads"

backup() {
    if [ -d "$1" ]; then
        cp -r "$1" "$1.bk"
    else
        cp "$1" "$1.bk"
    fi
}

# Print a random guid
alias guid="uuidgen"
lowerguid() {
    guid | awk '{print tolower($0)}'
}

tableflip() {
    echo "(╯°□°）╯︵ ┻━┻"
}

alias copy="pbcopy"
alias update="omz update && brew update"
alias upgrade="brew upgrade"

# Who has time to type brew cask every time?
alias cask="brew install --cask $@"

# golang
# TODO: add setup for these directories
# TODO: set this up to be a bit more dynamic
export GOPATH=$HOME/work/go
export PATH=$PATH:$GOROOT/bin:$GOPATH/bin
export GOSPLUNKSRC=$GOPATH/src/
alias goroot="cd $GOSPLUNKSRC"
alias gohome=goroot
goclone() {
    if [ "$#" -eq 1 ]; then
        goroot && git clone "$1"
    else
        echo "provide a git repo to clone first"
    fi
}


alias ag="echo \"ag is slow, use rg instead... brew install rg if needed\""

alias duh="du -h"

source $HOME/design.sh
source $HOME/docker.sh
source $HOME/git.sh
# source $HOME/splunk.sh

eval "$(rbenv init - zsh)"

alias noshadow="defaults write com.apple.screencapture disable-shadow -bool true ; killall SystemUIServer"
alias yesshadow="defaults write com.apple.screencapture disable-shadow -bool false ; killall SystemUIServer"

alias pros=processing-java
alias prun="pros $1 --run"
alias pres="pros $1 --present"

alias dropbox="cd $HOME/Dropbox/"
alias drop=dropbox

alias bro=tldr