import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button, ButtonGroup, ButtonDropdown, DropdownItem, DropdownMenu, DropdownToggle, Popover, PopoverBody } from 'reactstrap'
import {
  updateCVList,
  setCVList,
  loadSections,
  updatePreview,
  updateSections,
} from '../../actions'
import Api from '../../Api'
import history from '../../history'
import { downloadPDF, displayPDF } from '../../utils'


class EditorButtonGroup extends Component {
  constructor(props) {
    super(props)
    this.state = {
      saveStatus: '',
      languageDropdownOpen: false,
      cvLanguageObjects: [],
      closeSelected: false,
    }
  }

  componentDidMount() {
    this.loadCVLanguages()
  }

  loadCVLanguages = async () => {
    const languages = await Api.loadLanguages()
    this.setState({ cvLanguageObjects: languages })
  }

  toggleLanguage = () => {
    this.setState({ languageDropdownOpen: !this.state.languageDropdownOpen })
  }

  languageClicked = async (languageID) => {
    const cvSectionsInNewLanguage = this.props.cvSections
      .filter(cvSection => cvSection.language_id === languageID)
    const newSections = this.props.sections.map((section, index) => {
      const cvSectionObject = cvSectionsInNewLanguage[index]
      return Object.assign({}, section, {
        title: cvSectionObject.title,
        template: cvSectionObject.template,
      })
    })
    const newCVList = this.props.cvList.map(cvObject => Object.assign({}, cvObject))
    const currentCV = newCVList.find(cv => cv.cv_id === this.props.cvID)
    currentCV.language_id = languageID
    currentCV.language_name = this.state.cvLanguageObjects
      .find(lang => lang.language_id === languageID)
      .language_name
    this.props.updateSections(newSections)
    this.props.setCVList(newCVList)
    this.props.updatePreview(newSections, this.props.username)
  }

  saveCV = async (languageID = this.props.cvLanguageID) => {
    const cvID = this.props.cvID
    const saveMessage = await Api.saveCV(cvID, this.props.username, this.props.sections, languageID)
    this.setState({ saveStatus: saveMessage })
    window.setTimeout(() => {
      this.setState({ saveStatus: '' })
    }, 3000)
    displayPDF(
      this.props.username,
      this.props.cvid,
      this.props.sections,
    )
    await this.props.updateCVList(this.props.username)
    return { saveMessage }
  }

  // The content gets saved automatically when it's downloaded.
  saveAndExport = async () => {
    await this.saveCV()
    downloadPDF(
      this.props.username,
      this.props.cvid,
      this.props.sections,
    )
  }

  equalSections = (a, b) => {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i += 1) {
      if (a[i].text !== b[i].text) {
        return false
      }
    }
    return true
  }

  close = async () => {
    const oldSections = await Api.loadCV(this.props.cvID)
    const oldCVList = await Api.loadCVList(this.props.username)
    const oldLanguage = oldCVList.find(cv => cv.cv_id === this.props.cvID).language_id
    const newLanguage = this.props.cvList.find(cv => cv.cv_id === this.props.cvID).language_id
    if (this.equalSections(this.props.sections, oldSections) && oldLanguage === newLanguage) {
      this.closeWithoutSaving()
    } else {
      this.setState({ closeSelected: true })
    }
  }

  closeCancelled = () => {
    this.setState({ closeSelected: false })
  }

  closeWithoutSaving = async () => {
    history.push(`/users/${this.props.username}/${this.props.cvID}`)
    await this.props.updateCVList(this.props.username)
    const sections = await this.props.loadSections(this.props.cvID)
    this.props.updatePreview(sections, this.props.username)
  }

  closeWithSaving = async () => {
    await this.saveCV()
    this.closeWithoutSaving()
  }

  render() {
    const languageDropdownItems = this.state.cvLanguageObjects.map((languageObject) => {
      const languageName = languageObject.language_name
      const languageID = languageObject.language_id
      const isCVLanguage = languageID === this.props.cvLanguageID
      if (isCVLanguage) return false
      return (
        <DropdownItem
          key={languageID}
          onClick={() => this.languageClicked(languageID)}
          active={languageID === this.props.cvLanguageID}
        >
          {languageName ? languageName[0].toUpperCase() + languageName.slice(1) : ''}
        </DropdownItem>
      )
    })
    const ClosePopover = () => {
      return (
        <Popover placement="bottom" target="closebutton" isOpen={this.state.closeSelected} toggle={this.closeCancelled}>
          <PopoverBody>
            You have unsaved changes. Save before closing? <br />
            <ButtonGroup className="popover-buttongroup">
              <Button outline className="button" onClick={this.closeWithSaving}>Yes</Button>
              <Button outline className="button" onClick={this.closeWithoutSaving}>No</Button>
            </ButtonGroup>
          </PopoverBody>
        </Popover>
      )
    }

    return (
      <div className="buttonheader editor-buttonheader">
        <ButtonGroup>
          <Button outline className="button" id="closebutton" onClick={this.close}>Close</Button>
          <Button outline className="button" onClick={() => this.saveCV()}>Save</Button>
        </ButtonGroup>
        <ButtonDropdown className="language-dropdown" isOpen={this.state.languageDropdownOpen} toggle={this.toggleLanguage}>
          <DropdownToggle caret outline className="button">
            {this.props.cvLanguageName ? this.props.cvLanguageName[0].toUpperCase() + this.props.cvLanguageName.slice(1) : ''}
          </DropdownToggle>
          <DropdownMenu>
            {languageDropdownItems}
          </DropdownMenu>
        </ButtonDropdown>
        <div id="savestatus" className="statusMessage">{this.state.saveStatus.toString()}</div>
        <ClosePopover />
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  const currentCV = state.cvList.find(cv => cv.cv_id === ownProps.cvid)
  return {
    cvSections: state.cvSections,
    sections: state.sections,
    username: ownProps.uid,
    cvID: ownProps.cvid,
    cvList: state.cvList,
    cvLanguageName: (currentCV && currentCV.language_name) || '',
    cvLanguageID: (currentCV && currentCV.language_id) || 0,
  }
}

const mapDispatchToProps = {
  updateCVList,
  setCVList,
  loadSections,
  updatePreview,
  updateSections,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(EditorButtonGroup)
