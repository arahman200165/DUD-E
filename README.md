# DudE

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.1.8.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## PWA & Offline

DUD-E is an installable Progressive Web App with an offline-capable app shell.

**What's cached:** after the first successful page load over a network connection, the Angular service worker (`@angular/service-worker`) caches the app shell (HTML, JS, CSS bundles) and static assets (icons, manifest). Each tool's code is fetched and cached the first time you navigate to it.

**What works offline:** once cached, the dashboard shell and any previously-visited local tool (e.g. JSON Formatter) launch and function fully offline — no network round-trip required. Tools that declare a network requirement (none currently do) show a compact "Offline" badge in their header when the app has no connectivity, and never block the rest of the app from working.

**What does NOT work offline:** a tool (or the app itself) that has never been successfully loaded at least once while online cannot be launched offline — the service worker can only serve what it has previously cached.

**Update strategy:** DUD-E checks for a new version whenever the page is (re)loaded, and additionally polls every 6 hours in the background so a tab left open for a long session still notices a new deployment. When a new version is ready, a small "Update available" prompt appears in the top-right corner of the shell. Updates are never applied silently or automatically — click "Reload" to activate the new version and refresh the page. Until you do, you keep using the version you loaded.

**Testing offline behavior locally:** the service worker is only active in production builds (`ng build`), not `ng serve`. To test:

```bash
ng build
npx http-server dist/dud-e/browser -p 8080
```

Then open `http://localhost:8080`, let it load once, and use your browser DevTools' Network tab "Offline" toggle to verify the shell and any already-visited tool still work.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
