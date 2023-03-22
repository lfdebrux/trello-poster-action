import * as core from '@actions/core'
import { HttpClient } from '@actions/http-client'

const trelloCardUrlRe = 'https://trello.com/c/(\\w{8})'

try {
  const commentBody = core.getInput('comment-body')
  const githubUrl = core.getInput('github-url')
  const trelloApiToken = core.getInput('trello-api-token')
  if (trelloApiToken === '') {
    core.warning('trello-api-token is empty!')
  }
  core.setSecret(trelloApiToken)
  const trelloApiKey = core.getInput('trello-api-key')
  if (trelloApiToken === '') {
    core.warning('trello-api-key is empty!')
  }
  core.setSecret(trelloApiKey)

  function trelloApiUrl(endpoint) {
    const url = new URL(`https://api.trello.com/1${endpoint}`)
    url.searchParams.set('key', trelloApiKey)
    url.searchParams.set('token', trelloApiToken)
    return url.toString()
  }

  const match = commentBody?.match(trelloCardUrlRe)
  if (match) {
    const http = new HttpClient('trello-poster-action')
    const trelloCardUrl = match[0]
    const trelloCardId = match[1]

    const { result: trelloCardAttachments } = await http.getJson(
      trelloApiUrl(`/cards/${trelloCardId}/attachments?fields=url`)
    )
    if (trelloCardAttachments.find((attachment) => attachment.url.startsWith(githubUrl))) {
      // nothing to do, break out
      core.info(`Trello card ${trelloCardUrl} already has GitHub link ${githubUrl} attached`)
    } else {
      await http.postJson(
        trelloApiUrl(`/cards/${trelloCardId}/attachments?url=${githubUrl}`)
      )
      core.info(`Successfully attached GitHub link ${githubUrl} to Trello card ${trelloCardUrl}`)
    }
  }
} catch (error) {
  core.setFailed(error.message)
}
