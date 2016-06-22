# Basic file system setup
cd $HOME/ && mkdir work && mkdir work/git

# TODO: fill in everything from installing homebrew, etc.

# TODO: Install stuff from cask, ie: brew cask install ksdiff

### STOW ###
stow bash -t $HOME
rm $HOME/.zshrc
stow zsh -t $HOME
stow sublime -t "$HOME/Library/Application\ Support/Sublime\ Text\ 3/"
stow ssh -t $HOME/
