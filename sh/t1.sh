installer_folder=$HOME/workspace

pkg install git -y
pkg install openssh  -y

mkdir $installer_folder
cd $installer_folder

ssh-keygen -t rsa -N "" -f $HOME/.ssh/my.key

termux-setup-storage

cp $HOME/.ssh/*.pub /sdcard/