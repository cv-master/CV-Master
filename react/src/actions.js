import Api from './Api'
import history from './history'

export const updatePreview = (sections, username) => async (dispatch) => {
  const sectionsWithTemplate = sections.map((section) => {
    const text = section.showTemplate ? section.template : section.text
    return { title: section.title, id: section.id, text }
  })
  const previewHTML = await Api.loadPreview(sectionsWithTemplate, username)
  dispatch({
    type: 'UPDATE_PREVIEW',
    previewHTML,
  })
}

export const loadSections = cvID => async (dispatch) => {
  const sections = await Api.loadCV(cvID)
  const sectionsWithTemplateToggle = sections.map((section) => {
    return Object.assign({}, section, { showTemplate: false })
  })
  dispatch({
    type: 'UPDATE_SECTIONS',
    sections: sectionsWithTemplateToggle,
  })
  return sectionsWithTemplateToggle
}

export const updateSections = (sections) => {
  return {
    type: 'UPDATE_SECTIONS',
    sections,
  }
}

export const updateCVList = username => async (dispatch) => {
  const cvList = await Api.loadCVList(username)
  dispatch({
    type: 'UPDATE_CV_LIST',
    cvList,
  })
  return cvList
}

export const setCVList = (cvList) => {
  return {
    type: 'UPDATE_CV_LIST',
    cvList,
  }
}

export const updateCVSections = () => async (dispatch) => {
  const cvSections = await Api.loadCVSections()
  dispatch({
    type: 'UPDATE_CV_SECTIONS',
    cvSections,
  })
}

export const updateUserList = () => async (dispatch) => {
  const users = await Api.loadUserList()
  dispatch({
    type: 'UPDATE_USER_LIST',
    userList: users,
  })
  return users
}

export const getCurrentUser = () => async (dispatch) => {
  const loggedInUser = await Api.loadCurrentUser()
  dispatch({
    type: 'GET_CURRENT_USER',
    loggedInUser,
  })
  return loggedInUser
}


export const selectUser = (userID) => {
  return {
    type: 'SELECT_USER',
    userID,
  }
}

export const selectCVIndex = (cvIndex) => {
  return {
    type: 'SELECT_CV_INDEX',
    cvIndex,
  }
}

export const updateSearchFieldContents = (newContents) => {
  return {
    type: 'UPDATE_SEARCH_FIELD_CONTENTS',
    searchFieldContents: newContents,
  }
}

export const update404 = (urlNotFound) => {
  return {
    type: 'UPDATE_404',
    urlNotFound,
  }
}

export const cvClickedCascade = (username, cvList, cvID) => async (dispatch) => {
  const existingCV = cvList.find(cv => cv.cv_id === cvID) || cvList[0]
  const sections = await loadSections(existingCV.cv_id)(dispatch)
  history.push(`/users/${username}/${existingCV.cv_id}`)
  updatePreview(sections, username)(dispatch)
}

export const userClickedCascade = (userID, cvID) => async (dispatch) => {
  dispatch(selectUser(userID))
  const username = userID
  const cvList = await updateCVList(username)(dispatch)
  cvClickedCascade(username, cvList, cvID || cvList[0].cv_id)(dispatch)
}
