# -*- coding: utf-8 -*-
from setuptools import setup, find_packages

with open('requirements.txt') as f:
	install_requires = f.read().strip().split('\n')

# get version from __version__ variable in erpnext_quota/__init__.py
from sowaanerp_subscription import __version__ as version

setup(
	name='sowaanerp_subscription',
	version=version,
	description='App to manage SowaanERP Subscription usage and quota',
	author='Sowaan',
	author_email='info@sowaan.com',
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires
)
