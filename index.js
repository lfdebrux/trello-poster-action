import * as core from '@actions/core'
import { HttpClient } from '@actions/http-client'

const trelloCardUrlRe = 'https://trello.com/c/(\\w{8})'

try {
  const commentBody = core.getInput('comment-body')
  const githubUrl = core.getInput('github-url')
  const attachmentName = core.getInput('attachment-name')
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

  function trelloApiUrl(endpoint, urlParams) {
    const url = new URL(`https://api.trello.com/1${endpoint}`)
    url.searchParams.set('key', trelloApiKey)
    url.searchParams.set('token', trelloApiToken)

    for(const [key, value] of Object.entries(urlParams || {})) {
      url.searchParams.set(key, value)
    }

    core.debug(url.toString())

    return url.toString()
  }

  const match = commentBody?.match(trelloCardUrlRe)
  if (match) {
    core.debug(`Found Trello card link ${match[0]}`)

    const http = new HttpClient('trello-poster-action')
    let trelloCardUrl = match[0]
    let trelloCardId = match[1]

    // handle mirror cards
    const { result: trelloCard } = await http.getJson(
      trelloApiUrl(`/cards/${trelloCardId}`)
    )
    if (trelloCard.cardRole == "mirror") {
      core.debug(`Trello card is a mirror card for ${trelloCard.name}, updating that card instead`)
      trelloCardUrl = trelloCard.name
      trelloCardId = trelloCard.mirrorSourceId
    }

    const { result: trelloCardAttachments } = await http.getJson(
      trelloApiUrl(`/cards/${trelloCardId}/attachments`, {"fields": "url"})
    )
    core.debug(`Trello card has existing attachments ${JSON.stringify(trelloCardAttachments)}`)

    if (trelloCardAttachments.find((attachment) => attachment.url.startsWith(githubUrl))) {
      // nothing to do, break out
      core.info(`Trello card ${trelloCardUrl} already has GitHub link ${githubUrl} attached`)
    } else {
      let params = {
        url: githubUrl
      }

      if (attachmentName != null) {
        // Name parameter can be maximum 256 characters, so trim it to that
        if (attachmentName.length > 256) {
          core.info("'attachment-name' property can be a maximum of 256 characters. Truncating.")
        }
        params.name = attachmentName.substring(0, 257)
      }

      core.debug(`POST /cards/${trelloCardId}/attachments ${JSON.stringify(params)}`)
      await http.postJson(
        trelloApiUrl(`/cards/${trelloCardId}/attachments`, params)
      )
      core.info(`Successfully attached GitHub link ${githubUrl} to Trello card ${trelloCardUrl}`)
    }
  }
} catch (error) {
  core.setFailed(error.message)
}
