## Responsive Data grid 2

Add-on for Data grid 2 to automatically make columns respond to the page width and hide columns behind a collapsible
chevron when there is less room.

Aside from this add-on, there is also a [Collapsible Data grid 2](http://) add-on widget. This widget focuses on
collapsible content but does not adjust column responsiveness. However, both widgets can be used together. Please note
that currently, this setup would display two different chevrons.

## Typical usage scenario

When you have a Data grid 2 with a larger amount of columns while also requiring the page to be responsive.

## Features

-   Define max. columns on mobile (`default 3`)
-   Define max. columns on tablet (`default 5`)
-   Define mobile breakpoint (`576px`)
-   Define tablet breakpoint (`992px`)
-   Place a single Data grid 2 widget inside

## Usage

Just place a single Data grid 2 widget inside this widget and it will auto respond according to above defaults.

## Development and contribution

1. Install NPM package dependencies by using: `npm install`. If you use NPM v7.x.x, which can be checked by executing
   `npm -v`, execute: `npm install --legacy-peer-deps`.
1. Run `npm start` to watch for code changes. On every change:
    - the widget will be bundled;
    - the bundle will be included in a `dist` folder in the root directory of the project;
    - the bundle will be included in the `deployment` and `widgets` folder of the Mendix test project.
