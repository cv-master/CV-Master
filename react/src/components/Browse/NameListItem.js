import React from 'react'
import { ListGroupItem } from 'reactstrap'
import { connect } from 'react-redux'
import {
  userClickedCascade,
} from '../../actions'

class NameListItem extends React.Component {
  render() {
    const { object, uid, searchFieldContents } = this.props
    const username = object.username
    const fullName = object.full_name
    const isActive = uid === username
    const searchingFor = searchFieldContents
    const searchAsRegExp = new RegExp(searchingFor, 'gi')
    const searchMatchesFromIndex = fullName.search(searchAsRegExp)
    if (searchMatchesFromIndex === -1) return null
    return (
      <div>
        <ListGroupItem
          tag="a"
          href="#"
          action
          active={isActive}
          onClick={() => {
            this.props.userClickedCascade(username)
          }}
        >
          {fullName.substr(0, searchMatchesFromIndex)}
          <b>
            <font color="FC6054">
              {fullName.substr(searchMatchesFromIndex, searchingFor.length)}
            </font>
          </b>
          {fullName.substr(searchMatchesFromIndex + searchingFor.length)}
        </ListGroupItem>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    userList: state.userList,
    loggedInUser: state.loggedInUser,
    searchFieldContents: state.searchFieldContents,
  }
}

const mapDispatchToProps = {
  userClickedCascade,
}


export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(NameListItem)
