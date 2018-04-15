import React from 'react'
import { ListGroup, ListGroupItem, ListGroupItemHeading } from 'reactstrap'
import { connect } from 'react-redux'
import CVToolbar from './CVToolbar'
import CvNameForm from './CvNameForm'
import {
  cvClickedCascade,
} from '../../actions'

const getListGroupItem = (props, cvObject) => {
  const cvName = cvObject.cv_name
  const cvID = cvObject.cv_id
  const isActive = props.cvid === cvID
  return (
    <ListGroupItem
      key={cvID}
      action
      active={isActive}
      onClick={() => {
        const username = props.selectedUserID
        props.cvClickedCascade(username, props.cvList, cvID)
      }}
    >
      <div className="cv-name">
        <ListGroupItemHeading>
          <CvNameForm
            cvName={cvName}
            cvID={cvID}
            uid={props.selectedUserID}
          />
        </ListGroupItemHeading>
      </div>
      <div>
        {isActive ? <CVToolbar
          cvID={cvID}
          uid={props.selectedUserID}
        /> : ''}
        <span className="language-flag badge badge-pill badge-info">
          {cvObject.language_name}
        </span>
        <span className="last-modified-datetime">
          {new Date(cvObject.last_updated).toLocaleString()}
        </span>
      </div>
    </ListGroupItem>
  )
}

const CVList = (props) => {
  const listGroupItems = props.cvList.map(cvObject => (
    getListGroupItem(props, cvObject)
  ))
  return (
    <div className="centered-list">
      <ListGroup>
        {listGroupItems}
      </ListGroup>
    </div>
  )
}

const mapStateToProps = (state, ownProps) => {
  return {
    cvList: state.cvList,
    userList: state.userList,
    selectedUserID: ownProps.uid,
    cvid: ownProps.cvid,
  }
}


const mapDispatchToProps = {
  cvClickedCascade,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(CVList)
