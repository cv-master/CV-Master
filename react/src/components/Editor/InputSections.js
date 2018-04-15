import React from 'react'
import { connect } from 'react-redux'
import { Container } from 'reactstrap'
import InputSectionCollapser from './InputSectionCollapser'

const InputSections = (props) => {
  return (
    <Container>
      {props.sections.map((section, index) =>
        (<InputSectionCollapser
          key={section.section_id}
          index={index}
          section={section}
          uid={props.uid}
        />),
      )}
    </Container>
  )
}

const mapStateToProps = (state, ownProps) => {
  return {
    sections: state.sections,
    uid: ownProps.uid,
  }
}

export default connect(
  mapStateToProps,
)(InputSections)
