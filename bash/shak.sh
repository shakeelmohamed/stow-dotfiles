echo "Shak shock."

# Cross-platform notepad
alias notepad.exe="vim $@"

# Restart zsh
alias restart="exec zsh"

# Edit this file
alias shakshock="subl ~/shak.sh"

alias dotfiles="cd ~/work/git/dotfiles"

# alias for cd-ing to git dir
alias gitgit="cd ~/work/git"

# clear git cache
alias gitclear="git rm -r --cached ."

alias gs="git status"
alias gdt="git difftool $@"

gitslurp() {
    if [ "$#" -eq 0 ]; then
        1="$(git rev-parse --abbrev-ref HEAD)"
    fi

    if [ "$#" -eq 1 ]; then
        git branch --set-upstream-to="origin/$1" $1
    else
        git branch --set-upstream-to="$1/$2" $2
    fi
}

# Moves to trash instead of wiping completely, npm install -g trash-cli
function rm() {
    trash $@
}

# Java env
# export JAVA_HOME="/System/Library/Frameworks/JavaVM.framework/Versions/1.6/Home"

# Splunk things
alias splgo="open http://localhost:8000"

export splunks=$HOME/work/splunks

alias spls="ls ~/work/splunks"

splunk_version_file=~/splunkver
SPLUNK_VERSION_CMD()
{
    if [ "$#" -ne 1 ]; then
        cat $splunk_version_file
    else
        echo $1 > $splunk_version_file
        SPLUNK_VERSION_CMD
        restart
    fi
}
alias splver=SPLUNK_VERSION_CMD

SPLUNK_HOME_BASE=~/work/splunks/
SPLUNK_VERSION_STR=$(splver)

# export SPLUNK_HOME=$SPLUNK_HOME_BASE$SPLUNK_VERSION_STR

## MANUALLY OVERRIDE SPLUNK_HOME FOR CORE
export SPLUNK_HOME="$HOME/work/splunks/core"

# Alias to do something with splunk
SPLUNKCMD() {
    $SPLUNK_HOME/bin/splunk $@
}
alias SPLUNK=SPLUNKCMD

alias splunkrc="subl ~/.splunkrc"

alias spl="echo $SPLUNK_HOME"


# Sublime text!
alias subl="/Applications/Sublime\ Text.app/Contents/SharedSupport/bin/subl"

# Android things
export ANDROID_HOME="/Users/smohamed/Android"
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
export NVM_DIR=~/.nvm
source $(brew --prefix nvm)/nvm.sh

# tree command
alias tree="find . -print | sed -e 's;[^/]*/;|____;g;s;____|; |;g'"

alias mvnpkg="mvn package -Dmaven.test.skip=true"

mkgo() {
    mkdir $1 && cd $1
}
# Strange hack for docker
$(boot2docker shellinit 2> /dev/null)

# Upload a Splunk app: splapp user password host path-to-app
splapp() {
    if [ "$#" -lt 4 ]; then
        echo "Usage: splapp user password host path-to-app"
    else
        curl -k -u $1:$2 "https://$3:8089/services/apps/appinstall" -d "name=$4" "${@:5}"
    fi
}

export PATH="/Users/smohamed/.phpenv/bin:$PATH"
eval "$(phpenv init -)"

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

alias stash="cd ~/work/stash"

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
# phpenv
export PATH="/Users/smohamed/.phpenv/bin:$PATH"
eval "$(phpenv init -)"

export SELENIUM="$HOME/selenium-server-standalone-2.48.2.jar"

export RPI_MEDIA="$HOME/desktop/videos"