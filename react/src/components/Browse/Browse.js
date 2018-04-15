import React from 'react'
import SearchAndExport from './SearchAndExport'
import NameList from './NameList'
import CVList from './CVList'
import './Browse.css'

const Browse = (props) => {
  return (
    <div>
      <SearchAndExport uid={props.uid} cvid={props.cvid} />
      <div id="namelist" className="browse-section">
        <NameList uid={props.uid} />
      </div>
      <div id="cvlist" className="browse-section">
        <CVList uid={props.uid} cvid={props.cvid} />
      </div>
    </div>
  )
}

export default Browse
