import React from 'react'
import { Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import Api from '../Api'


class Home extends React.Component {
  state = { uid: '', cvid: '' }
  async componentDidMount() {
    const uid = this.props.uid || await Api.loadCurrentUser()
    const cvs = await Api.loadCVList(uid)
    const cvid = cvs[0] && cvs[0].cv_id
    this.setState({ uid, cvid }) // eslint-disable-line
  }

  render() {
    if (this.state.uid === '' || this.state.cvid === '') {
      return null
    }
    return <Redirect to={`/users/${this.state.uid}/${this.state.cvid}`} />
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    uid: ownProps.match.params.uid,
  }
}

export default connect(
  mapStateToProps,
)(Home)
