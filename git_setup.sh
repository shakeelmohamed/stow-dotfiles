# Setup git for the first time

gitsetup() {
    echo "WARNING: not checking for existing SSH keys!"

    # Use current branch only when doing git push
    git config --global push.default current

    echo "What's your git name?"
    read GIT_SETUP_NAME -e
    git config --global user.name $GIT_SETUP_NAME

    echo "What's your git email?"
    read GIT_SETUP_EMAIL
    git config --global user.email $GIT_SETUP_EMAIL

    echo "Now configuring SSH keys..."
    ssh-keygen -t rsa -C $GIT_SETUP_EMAIL

    echo "Let's start the ssh-agent..."
    eval "$(ssh-agent -s)"

    echo "Adding SSH key..."
    ssh-add ~/.ssh/id_rsa

    echo "Now copying SSH key to clipboard..."
    pbcopy < ~/.ssh/id_rsa.pub

    # Use the patience algorithm for diffing
    git config --global diff.algorithm patience
}

gitsetup
