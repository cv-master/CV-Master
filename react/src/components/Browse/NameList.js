import React from 'react'
import { ListGroup } from 'reactstrap'
import { connect } from 'react-redux'
import NameListItem from './NameListItem'

class NameList extends React.Component {
  userRefLoaded = []
  userItems = new Map()

  scroll = () => {
    if (this.userRefLoaded.every(Boolean)) {
      const activeUserItem = this.userItems.get(this.props.uid)
      if (activeUserItem) {
        activeUserItem.scrollIntoView()
      }
    }
  }

  render() {
    return (
      <div>
        <ListGroup>
          {this.props.userList.map((object, index) => {
            this.userRefLoaded.push(false)
            return (
              <div
                key={object.username}
                ref={(ref) => {
                  this.userItems.set(object.username, ref)
                  this.userRefLoaded[index] = true
                  this.scroll()
                }}
              >
                <NameListItem
                  object={object}
                  uid={this.props.uid}
                />
              </div>
            )
          })}
        </ListGroup>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    userList: state.userList,
  }
}


export default connect(
  mapStateToProps,
)(NameList)
