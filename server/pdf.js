const markdown = require('markdown').markdown
const pdf = require('html-pdf')
const fs = require('fs')
const path = require('path')
const ejs = require('ejs')
const db = require('./db')
const config = require('./config')

/*
 *  Loading static assets for PDF creation from filesystem to database.
 *  Does not run if there are no assets to load, and reads which files to load from a pdf/files.json
 */
if (config.update_pdf_from_fs === 1) {
  fs.readFile(path.resolve(__dirname, './pdf/files.json'), 'utf-8', (err, data) => {
    if (err) console.log('static file index not found')
    else {
      const fileIndex = JSON.parse(data)
      if (fileIndex && fileIndex.files && fileIndex.files.length > 0) {
        if (fileIndex.clearAssets) db.clearAssets()
        fileIndex.files.forEach(({ filename, filetype, base64, location }) => {
          const contents = fs.readFileSync(path.resolve(__dirname, './pdf/', location), 'utf-8')
          db.configAsset({ filename, filetype, base64, contents })
        })
      }
      console.log(`adding ${fileIndex.files.length} static files\n`)
    }
  })
}

const sectionToText = (section) => {
  if (!section.text) {
    return ''
  }
  const title = section.title
  // markdown: one \n = one space
  // markdown: two \n's in a row = one line break
  // markdown: three, four, five... \n's in a row = still only one line break
  // --> we have to replace 3rd, 4th, 5th... consecutive \n with <br>
  const rows = section.text.split('\n')
  // holds that: '1\n1\n\n1\n\n\n1'.split('\n') === ['1', '1', '', '1'. ''. ''. '1'].
  // so we need to find two or more consecutive empty strings:
  for (let i = rows.length - 1; i > 0; i -= 1) {
    // trimming so that spaces don't matter:
    if (rows[i].trim() === '' && rows[i - 1].trim() === '') {
      rows[i] = '<br>'
    }
  }
  // joining the modified array:
  const text = rows.join('\n')
  const titleAsMarkdown = (title ? `###${title}\n` : '')
  return `${titleAsMarkdown}${text}`
}

// getHTML requires uid to find the correct picture from CDN. The uid is given to it via servePDF.
const getHTML = async ({ sections, username }) => {
  const style = await db.getAsset({ filename: 'pdf.css' }).then(data => data.file)
  const template = await db.getAsset({ filename: 'preview.ejs' }).then(data => data.file)
  const fullName = await db.loadFullName(username)
  // by default, '<br>' is escaped with '&lt;br&gt;' to prevent line break
  // let's undo it for better user control:
  const sectionsInMarkdown = sections
    .map(section => markdown.toHTML(sectionToText(section)))
    .map(html => html.replace(/&lt;br&gt;/g, '<br>'))
  const html = ejs.render(template, {
    styles: style,
    sectionsInMarkdown,
    userID: username,
    name: fullName,
  })
  return html
}

const servePDF = async (response, { sections, username }) => {
  const header = await db.getAsset({ filename: 'header.html' }).then(data => data.file)
  const footer = await db.getAsset({ filename: 'footer.html' }).then(data => data.file)
  const options = {
    base: `${config.clientURL}`,
    header: {
      height: '20mm',
      contents: header,
    },
    footer: {
      height: '12mm',
      contents: footer,
    },
  }
  getHTML({ sections, username }).then((parsedHTML) => {
    pdf.create(parsedHTML, options).toStream((err, stream) => {
      response.setHeader('Content-Type', 'application/pdf')
      response.setHeader('Content-Disposition', 'attachment; filename=cv.pdf')
      stream.on('end', () => response.end())
      stream.pipe(response)
    })
  })
}

module.exports = { getHTML, servePDF }
