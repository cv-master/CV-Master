import React from 'react'
import { ListGroupItem, Collapse, Button, Input, Label } from 'reactstrap'
import { connect } from 'react-redux'
import Textarea from 'react-textarea-autosize'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import {
  updateSections,
  updatePreview,
} from '../../actions'

class InputSectionCollapser extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      collapse: !props.index,
      copied: false,
    }
  }

  handleChange = (event) => {
    const newText = event.target.value
    const newSections = JSON.parse(JSON.stringify(this.props.sections)) // deep copy
    newSections[this.props.index].text = newText
    this.props.updateSections(newSections)
    this.props.updatePreview(newSections, this.props.username)
  }

  toggleCollapse = () => {
    this.setState({ collapse: !this.state.collapse })
  }

  toggleTemplate = () => {
    const newSections = JSON.parse(JSON.stringify(this.props.sections)) // deep copy
    newSections[this.props.index].showTemplate = !this.props.section.showTemplate
    this.props.updateSections(newSections)
    this.props.updatePreview(newSections, this.props.username)
  }

  render() {
    return (
      <ListGroupItem>
        <div>
          <Button outline className="button" size="sm" onClick={this.toggleCollapse}>
            {this.props.section.title}
          </Button>
          {this.state.collapse &&
            <div className="template-toggle">
              <Label>
                <Input
                  type="checkbox"
                  key={this.props.key}
                  checked={this.props.section.showTemplate}
                  onChange={this.toggleTemplate}
                />
               Show template
              </Label>
            </div>
          }
          {this.props.section.showTemplate === true && this.state.collapse &&
            <CopyToClipboard
              text={this.props.section.template}
              onCopy={() => {
                this.setState({ copied: true })
                setTimeout(() => this.setState({ copied: false }), 2000)
              }}
            >
              <Button outline className="button copy-button">
                <span>Copy</span>
              </Button>
            </CopyToClipboard>
          }
          {this.state.copied &&
            <span className="copy-message">Template copied.</span>
          }
          <Collapse isOpen={this.state.collapse}>
            <div>
              <br />
              {
                this.props.section.showTemplate
                  ? <pre className="template">
                    {this.props.section.template}
                  </pre>
                  : <Textarea
                    className="textfield"
                    value={this.props.section.text}
                    onChange={this.handleChange}
                  />
              }
            </div>
          </Collapse>
        </div>
      </ListGroupItem>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    sections: state.sections,
    username: ownProps.uid,
  }
}

const mapDispatchToProps = {
  updateSections,
  updatePreview,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(InputSectionCollapser)
