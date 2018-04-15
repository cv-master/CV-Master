import React, { Component } from 'react'
import { connect } from 'react-redux'
import Editor from './Editor/Editor'
import Browse from './Browse/Browse'
import Header from './Header'
import NotFound from './NotFound'
import {
  updateUserList,
  getCurrentUser,
  userClickedCascade,
  updateCVList,
  updateCVSections,
  loadSections,
  updatePreview,
  update404,
} from '../actions'
import PreviewTabs from './PreviewTabs'

class App extends Component {
  async componentDidMount() {
    await this.props.getCurrentUser()
    const userList = await this.props.updateUserList()
    const cvList = await this.props.updateCVList(this.props.uid)
    await this.props.updateCVSections()
    if (userList.findIndex(u => u.username === this.props.uid) === -1) {
      this.props.update404(true)
    } else if (this.props.cvidRaw) {
      if (cvList.findIndex(cv => cv.cv_id === this.props.cvid) === -1) {
        this.props.update404(true)
      } else if (this.props.view === '#edit') {
        const sections = await this.props.loadSections(this.props.cvid)
        this.props.updatePreview(sections, this.props.uid)
      } else { this.props.userClickedCascade(this.props.uid, this.props.cvid) }
    } else { this.props.userClickedCascade(this.props.uid) }
  }

  render() {
    if (this.props.urlNotFound) {
      return (
        <div>
          <NotFound uid={this.props.uid} />
        </div>
      )
    }

    return (
      <div>
        <Header />
        <div className="CVpreview">
          <PreviewTabs cvid={this.props.cvid} />
        </div>
        {this.props.view === '#edit'
          ? <Editor uid={this.props.uid} cvid={this.props.cvid} />
          : <Browse uid={this.props.uid} cvid={this.props.cvid} />}

      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    uid: ownProps.match.params.uid,
    cvid: Number(ownProps.match.params.cvid),
    cvidRaw: ownProps.match.params.cvid,
    view: ownProps.location.hash,
    urlNotFound: state.urlNotFound,
  }
}

const mapDispatchToProps = {
  updateUserList,
  getCurrentUser,
  userClickedCascade,
  updateCVList,
  updateCVSections,
  loadSections,
  updatePreview,
  update404,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(App)
