Table XBlock
============
Table XBlock is powerful tool used to (you guessed it) create tables in an [edX course](https://www.edx.org/). It supports a high degree of user interactivity and tracking, or just simple, static tables if desired. If you're unfamiliar with edX, its open source platform, or XBlocks, then [this may be a good place to start](http://code.edx.org/).

###Installation
[Download this XBlock](https://github.com/mickmuzac/Table-XBlock/archive/master.zip) to a suitable directory on your server and extract its contents (alternatively, you may clone this repository using git).

The steps to install all XBlocks can be found on [edX's XBlocks integration page](https://github.com/edx/edx-platform/blob/master/docs/en_us/developers/source/xblocks.rst#testing). Follow the instructions outlined in the `Testing` section if you're running the devstack or scroll down to those outlined under `Deploying your XBlock` if you're not. 

Use the value `"table"` whenever it's necessary to append the name of this XBlock to any list. Also, remember to [activate the virtualenv](http://docs.python-guide.org/en/latest/dev/virtualenvs/#basic-usage) that the edx platform is using *and* use the pip script that is provided by edX.

```shell
$ cd /edx/app/edxapp
$ source venvs/edxapp/bin/activate 
$ sudo -u edxapp /edx/bin/pip.edxapp install /path/to/Table-XBlock
$ deactivate
```

As of the writing of this readme, there is no streamlined XBlock installation manager, though one has been proposed by edX developers.
