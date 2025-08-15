# Trello Poster Action

A GitHub action that attaches GitHub links to Trello cards.

As an example, see PR #1.

## Quickstart

If you want to want to make sure PRs that mention Trello cards are attached to those Trello cards, add the following workflow your repo:

```yaml
name: Trello Poster
on:
  pull_request:
    types: [created, edited]
jobs:
  trello-poster:
    runs-on: ubuntu-latest
    steps:
      - uses: lfdebrux/trello-poster-action@<SHA>
        with:
          comment-body: ${{ github.event.pull_request.body }}
          github-url: ${{ github.event.pull_request.html_url }}
          trello-api-token: ${{ secrets.TRELLO_API_TOKEN }}
          trello-api-key: ${{ secrets.TRELLO_API_KEY }}
```

## Trello API key and token

The Trello API requires that the calls provide both an API key and token. See the [Trello API documentation](https://developer.atlassian.com/cloud/trello/guides/rest-api/api-introduction/#managing-your-api-key) for more details.

## Inputs

### `comment-body`

**Required** The body text of the pull request or issue comment that may contain the link to Trello.

### `github-link`

**Required** The URL of the GitHub page you want to attach to the Trello card mentioned in `comment-body`.

### `trello-api-key`

**Required** A Trello API key for the application.

### `trello-api-token`

**Required** A Trello API token for the Trello user.

## Acknowledgements

Inspired by [GitHub Trello Poster] by @emmabeynon.

## Licence

Unless stated otherwise, the codebase is released under [the MIT License](LICENCE). This covers both the codebase and any sample code in the documentation.

[GitHub Trello Poster]: https://github.com/emmabeynon/github-trello-poster
