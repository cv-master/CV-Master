const saveCV = async (cvID, username, sections, languageID) => {
  const response = await fetch(`/api/cvs/${cvID}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, sections, languageID }),
  })
  if (response.status !== 200) throw Error(`error ${response}`)
  return 'Save succeeded.'
}

const loadCV = async (cvID) => {
  const response = await fetch(`/api/cvs/${cvID}`, { credentials: 'include' })
  const body = await response.json()
  if (response.status !== 200) throw Error(body.message)
  return body
}

const loadPreview = async (sections, username) => {
  const response = await fetch('/actions/preview', {
    credentials: 'include',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sections, username }),
  })
  const body = await response.text()
  if (response.status !== 200) throw Error(body.message)
  return body
}

const loadUserList = async () => {
  const response = await fetch('/api/users', { credentials: 'include' })
  const users = await response.json()
  if (response.status !== 200) throw Error(users.message)
  return users
}

const loadCurrentUser = async () => {
  const response = await fetch('/api/loggedInUser', { credentials: 'include' })
  const loggedInUser = await response.text()
  if (response.status !== 200) throw Error(loggedInUser.message)
  return loggedInUser
}

const loadCVList = async (username) => {
  const response = await fetch(`/api/users/${username}/cvs`, { credentials: 'include' })
  const cvs = await response.json()
  if (response.status !== 200) throw Error(cvs.message)
  return cvs
}

const copyCV = async (cvID) => {
  const response = await fetch(`/api/cvs/${cvID}/copy`, {
    method: 'POST',
    credentials: 'include',
  })
  const nameOfCopiedCV = await response.text()
  if (response.status !== 200) throw Error(`error ${response}`)
  return nameOfCopiedCV
}

const deleteCV = async (cvID) => {
  const response = await fetch(`/api/cvs/${cvID}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  const body = await response.text() // 'Delete accepted' or 'Delete denied'
  if (response.status !== 200) throw Error(`error ${response}`)
  return body
}

const renameCV = async (cvID, newCVName) => {
  const response = await fetch(`/api/cvs/${cvID}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ newCVName }),
  })
  const body = await response.text()
  if (response.status !== 200) throw Error(body.message)
  return body
}

const fetchPDF = async (username, sections) => {
  const response = await fetch('/api/pdf', {
    credentials: 'include',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sections, username }),
  })
  if (response.status !== 200) throw Error(`error ${response}`)
  return response
}

const loadLanguages = async () => {
  const response = await fetch('/api/languages', { credentials: 'include' })
  const languages = await response.json()
  if (response.status !== 200) throw Error(languages.message)
  return languages
}

const loadCVSections = async () => {
  const response = await fetch('/api/cvsections', { credentials: 'include' })
  const cvSections = await response.json()
  if (response.status !== 200) throw Error(cvSections.message)
  return cvSections
}

export default {
  saveCV,
  loadCV,
  loadPreview,
  loadUserList,
  loadCurrentUser,
  loadCVList,
  copyCV,
  deleteCV,
  renameCV,
  fetchPDF,
  loadLanguages,
  loadCVSections,
}
