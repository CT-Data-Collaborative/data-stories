### Template for CT Data Collaborative Templates

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


## Building out the scrolling

I've been a huge fan of Jim Vallandingham's work since I came across his Visualizing The Racial Divide maps a few years back. So I was quite excited when I saw that he was speaking at OpenViz 2015, which I was attending. I was even more excited to see that he was discussing scrolling, a technique I've been wanting to incorporate into my work with the CT Data Collaborative. As expected, the talk was excellent.

A month later, we had released the latest round of data from the CT Racial Profiling Prohibition Project and we're thinking about developing a data story to dig in to some of the thornier parts of the analysis that Matt Ross from CERC did. Traffic stop data is quite difficult to parse. People don't only move within fixed town boundaries and the makes it very difficult to compare activity across police departments since we don't really know what the possible universe of people who could have been stopped was. Matt, economist that he is, dove into the literature and engaged with two lines of analysis: KPT Hit Rate and the Veil of Darkness.

...

Scrolling in context is a bit trickier. Jim's tutorial is fantasticm, but I needed to integrate it with my existing story templates.
