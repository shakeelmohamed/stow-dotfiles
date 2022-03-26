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

# Splunk SDK release
SDKREL() {
    for filename in $@; do
        md5 "$filename"
        openssl dgst -sha512 "$filename"
        echo ""
    done
}

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