#kd8bny Makefile
#Project: cumulus
#V1 R5

     
# Cleans your directory
clean:
	@ echo "*** Removing all temp files ***"
	@ rm -f libs/*.pyc
	@ rm -f libs/*.txt
	@ rm -f libs/*~
	@ echo "*** Complete ***"

# Update 
update:
	@ make clean
	@ echo "*** Updating ***"
	@ git pull
	@ echo "*** Complete ***"

# Auto install required packages
prereq:
	@ echo "*** Installing Prerequisites... Standby ***"
	@ sudo apt-get install git python2.7 python-distutils-extra
	@ echo "*** Complete ***"

# Runs the code
run:
	#@ sudo python

# Build UI
install:
	#Build main UI
	@ echo "*** Running Setup ***"
	@ sudo python setup.py
	@ echo "*** Complete ***"