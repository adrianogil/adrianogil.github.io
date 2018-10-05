installer_folder=~/workspace

mkdir $installer_folder
cd $installer_folder

git clone git@github.com:adrianogil/config-files.git
echo "export CONFIG_FILES_DIR="$HOME"/workspace/config-files/" >> ~/.bashrc
echo "source ${CONFIG_FILES_DIR}/bashrc.sh" >> ~/.bashrc.sh

git clone git@github.com:adrianogil/git-tools.git
echo "export GIT_TOOLS_DIR="$HOME"/workspace/git-tools/" >> ~/.bashrc
echo "source $GIT_TOOLS_DIR/bashrc.sh" >> ~/.bashrc

git clone git@github.com:adrianogil/GitRepoWatcher.git
echo "export GIT_REPO_WATCHER_DIR="$HOME"/workspace/GitRepoWatcher/" >> ~/.bashrc
echo "source $GIT_REPO_WATCHER_DIR/src/bashrc.sh" >> ~/.bashrc

source ~/.bashrc

cd config-files
mydirs -s config-files
rw -s

cd ..

cd git-tools
mydirs -s git-tools
rw -s

cd ..

cd GitRepoWatcher
mydirs -s repo-watcher
rw -s
