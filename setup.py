#!/usr/bin/env python
# -*- Mode: Python; coding: utf-8; indent-tabs-mode: nil; tab-width: 4 -*-
### BEGIN LICENSE
# Copyright (C) 2014 Archisman Panigrahi <apandada1@gmail.com>
# Thanks to Adam Whitcroft <adamwhitcroft.com> for Climacons!
# This program is free software: you can redistribute it and/or modify it 
# under the terms of the GNU General Public License version 3, as published 
# by the Free Software Foundation.
# 
# This program is distributed in the hope that it will be useful, but 
# WITHOUT ANY WARRANTY; without even the implied warranties of 
# MERCHANTABILITY, SATISFACTORY QUALITY, or FITNESS FOR A PARTICULAR 
# PURPOSE.  See the GNU General Public License for more details.
# 
# You should have received a copy of the GNU General Public License along 
# with this program.  If not, see <http://www.gnu.org/licenses/>.
### END LICENSE

###################### DO NOT TOUCH THIS (HEAD TO THE SECOND PART) ######################

import os
import sys
import glob
from setuptools import setup, find_packages

setup(
    name='cumulus',
    version= '1.0.6',    
    author='Daryl Bennett',  
    author_email='kd8bny@gmail.com',
    license='GPL-3',
    description='Quickly check the weather with this beautiful application',
    long_description='Cumulus is a free and open source weather application. It is continuation of discontinued Stormcloud 1.1 ,however with some changes. It is and always will be free.',
    url='https://github.com/kd8bny/cumulus',
    packages=find_packages(),
    data_files=[
        ('share/glib-2.0/schemas', ['data/glib-2.0/schemas/com.github.cumulus.gschema.xml']),
        ('share/doc/cumulus', ['README.md']),
        ('share/cumulus/ui', glob.glob('data/ui/*.ui')),
        ('share/cumulus/ui', glob.glob('data/ui/*.xml')),
        ('share/cumulus/media/fonts', glob.glob('data/media/fonts/*.*')),
        ('share/cumulus/media/scripts', glob.glob('data/media/scripts/*.*')),
        ('share/cumulus/media', glob.glob('data/media/*.html')),
        ('share/cumulus/media', glob.glob('data/media/*.svg')),
        ('share/cumulus/media', glob.glob('data/media/*.json')),
        ('share/cumulus/media', glob.glob('data/media/*.css')),
        ('bin', ['bin/cumulus']),
        ('../share/applications', ['cumulus.desktop'])
        ]
)
