# DOT FILES SETUP (1/2)
DOTFILES_DIR=$HOME/.dotfiles
git clone git@github.com:adrianogil/dotfiles.git $DOTFILES_DIR

cd $DOTFILES_DIR
./create_symlinks.sh

# GIL TOOLS SETUP
GILTOOLS_DIR=$HOME/workspace/scripts/gil-tools
mkdir -p $HOME/workspace/scripts
git clone git@github.com:adrianogil/gil-tools.git $GILTOOLS_DIR
cd $GILTOOLS_DIR

pkg install python2 -y

python2 src/python/gil_install.py -i

source ~/.bashrc

# Finish DOT FILES SETUP (2/2)
cd $DOTFILES_DIR
gil-install -i

function smart_repo_install()
{
    repo=$1
    target_folder=$2

    git clone $repo $target_folder
    cd $target_folder
    gil-install -i
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

    mydirs -s
    rw -s
}

save_repo_track $HOME/workspace/scripts/config-files
save_repo_track $HOME/workspace/scripts/git-tools
save_repo_track $HOME/workspace/scripts/git-repowatcher
save_repo_track $HOME/workspace/scripts/mydirs

source ~/.bashrc