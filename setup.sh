# Basic file system setup
cd ~/ && mkdir work && mkdir work/git

# TODO: fill in everything from installing homebrew, etc.

# TODO: Install stuff from cask, ie: brew cask install ksdiff

### STOW ###
stow bash -t ~
rm ~/.zshrc
stow zsh -t ~
stow sublime -t ~/Library/Application\ Support/Sublime\ Text\ 3/
