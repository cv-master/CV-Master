import Api from './Api'

async function downloadPDF(username, cvID, sections) {
  const res = await Api.fetchPDF(username, sections)
  const users = await Api.loadUserList()
  const fullName = users.find(u => u.username === username).full_name.toString()
  const firstName = fullName.split(' ')[0]
  const lastName = fullName.split(' ')[1]
  const blob = await res.blob()
  const file = new File([blob], `${firstName}_${lastName}_${cvID}.pdf`, { type: 'application/pdf' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(file)
  a.download = `${firstName}_${lastName}_${cvID}.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

async function displayPDF(username, cvID, sections) {
  const res = await Api.fetchPDF(username, sections)
  const blob = await res.blob()
  const file = new File([blob], `${username}_${cvID}.pdf`, { type: 'application/pdf' })
  document.getElementById('PDFpreview').src = URL.createObjectURL(file)
}

// eslint-disable-next-line import/prefer-default-export
export { downloadPDF, displayPDF }
