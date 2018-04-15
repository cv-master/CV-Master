/* eslint import/no-extraneous-dependencies: [0, {“devDependencies”: false}] */

// During the test the env variable is set to test
process.env.NODE_ENV = 'test'


// Require the dev-dependencies
const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
const db = require('../db')

chai.should()
chai.use(chaiHttp)

/* global before after */
// Our parent block
describe('Save and load tests', () => {
  before(() => { // Before each test we empty the database
    console.log('Clearing the test database!')
    db.clear()
  })
  after(() => {
    console.log('Cleaning your messes up!')
    db.clear()
  })

  const initSuccessMessage = 'Initialize succeeded.'
  const testUser = { username: 'a', full_name: 'Default Tester' }
  const testLanguages = [ // ids hardcoded on purpose
    { language_id: 1, language_name: 'en' },
    { language_id: 2, language_name: 'fi' },
  ]
  const testCV = {
    cv_id: 'DEFAULT',
    username: testUser.username,
    cv_name: 'b',
    language_id: testLanguages[0].language_id,
    last_updated: '2018-01-01 15:15:16+0',
  }
  const testSections = [ // ids hardcoded on purpose
    {
      section_id: 1,
      language_id: 1,
      title: 'en_title_1',
      template: 'en_template_1',
      order: 50,
    },
    {
      section_id: 2,
      language_id: 1,
      title: 'en_title_2',
      template: 'en_template_2',
      order: 100,
    },
    {
      section_id: 3,
      language_id: 1,
      title: 'en_title_3',
      template: 'en_template_3',
      order: 0,
    },
    {
      section_id: 4,
      language_id: 2,
      title: 'fi_title_1',
      template: 'fi_template_1',
      order: 0,
    },
  ]
  const testUsername = testUser.username
  const testCVName = testCV.cv_name

  // Test the returning of current user
  describe('Get current user with no auth', () => {
    before(() => { // Before each test we initialize the database
      db.initializeTestDB(testUser, testLanguages, testCV, testSections)
    })
    it('it should answer with 200', () => {
      return chai.request(server)
        .get('/api/loggedInUser')
        .then((res) => {
          res.should.have.status(200)
          res.text.should.equal('defaultUser')
        })
    })
  })

  /*
  * Test the /GET route
  */
  describe('Get first CV', () => {
    it('it should load an array containing one specific cv after initializing test db', () => {
      return db.initializeTestDB(testUser, testLanguages, testCV, testSections)
        .then((resText) => {
          resText.should.be.eql(initSuccessMessage)
          return chai.request(server)
            .get(`/api/users/${testUsername}/cvs`)
            .then((res) => {
              res.should.have.status(200)
              const cvArray = res.body
              cvArray.should.be.a('array')
              cvArray.length.should.be.eql(1)
              cvArray[0].cv_name.should.be.eql(testCVName)
            })
        })
    })

    it('it should answer with 200', () => {
      return chai.request(server)
        .get('/api/cvs/1')
        .then((res) => {
          res.should.have.status(200)
        })
    })

    it('it should load an array containing one specific user after initializing test db', () => {
      return db.initializeTestDB(testUser, testLanguages, testCV, testSections)
        .then((resText) => {
          resText.should.be.eql(initSuccessMessage)
          return chai.request(server)
            .get('/api/users')
            .then((res) => {
              res.should.have.status(200)
              const usernameArray = res.body
              usernameArray.should.be.a('array')
              usernameArray.length.should.be.eql(1)
              usernameArray[0].username.should.be.eql(testUsername)
            })
        })
    })

    it('it should save a sample CV', () => {
      return chai.request(server)
        .post('/api/cvs/1')
        .send({ sections: [] })
        .then((res) => {
          res.should.have.status(200)
          res.text.should.be.eql('Save succeeded.')
        })
    })

    it('it should load the recently saved CV', () => {
      const cvID = 1
      const languageID = testCV.language_id
      const savedSections = [
        {
          section_id: testSections[0].section_id,
          text: 'feuahfgquei234',
        },
      ]
        .sort(section => section.order)
      return chai.request(server)
        .post(`/api/cvs/${cvID}`)
        .send({ sections: savedSections })
        .then(() => {
          return chai.request(server)
            .get(`/api/cvs/${cvID}`)
            .then((res) => {
              res.should.have.status(200)
              const sections = res.body
              sections.should.be.a('array')
              const sectionCountInSpecifiedLanguage = testSections
                .filter(section => section.language_id === languageID)
                .length
              sections.length.should.be.eql(sectionCountInSpecifiedLanguage)
              for (let i = 0; i < sections.length; i += 1) {
                // finding the index of sections[i] in savedSections:
                const savedSectionsIndex = savedSections
                  .findIndex(a => a.section_id === sections[i].section_id)
                if (savedSectionsIndex !== -1) {
                  // if we found the index in savedSections,
                  // compare sections[i].text to savedSections[savedSectionsIndex].text:
                  sections[i].text.should.be.eql(savedSections[savedSectionsIndex].text)
                } else {
                  // else compare text to empty string:
                  sections[i].text.should.be.eql('')
                }
              }
            })
        })
    })

    it('it should return an empty array for a non-existing CV', () => {
      const nonExistingCVID = 428319
      return chai.request(server)
        .get(`/api/cvs/${nonExistingCVID}`)
        .then((res) => {
          res.should.have.status(200)
          const sections = res.body
          sections.should.be.a('array')
          sections.length.should.be.eql(0)
        })
    })

    it('it should return a reasonable CV id after initializing test db and copying a CV', () => {
      const testCVID = 1
      return db.initializeTestDB(testUser, testLanguages, testCV, testSections)
        .then((resText) => {
          resText.should.be.eql(initSuccessMessage)
          return chai.request(server)
            .post(`/api/cvs/${testCVID}/copy`)
            .then((result) => {
              result.should.have.status(200)
              const cvID = Number(result.text)
              cvID.should.be.gt(testCVID)
            })
        })
    })

    it('it should delete one row when a user has at least two CVs (otherwise it should delete none) after initializing test db and copying a CV', () => {
      const deleteCV = (username) => {
        return chai.request(server)
          .get(`/api/users/${username}/cvs`)
          .then((res) => {
            res.should.have.status(200)
            const cvArray = res.body
            cvArray.should.be.a('array')
            return chai.request(server)
              .delete(`/api/cvs/${cvArray[0].cv_id || 1}`)
              .then((result) => {
                result.should.have.status(200)
                if (cvArray.length >= 2) {
                  result.text.should.be.eql('1')
                  deleteCV(username)
                } else {
                  result.text.should.be.eql('0')
                }
              })
          })
      }
      const testCVID = 1
      return db.initializeTestDB(testUser, testLanguages, testCV, testSections)
        .then((resText) => {
          resText.should.be.eql(initSuccessMessage)
          return chai.request(server)
            .post(`/api/cvs/${testCVID}/copy`)
            .then((result) => {
              result.should.have.status(200)
              const cvID = Number(result.text)
              cvID.should.be.gt(testCVID)
              return deleteCV(testUsername)
            })
        })
    })

    const newName = 'New name'
    it('it should update one row when renaming an existing CV after initializing test db', () => {
      const testCVID = 1
      return db.initializeTestDB(testUser, testLanguages, testCV, testSections)
        .then((resText) => {
          resText.should.be.eql(initSuccessMessage)
          return chai.request(server)
            .put(`/api/cvs/${testCVID}`)
            .send({ newCVName: newName })
            .then((result) => {
              result.should.have.status(200)
              result.text.should.be.eql('1')
            })
        })
    })

    it('it should update zero rows when renaming a non-existing CV name', () => {
      const nonExistingCVID = 9248285
      return chai.request(server)
        .put(`/api/cvs/${nonExistingCVID}`)
        .send({ newCVName: newName })
        .then((result) => {
          result.should.have.status(200)
          result.text.should.be.eql('0')
        })
    })

    it('it should return HTML page with contents for preview route', () => {
      return chai.request(server)
        .post('/actions/preview')
        .send({ sections: [{ section_id: 1, text: 'test' }], username: testUser.username })
        .then((result) => {
          result.should.have.status(200)
          const returnedText = result.text
          returnedText.should.match(/.*<!DOCTYPE html/)
          returnedText.should.match(/.*cv/)
        })
    })

    it('it should load correct number of CV sections', () => {
      return chai.request(server)
        .get('/api/cvsections')
        .then((result) => {
          result.should.have.status(200)
          const cvSections = result.body
          cvSections.length.should.be.eql(testSections.length)
        })
    })
  })
})
