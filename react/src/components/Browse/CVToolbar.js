import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button, Popover, PopoverBody, ButtonGroup, UncontrolledTooltip } from 'reactstrap'
import {
  updateCVList,
  cvClickedCascade,
} from '../../actions'
import Api from '../../Api'
import history from '../../history'

class CVToolbar extends Component {
  state = {
    deleteSelected: false,
  }

  copyClicked = async () => {
    const newCVID = await Api.copyCV(this.props.cvID)
    const username = this.props.uid
    const newCVList = await this.props.updateCVList(username)
    const newIndex = newCVList.findIndex(object => object.cv_id === newCVID)
    this.props.cvClickedCascade(username, newCVList, newIndex === -1 ? 0 : newIndex)
  }

  deleteConfirmed = async () => {
    this.setState({ deleteSelected: false })
    await Api.deleteCV(this.props.cvID)
    const username = this.props.uid
    const cvList = await this.props.updateCVList(username)
    const indexOutOfBounds = this.props.index >= cvList.length
    const newIndex = indexOutOfBounds ? cvList.length - 1 : this.props.index
    this.props.cvClickedCascade(username, cvList, newIndex)
  }

  deleteClicked = (event) => {
    event.stopPropagation()
    this.setState({ deleteSelected: true })
  }

  deleteCancelled = () => {
    this.setState({ deleteSelected: false })
  }

  editClicked = (event) => {
    event.stopPropagation()
    history.push(`/users/${this.props.uid}/${this.props.cvID}#edit`)
  }

  render() {
    const DeletePopoverHeaderContents = () => {
      if (this.props.cvList.length >= 2) {
        return 'Are you sure you want to delete this CV?'
      }
      return 'Deleting denied.'
    }

    const DeletePopoverBodyContents = () => {
      if (this.props.cvList.length >= 2) {
        return (
          <ButtonGroup className="popover-buttongroup">
            <Button outline className="button" onClick={this.deleteConfirmed}>Yes</Button>
            <Button outline className="button" onClick={this.deleteCancelled}>No</Button>
          </ButtonGroup>
        )
      }
      return 'You cannot delete the only CV of a user.'
    }

    const DeletePopover = () => {
      return (
        <Popover placement="bottom" target={`delete${this.props.cvID}`} isOpen={this.state.deleteSelected} toggle={this.deleteCancelled}>
          <PopoverBody>
            <DeletePopoverHeaderContents /><br />
            <DeletePopoverBodyContents />
          </PopoverBody>
        </Popover>
      )
    }

    return (
      <ButtonGroup className="cv-toolbar">
        <Button outline id={`edit${this.props.cvID}`} className="button" onClick={this.editClicked}>
          <span className="fa fa-pencil" aria-hidden="true" />
        </Button>
        <UncontrolledTooltip className="tooltip-top" delay={{ show: 600, hide: 0 }} placement="top" target={`edit${this.props.cvID}`}>
            Edit
        </UncontrolledTooltip>
        <Button outline id={`copy${this.props.cvID}`} className="button" onClick={this.copyClicked}>
          <span className="fa fa-files-o" aria-hidden="true" />
        </Button>
        <UncontrolledTooltip className="tooltip-top" delay={{ show: 600, hide: 0 }} placement="top" target={`copy${this.props.cvID}`}>
            Copy
        </UncontrolledTooltip>
        <Button id={`delete${this.props.cvID}`} outline className="button" onClick={this.deleteClicked}>
          <span className="fa fa-trash-o" aria-hidden="true" />
        </Button>
        <UncontrolledTooltip className="tooltip-top" delay={{ show: 600, hide: 0 }} placement="top" target={`delete${this.props.cvID}`}>
            Delete
        </UncontrolledTooltip>
        <DeletePopover />
      </ButtonGroup>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    userList: state.userList,
    cvList: state.cvList,
    cvid: ownProps.cvid,
    uid: ownProps.uid,
  }
}

const mapDispatchToProps = {
  updateCVList,
  cvClickedCascade,
}


export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(CVToolbar)
