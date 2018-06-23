from setuptools import find_packages, setup

setup(
    name='driller',
    version='1.0.0',
    url='http://flask.pocoo.org/docs/tutorial/',
    license='BSD',
    maintainer='Random People',
    maintainer_email='netsgnut+htr2018@gmail.com',
    description='A simple driller for transactions',
    packages=find_packages(),
    include_package_data=True,
    zip_safe=False,
    install_requires=[
        'flask',
    ],
)
