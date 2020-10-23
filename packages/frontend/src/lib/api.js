const api = { get, post }
export default api

const API_URL = 'http://localhost:8253'

async function get (url, query) {
  if (query) {
    url += '?'
    Object.keys(query).forEach(key => {
      url += `${key}=${query[key]}&`
    })
    url.slice(1) // remove orphan & at the end
  }
  return request('GET', url)
}
async function post (url, body) {
  return request('POST', url, body)
}
async function request (method, url, body) {
  return fetch(API_URL + url, {
    method,
    body,
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(res => {
    if (!res.ok) {
      throw new Error(`API Error: ${res.statusText}`)
    }
    return res
  }).then(res => res.json())
}
