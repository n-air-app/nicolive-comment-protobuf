# nicolive-comment-protobuf

nicolive protobuf module for TypeScript

## Updating proto definitions

To update proto definitions from the source repository:

1. Clone/update the source repository to `../ndgr-edge-proto/`
2. Run `npm run update-proto` to sync and process the proto files
3. Run `npm run build` to regenerate the TypeScript/JavaScript modules

## Release

To publish a new version:

1. Get the version from the source repository:

   ```bash
   cd ../ndgr-edge-proto && git describe --tags --exact-match HEAD
   ```

2. Update version in `package.json` to match the source repository's calendar version (e.g., `2025.602.163750`)
3. Commit and create a tag: `git commit -am "chore: bump version to <version>" && git tag v<version>`
4. Push with tags: `git push && git push --tags`

GitHub Actions will automatically publish the package to GitHub Packages when a tag starting with `v` is pushed.

Note: The build step runs automatically during `npm publish` via the `prepack` script.
