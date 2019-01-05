# DOT FILES SETUP (1/2)
export DOTFILES_DIR=$HOME/.dotfiles
git clone git@github.com:adrianogil/dotfiles.git $DOTFILES_DIR

cd $DOTFILES_DIR
./create_symlinks.sh

# GIL TOOLS SETUP
GILTOOLS_DIR=$HOME/workspace/scripts/gil-tools
mkdir -p $HOME/workspace/scripts
git clone git@github.com:adrianogil/gil-tools.git $GILTOOLS_DIR

pkg install python2 -y
pkg install tmux -y

source $HOME/.bashrc

cd $GILTOOLS_DIR/src
source $HOME/.bashrc

# Finish DOT FILES SETUP (2/2)
cd $DOTFILES_DIR
python2 $GILTOOLS_DIR/src/python/gil_install.py -i

function smart_repo_install()
{
    repo=$1
    target_folder=$2

    git clone $repo $target_folder
    cd $target_folder

    cd "$(dirname "$(find . -type f -name install.gil | head -1)")"
    python2 $GILTOOLS_DIR/src/python/gil_install.py -i
}

# CONFIG-FILES SETUP
smart_repo_install git@github.com:adrianogil/config-files.git $HOME/workspace/scripts/config-files
smart_repo_install git@github.com:adrianogil/git-tools.git $HOME/workspace/scripts/git-tools
smart_repo_install git@github.com:adrianogil/GitRepoWatcher.git $HOME/workspace/scripts/git-repowatcher
smart_repo_install git@github.com:adrianogil/mydirs.git $HOME/workspace/scripts/mydirs

source ~/.bashrc

function save_repo_track()
{
    repo_folder=$1

    cd $repo_folder

    $HOME/workspace/scripts/mydirs/src/mydirs.sh -s
    python2 $HOME/workspace/scripts/git-repowatcher/src/gitrepowatcher.py -s
}

save_repo_track $HOME/workspace/scripts/config-files
save_repo_track $HOME/workspace/scripts/git-tools
save_repo_track $HOME/workspace/scripts/git-repowatcher
save_repo_track $HOME/workspace/scripts/mydirs

source ~/.bashrc