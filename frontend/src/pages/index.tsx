import React from 'react'

import Layout from '../components/layout'
import config from '../../config'
import request from 'superagent'

class IndexPage extends React.Component {
  state = {
    inputField: '',
  }

  changeInput = (event: React.FormEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value

    this.setState(() => ({
      inputField: value,
    }))
  }

  queueSong = async () => {
    const songId = this.state.inputField
    console.log('queuing song', songId)

    try {
      await request.post(`${config.apiRoot}/queue`).send({ songId })

      this.setState(() => ({
        inputField: '',
      }))
    } catch (err) {
      console.log(err)
    }
  }

  render() {
    return (
      <Layout>
        <h1>lägg låtar i kön ju</h1>

        <p>exempel:</p>
        <ul>
          <li>https://www.youtube.com/watch?v=dQw4w9WgXcQ</li>
          <li>https://youtu.be/dQw4w9WgXcQ</li>
        </ul>

        <input value={this.state.inputField} onChange={this.changeInput} />
        <button onClick={this.queueSong}>Submit</button>

        <h2>queue</h2>
      </Layout>
    )
  }
}

export default IndexPage
