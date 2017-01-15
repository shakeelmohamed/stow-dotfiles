# Basic file system setup
mkdir -p $HOME/work/git

# TODO: add ssh setup script from github.com/shakeelmohamed/dotfiles
# TODO: rename that repo to dotfiles-old
# TODO: rename this repo to dotfiles
# TODO: git clone this repo, which becomes...
# git clone git@github.com/shakeelmohamed/dotfiles.git

# Install zsh
sh -c "$(curl -fsSL https://raw.github.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"
stow bash -t $HOME
rm $HOME/.zshrc
stow zsh -t $HOME

# Get the Monokai terminal theme
open ./Monokai.terminal

# Install all homebrew packages
while IFS='' read -r line || [[ -n "$line" ]]; do
    brew install "$line"
done < "./brew.txt"

# Install all cask packages
while IFS='' read -r line || [[ -n "$line" ]]; do
    brew install "$line"
done < "./cask.txt"

# SSH config
stow ssh -t $HOME/

# Node.js setup
nvm install 6
npm install -g trash-cli

# Sublime text configs
stow sublime -t "$HOME/Library/Application Support/Sublime Text 3/"

# bro pages, simpler man pages
gem install bropages
