import React, { Component } from 'react'
import { Button, Jumbotron } from 'reactstrap'
import { connect } from 'react-redux'
import Header from './Header'
import './NotFound.css'
import { getCurrentUser, userClickedCascade, update404 } from '../actions'

class NotFound extends Component {
  goBack = async () => {
    this.props.update404(false)
    const loggedInUser = await this.props.getCurrentUser()
    if (this.props.userList.findIndex(u => u.username === this.props.uid) === -1) {
      await this.props.userClickedCascade(loggedInUser)
    } else {
      this.props.userClickedCascade(this.props.uid)
    }
  }

  render() {
    return (
      <div>
        <Header />
        <Jumbotron>
          <h1 className="display-1">404</h1>
          <h4 className="display-5">Not Found</h4>
          <Button outline className="button" onClick={this.goBack}>Home</Button>
        </Jumbotron>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    uid: ownProps.uid,
    userList: state.userList,
  }
}

const mapDispatchToProps = {
  getCurrentUser,
  userClickedCascade,
  update404,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(NotFound)
