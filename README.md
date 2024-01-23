![cover](https://github.com/Mart1M/Design-System-Radar/assets/28647820/2a159be1-a743-4fb1-9040-a44da202ead6)

# Design System Radar Plugin

## Overview

Design System Radar is a specialized Figma plugin tailored for users of design system. This plugin enhances the user experience by providing robust tools for ensuring compliance with design system's standards, particularly focusing on spacing and style variables. It's an essential tool for designers who aim to maintain high levels of consistency and precision in their designs.

## Features

- **Spacing Analysis:** The plugin automatically identifies spacing discrepancies within selected frames, instances, and components. It compares these against design system's established spacing guidelines, flagging any non-conformities for review.
- **Style Variable Analysis:** Design System Radar detects elements in your designs that are not bound to style variables. This feature is crucial for maintaining uniformity across your design projects.
- **Navigation for Quick Corrections:** Users can quickly navigate to any elements that do not conform to design system directly from the plugin's interface, streamlining the design refinement process.

## Plugin installation

These plugins are written using [TypeScript](https://www.typescriptlang.org/) to take advantage of Figma's typed plugin API. Before installing these samples as development plugins, you'll need to compile the code using the TypeScript compiler. Typescript can also watch your code for changes as you're developing, making it easy to test new changes to your code in Figma.

To install TypeScript, first [install Node.js](https://nodejs.org/en/download/). Then:

    $ npm install -g typescript

Next install the packages that the samples depend on. Currently, this will only install the lastest version of the Figma typings file. Most of the samples will reference this shared typings file in their `tsconfig.json`.

    $ npm install

Now, to compile the Design System Radar plugin (for example):

    $ cd Design-System-Radar
    $ tsc

Now you can import the Design System Radar plugin from within the Figma desktop app (`Plugins > Development > Import plugin from manifest...` from the right-click menu)!

The code for each plugin is in `code.ts` in that plugin's subdirectory. If a
plugin shows some UI, the HTML will be in `ui.html`.

## Usage

Using Design System Radar is straightforward:

1.  **Open a Figma Document:**

    - Ensure you have a Figma document open that uses your design system.

2.  **Run the Plugin:**

    - Select 'Plugins' > "Design System Radar" to start the plugin.

3.  **Conduct Your Analysis:**

    - Utilize the plugin's features to analyze spacings and style variables.
    - The plugin will display a list of elements that do not align with the design system's standards.

4.  **Review and Adjust:**

    - Review the findings and adjust your design elements as needed to comply with the design system standards.

## Adaptation for your usage

1. **Change suffix and/or description tag detector in code.ts**

- If your components have a suffix, then you need to change this in `code.ts` to match your nomenclature.
- You can also use `[ds-radar]` in the description of your components if you don't have suffix.

2. **Use your own dimension system**

- Change the values of the table `allowedSpacings` in `code.ts` with your own values.
