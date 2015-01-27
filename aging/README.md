### Template for CT Data Collaborative Templates

LICENSE: BSD

## Getting up and running

The steps below will get you up and running with a local development environment. We assume you have the following installed:

* ruby / sass / compass
* nodejs
* npm / npm cli

First, install the required node dependencies:

    $ npm install

This ought to install:

* bower
* grunt

and a series of additional grunt helpers that are used in managing dependencies and build steps.

Next install the required bower javascript libraries:

    $ bower install

This will load any required JS libraries into bower_components/. However, before development begins, and additional step is required to deal with Sass partials and vendor files. We use the official Bootstrap SASS port, so we need to move the partials into the correct directories so that our stylesheets can be built correctly. To copy static files from bower_components/ subdirectories:

    $ grunt setup-static

This command will also concatenate all vendor js and css files and place copies in the appropriate directories. The files created by this step are already referenced in `index.html`. Finally, it will generate an initial compilation of the stylesheets.

Once these steps have been run, you can deploy locally via:

    $ grunt serve

This will also enable live reloading and Sass CSS compilation.

Adding additional JS packages / libraries should be done via bower. The `bowercopy` and `bower_concat` tasks may need to be modified to properly locate the vendor js files.
