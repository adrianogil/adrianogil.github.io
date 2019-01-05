installer_folder=$HOME/workspace

pkg install git
pkg install openssh

mkdir $installer_folder
cd $installer_folder

ssh-keygen -t rsa -N "" -f $HOME/.ssh/my.key

mkdir /sdcard/sshkeys/
cp $HOME/.ssh/*.pub /sdcard/sshkeys/