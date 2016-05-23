echo "Shak shock."

actuallyrm() {
    rm $@
}

# Moves to trash instead of wiping completely, npm install -g trash-cli
rm() {
    trash $@
}

alias cpr="cp -r $@"

tarme() {
    tar cf "$1.tar.gz" "$1"
}

untar() {
    for filename in $@; do
        tar xf $filename
    done
}

zipme() {
    zip -r "$1.zip" "$1"
}

zipmeencrypted() {
    zip -er "$1.zip" "$1"
}

# Cross-platform notepad
alias notepad.exe="vim $@"

# Restart zsh
alias restart="exec zsh"

# Edit this file
alias shakshock="subl $HOME/shak.sh"

alias dotfiles="cd $HOME/work/git/dotfiles"
alias stowfiles="cd $HOME/work/git/stow-dotfiles"

# alias for cd-ing to git dir
alias gitgit="cd $HOME/work/git"

# clear git cache
alias gitclear="git rm -r --cached ."

alias gitclone="cd $HOME/work/git && git clone $@"

alias gs="git status"
alias gdt="git difftool $@"
alias gdc="git diff --cached $@"
alias gb="git rev-parse --abbrev-ref HEAD"
alias gf="git fetch"
alias gfa="git fetch --all"
alias gfp="git fetch --prune"
# See 1 git commit in the future
alias gitpeek="git show HEAD@{1}"
alias gshow="git show --pretty=full $@"
alias gitgui="git gui $@"

# Quickly change git editors. Subl for rebasing, vim for normal stuff
gitsubl() {
    git config --global core.editor "subl -n -w"
}
gitvim() {
    git config --global core.editor "vim"
}

# TODO: move to git setup
git config --global rerere.enabled true
git config --global diff.tool Kaleidoscope

gityank() {
    if [ "$#" -eq 0 ]; then
        1="$(gb)"
    elif [ "$#" -eq 1 ]; then
        git branch --set-upstream-to="origin/$1" $1
    else
        git branch --set-upstream-to="$1/$2" $2
    fi
}

# Java env
# export JAVA_HOME="/System/Library/Frameworks/JavaVM.framework/Versions/1.6/Home"

# Splunk things
alias splgo="open http://localhost:8000"

SPLUNKS_LOCATION=$HOME/work/splunks

alias splunks="cd $SPLUNKS_LOCATION"

alias spls="ls $SPLUNKS_LOCATION"

splunk_version_file=$HOME/splunkver
SPLUNK_VERSION_CMD()
{
    touch $splunk_version_file
    if [ "$#" -ne 1 ]; then
        cat $splunk_version_file
    else
        echo $1 > $splunk_version_file
        SPLUNK_VERSION_CMD
        restart
    fi
}
alias splver=SPLUNK_VERSION_CMD

SPLUNK_HOME_BASE=$HOME/work/splunks/
SPLUNK_VERSION_STR=$(splver)

# export SPLUNK_HOME=$SPLUNK_HOME_BASE$SPLUNK_VERSION_STR

## MANUALLY OVERRIDE SPLUNK_HOME FOR CORE
export SPLUNK_HOME="$HOME/work/splunks/core"

# Alias to do something with splunk
SPLUNKCMD() {
    $SPLUNK_HOME/bin/splunk $@
}
alias SPLUNK=SPLUNKCMD

alias splunkrc="subl $HOME/.splunkrc"

alias spl="echo $SPLUNK_HOME"


# Sublime text!
# TODO: add a step in setup script to symlink this
#ln -s "/Applications/Sublime Text.app/Contents/SharedSupport/bin/subl" ~/bin/subl
# alias subl="/Applications/Sublime\ Text.app/Contents/SharedSupport/bin/subl"

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
        md5 $filename
        openssl dgst -sha512 $filename
        echo ""
    done
}

# NVM
export NVM_DIR=$HOME/.nvm
source $(brew --prefix nvm)/nvm.sh

# tree command
alias tree="find . -print | sed -e 's;[^/]*/;|____;g;s;____|; |;g'"

alias mvnpkg="mvn package -Dmaven.test.skip=true"

mkgo() {
    if [ ! -d "$1" ]; then
        mkdir $1
    fi
    cd $1
}

# Upload a Splunk app: splapp user password host path-to-app
splapp() {
    if [ "$#" -lt 4 ]; then
        echo "Usage: splapp user password host path-to-app"
    else
        curl -k -u $1:$2 "https://$3:8089/services/apps/appinstall" -d "name=$4" "${@:5}"
    fi
}

DELETEMYSPLUNKEVENTS() {
    if [ "$#" -eq 0 ]; then
        1="admin"
        2="1"
    fi
    curl -k -u $1:$2 https://localhost:8089/services/search/jobs --data search="search * | delete"
}


sourcetree() {
    if [ "$#" -eq 0 ]; then
        1="$(pwd)"
    fi
    open -a SourceTree $1
}
alias srctree=sourcetree
alias srct=sourcetree

alias stash="cd $HOME/work/stash"

pycharm() {
    if [ "$#" -eq 0 ]; then
        1="$(pwd)"
    fi
    open -a Pycharm $1
}

intellij() {
    if [ "$#" -eq 0 ]; then
        1="$(pwd)"
    fi
    open -a "IntelliJ IDEA 14 CE" $1
}

export RPI_MEDIA="$HOME/desktop/videos"

timestamp() {
    echo "$(date +%s)"
}

tempgo() {
    mkgo $HOME/_temp
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

alias virus.exe="open $HOME/RemoveSymantecMacFiles/RemoveSymantecMacFiles.command"

alias desk="cd $HOME/Desktop"

# This is not the Jeep you're looking for
export WRANGLER_HOME="$HOME/wrangler"

backup() {
    if [ -d "$1" ]; then
        cp -r "$1" "$1-backup"
    else
        cp "$1" "$1-backup"
    fi
}

# Print a random guid
alias guid=uuidgen

function tableflip(){
    echo "(╯°□°）╯︵ ┻━┻"
}

alias copy=pbcopy
alias update=upgrade_oh_my_zsh

# Who has time to type brew cask every time?
alias cask="brew cask $@"


