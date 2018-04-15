const { Client } = require('pg')
const config = require('./config')

const client = new Client({
  connectionString: config.databaseURL,
})

client.connect().catch(e => console.error('connection error', e.stack))

const load = ({ cvID }) => {
  const query = `
    SELECT a.section_id AS section_id, title, text, template
    FROM cv_sections AS a LEFT OUTER JOIN section_data AS b
      ON a.section_id = b.section_id AND cv_id = $1
    WHERE language_id IN (
      SELECT language_id
      FROM cvs
      WHERE cv_id = $1
    )
    ORDER BY section_order;
  `
  return client.query(query, [cvID])
    .then((result) => {
      const rows = result.rows
      // After left outer join result.rows[i].text can be NULL if section_data doesn't have a row
      // with an id of result.rows[i].section_id. In this case, we want to show user an empty
      // section:
      for (let i = 0; i < rows.length; i += 1) {
        const row = rows[i]
        if (row.text === null) row.text = ''
      }
      return rows
    })
}

const loadCVSections = () => {
  const query = `
    SELECT section_id, language_id, title, template
    FROM cv_sections
    ORDER BY language_id, section_order;
  `
  return client.query(query)
    .then(result => result.rows)
}

const createCV = ({ username, cvName, languageID }) => {
  const date = new Date().toUTCString()
  const query = `INSERT INTO cvs VALUES (DEFAULT, $1, $2, $3,'${date}') RETURNING cv_id;`
  return client.query(query, [username, cvName, languageID])
    .then((res) => {
      // default query never causes a conflict so we don't have to check whether res.rows[0] is
      // defined:
      return res.rows[0].cv_id
    })
}

const save = ({ cvID, username, sections, languageID }) => {
  const upsertSection = (index) => {
    if (index < sections.length) {
      const section = sections[index]
      // do upsert
      const query = `
        INSERT INTO section_data VALUES ($1, $2, $3) ON CONFLICT (cv_id, section_id) DO UPDATE
        SET text = $3;
      `
      return client.query(query, [cvID, section.section_id, section.text])
        .then(() => upsertSection(index + 1))
    }
    return Promise.resolve('Save succeeded.')
  }
  const date = new Date().toUTCString() // for example: 'Fri, 09 Feb 2018 13:55:00 GMT'.
  // Postgres automatically translates this string into a correct date object.
  const defaultLanguageID = 1 // in case something very weird happens
  const query = `
    INSERT INTO cvs VALUES ($1, $2, 'Unknown CV', $3, '${date}')
      ON CONFLICT (cv_id) DO UPDATE SET language_id = $3, last_updated = '${date}';
  `
  return client.query(query, [cvID, username, languageID || defaultLanguageID])
    .then(() => upsertSection(0))
}

const initializeTestDB = (testUser, testLanguages, testCV, testSections) => {
  if (config.env !== 'production') {
    const languageInserts = testLanguages.map(language => (
      `INSERT INTO languages VALUES (${language.language_id}, '${language.language_name}')`
    )).join('; ')
    const sectionInserts = testSections.map(section => (
      `INSERT INTO cv_sections VALUES (${section.section_id}, ${section.language_id},
        '${section.title}', '${section.template}', ${section.order})`
    )).join('; ')
    const query = `
      DELETE FROM users;
      DELETE FROM cvs;
      DELETE FROM cv_sections;
      DELETE FROM languages;
      INSERT INTO users VALUES ('${testUser.username}', '${testUser.full_name}');
      ${languageInserts};
      ALTER SEQUENCE cvs_cv_id_seq RESTART WITH 1;
      INSERT INTO cvs VALUES (${testCV.cv_id}, '${testCV.username}', '${testCV.cv_name}',
        ${testCV.language_id}, '${testCV.last_updated}');
      ${sectionInserts};
    `
    return client.query(query)
      .then(() => 'Initialize succeeded.')
      .catch(() => 'Initialize failed.')
  }
  return 'Not allowed!'
}

const clear = () => {
  if (config.env !== 'production') {
    const query = 'TRUNCATE TABLE users CASCADE; TRUNCATE TABLE languages CASCADE;'
    return client.query(query)
      .then(() => 'Clear succeeded.')
  }
  return 'Not allowed!'
}

const loadUserList = () => {
  const query = 'SELECT username, full_name FROM users;'
  return client.query(query)
    .then(result => result.rows)
    .then((rows) => {
      // Postgres ORDER BY doesn't handle ä's and ö's properly, so let's sort rows manually:
      rows.sort((a, b) => {
        if (a.full_name < b.full_name) {
          return -1
        }
        if (a.full_name > b.full_name) {
          return 1
        }
        return 0
      })
      return rows
    })
}

const loadCVList = ({ username }) => {
  const query = `
    SELECT cv_id, cv_name, last_updated, a.language_id AS language_id, language_name
    FROM cvs AS a, languages AS b
    WHERE username = $1 AND a.language_id = b.language_id
    ORDER BY last_updated DESC;
  `
  return client.query(query, [username])
    .then(result => result.rows)
}

const rename = ({ cvID, newCVName }) => {
  const query = 'UPDATE cvs SET cv_name = $2 WHERE cv_id = $1;'
  return client.query(query, [cvID, newCVName])
    .then(result => result.rowCount.toString())
}

const loadFullName = (uid) => {
  const query = `
    SELECT full_name
    FROM users
    WHERE username = $1;
  `
  return client.query(query, [uid])
    .then(result => result.rows[0].full_name)
}

const renameUser = ({ username, fullname }) => {
  const query = 'UPDATE users SET full_name = $2 WHERE username = $1;'
  return client.query(query, [username, fullname])
    .then(result => result.rowCount)
}

const addUser = ({ username, fullname }) => {
  const query = 'INSERT INTO users VALUES ($1, $2) ON CONFLICT DO NOTHING;'
  return client.query(query, [username, fullname])
    .then(res => res.rowCount) // res.rowCount: 0 on conflict, 1 otherwise
}

const copy = ({ cvID }) => {
  const query = 'SELECT username, cv_name, language_id FROM cvs WHERE cv_id = $1;'
  return client.query(query, [cvID])
    .then(result => (result.rows[0] || Promise.reject('Copy failed')))
    .then((row) => {
      const username = row.username
      const newCVName = `${row.cv_name} (copy)`
      const languageID = row.language_id
      return createCV({ username, cvName: newCVName, languageID })
        .then((newCVID) => {
          return load({ cvID })
            .then((sections) => {
              return save({ cvID: newCVID, username, sections, languageID })
                .then(() => newCVID.toString())
            })
        })
    })
}

const deleteCV = ({ cvID }) => {
  const selectQuery = 'SELECT username FROM cvs WHERE cv_id = $1;'
  return client.query(selectQuery, [cvID])
    .then(result => (result.rows[0] ? result.rows[0].username : Promise.reject('Deleting failed')))
    .then((username) => {
      return loadCVList({ username })
        .then((cvs) => {
          if (cvs.length >= 2) {
            const query = 'DELETE FROM cvs WHERE cv_id = $1;'
            return client.query(query, [cvID])
              .then(result => result.rowCount.toString())
          }
          return Promise.resolve('0')
        })
    })
}

const configureUser = ({ username, fullname }) => {
  console.log('configuring user', username, fullname)
  return addUser({ username, fullname })
    .then((insertRowCount) => {
      if (!insertRowCount) {
        // user existed beforehand and nothing was done. updating user's full name:
        return renameUser({ username, fullname })
          .then(() => 'user exists in database')
      }
      // user didn't exist beforehand and it was created. creating a cv for the newly created user:
      const defaultLanguageID = 1
      return createCV({ username, cvName: 'New CV', languageID: defaultLanguageID })
        .then(() => 'new user and cv were created')
    })
}

const clearAssets = () => {
  const query = 'TRUNCATE TABLE assets;'
  return client.query(query)
}

const configAsset = ({ filename, filetype, base64, contents }) => {
  const date = new Date().toUTCString()
  const query = `
    INSERT INTO assets VALUES ($1, $2, $3, $4, $5);
  `
  return client.query(query, [filename, filetype, base64, contents, date])
}

const getAsset = ({ filename }) => {
  const query = 'SELECT filetype, contents, base64 FROM assets WHERE filename = $1;'
  return client.query(query, [filename])
    .then((result) => {
      const data = result.rows[0]
      if (data.base64) {
        const file = new Buffer(data.contents, 'base64')
        return { filetype: data.filetype, file }
      }
      return { filetype: data.filetype, file: data.contents }
    })
}

const loadLanguages = () => {
  const query = 'SELECT * FROM languages;'
  return client.query(query)
    .then(result => result.rows)
}

module.exports = {
  load,
  save,
  clear,
  loadUserList,
  loadCVList,
  copy,
  deleteCV,
  rename,
  loadFullName,
  initializeTestDB,
  configureUser,
  addUser,
  clearAssets,
  configAsset,
  getAsset,
  loadLanguages,
  loadCVSections,
}
