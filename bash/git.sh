##################
# Git utilities
###################

alias dotfiles="cd $HOME/work/git/dotfiles"
alias stowfiles="cd $HOME/work/git/stow-dotfiles"

alias gitignore="subl $HOME/work/git/stow-dotfiles/git/.gitignore"

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

alias s="git status"
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
alias ghr="git remote add $@"
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
            gco "$1/$(gb)"
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

# Make a new temp directory, go there, then clone the passed in repo
clonego() {
    if [ "$#" -eq 1 ]; then
        git clone "$1"
        repo_name=$(echo "$1" | sed 's/\.git$//' | sed 's/.*\///')
        cd "$repo_name"
    else
        echo "Usage: clonego <git_repo_url>"
    fi
}
tempclone() {
    tempgo
    clonego $@
}

