#!/bin/bash

###################
# General utilities
###################

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

# Moves to trash instead of wiping completely, npm install -g trash-cli
rm() {
    trash "$@"
}
trashcli() {
    npm i -g trash-cli
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

# Cross-platform notepad
alias notepad.exe="vim $@"

# Restart zsh
alias restart="exec zsh"

# Edit this file
alias shakshock="subl $HOME/shak.sh"

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
# Git utilities
###################

alias dotfiles="cd $HOME/work/git/dotfiles"
alias stowfiles="cd $HOME/work/git/stow-dotfiles"

# alias for cd-ing to git dir
alias gitgit="cd $HOME/work/git"
alias gogit="gitgit"
alias gitit="gitgit"
alias ggit="gitgit"
alias gau="git add -u $@"

gitback() {
    echo "Don't even think about it."
}

# clear git cache
alias gitclear="git rm -r --cached ."
alias gitclean="git clean -dfxn" # dry run

gclone() {
    cd "$HOME"/work/git
    git clone "$@"
    repo_name=$(echo "$1" | sed 's/\.git$//' | sed 's/.*\///')
    cd "$repo_name"
}

stashclone() {
    cd "$HOME"/work/bitbucket
    git clone "$@"
    repo_name=$(echo "$1" | sed 's/\.git$//' | sed 's/.*\///')
    cd "$repo_name"
}
alias bbclone=stashclone

alias gs="git status"
alias gdt="git difftool $@"
alias gdc="git diff --cached $@"
alias gb="git rev-parse --abbrev-ref HEAD"
alias glong="git rev-parse HEAD"
alias gsha="glong | cut -c 1-12"
alias githash="gsha"
alias gf="git fetch"
alias gfa="git fetch --all"
alias gfp="git fetch --prune"
alias gdp="git diff -p"
alias gpa="git pull --all"
alias gitpeek="git show HEAD@{1}" # See 1 git commit in the future
alias gshow="git show $@"
alias gitgui="git gui $@"
alias p="git pull $@"


# Quickly change git editors. Subl for rebasing, vim for normal stuff
gitsubl() {
    git config --global core.editor "subl -n -w"
}
gitvim() {
    git config --global core.editor "vim"
}

git config --global diff.tool Kaleidoscope

gityank() {
    if [ "$#" -eq 0 ]; then
        gityank $(gb)
    elif [ "$#" -eq 1 ]; then
        git branch --set-upstream-to="origin/$1" "$1"
    else
        git branch --set-upstream-to="$1/$2" "$2"
    fi
}

export ghuser="shakeelmohamed"

ghfork() {
    echo "Trying to checkout a fork for $1"

    if [ "$#" -eq 1 ]; then
        remote="git@github.com:$1/$(basename $(pwd)).git"
        echo "\tremote: $remote"
        git remote add "$1" "$remote"
        git fetch "$1"
        if [ "$#" -eq 1 ]; then
            gco "$1/master"
        else
            gco "$1/$2"
        fi
    else
        echo "No GitHub username provided"
    fi
}

alias myfork="ghfork $ghuser"

gitmergeto() {
    cur="$(gb)"
    if [ "$#" -eq 1 ]; then
        gfp && git pull && gco "$1" && git pull && git merge "$cur"
    else
        echo "gitmergeto needs 1 argument, the branch to merge to"
    fi
}

###################
# Splunk utilities
###################
alias splgo="open http://localhost:8000"

# support MacOS High Sierra
export OPTIMISTIC_ABOUT_FILE_LOCKING=1


SPLUNKS_LOCATION=$HOME/work/splunks

alias splunks="cd $SPLUNKS_LOCATION"

alias spls="ls $SPLUNKS_LOCATION"

splunk_version_file=$HOME/splunkver
SPLUNK_VERSION_CMD() {
    touch "$splunk_version_file"
    if [ "$#" -ne 1 ]; then
        cat "$splunk_version_file"
    else
        echo "$1" > "$splunk_version_file"
        SPLUNK_VERSION_CMD
        restart
    fi
}
alias splver=SPLUNK_VERSION_CMD

SPLUNK_HOME_BASE=$HOME/work/splunks/
SPLUNK_VERSION_STR=$(splver)

export SPLUNK_HOME=$SPLUNK_HOME_BASE$SPLUNK_VERSION_STR

## MANUALLY OVERRIDE SPLUNK_HOME FOR CORE
# export SPLUNK_HOME="$HOME/work/splunks/core"

# Alias to do something with splunk
SPLUNKCMD() {
    "$SPLUNK_HOME"/bin/splunk "$@"
}
alias SPLUNK=SPLUNKCMD

alias splunkrc="subl $HOME/.splunkrc"

alias spl="echo $SPLUNK_HOME"

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

# Splunk SDK release
SDKREL() {
    for filename in $@; do
        md5 "$filename"
        openssl dgst -sha512 "$filename"
        echo ""
    done
}

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

# Upload a Splunk app: splapp user password host path-to-app
splapp() {
    if [ "$#" -lt 4 ]; then
        echo "Usage: splapp user password host path-to-app"
    else
        curl -k -u "$1":"$2" "https://$3:8089/services/apps/appinstall" -d "name=$4" "${@:5}"
    fi
}

DELETEMYSPLUNKEVENTS() {
    if [ "$#" -eq 0 ]; then
        1="admin"
        2="1"
    fi
    curl -k -u "$1":"$2" https://localhost:8089/services/search/jobs --data search="search * | delete"
}


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

# Make a new temp directory, go there, then clone the passed in repo
clonego() {
    if [ "$#" -eq 1 ]; then
        tempgo
        git clone "$1"
        cd *
    else
        echo "Usage: clonego <github_repo_url>"
    fi
}
alias tempclone=clonego

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
alias update="upgrade_oh_my_zsh"

# Who has time to type brew cask every time?
alias cask="brew cask $@"

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

dockerclean() {
    docker system prune --volumes -f
    docker rmi -f $(docker images)
}

dockerkill() {
    docker kill $(docker ps -q)
}

alias jb="jirabrancher"

alias gitignore="subl $HOME/work/git/stow-dotfiles/git/.gitignore"

alias ag="echo \"ag is slow, use rg instead... brew install rg if needed\""

alias duh="du -h"

alias cci="circleci"
alias k="kubectl"

export SIMDATA_JAR="$HOME/work/git/simdata/build/libs/simdata-1.0.1.jar"

source $HOME/design.sh