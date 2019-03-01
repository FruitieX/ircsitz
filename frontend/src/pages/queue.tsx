import React from "react"

import Layout from "../components/layout"
import io from "socket.io-client"
import { State, Song } from "../../types"
import config from "../../config"
import axios from "axios"

interface ComponentState {
  loading: boolean
  inputField: string
  error: string
  queue: Song[]
}

const msToTime = (duration: number) => {
  const seconds = String((duration / 1000) % 60).padStart(2, "0")
  const minutes = String((duration / (1000 * 60)) % 60).padStart(2, "0")
  const hours = String((duration / (1000 * 60 * 60)) % 24).padStart(2, "0")

  return hours + ":" + minutes + ":" + seconds
}

class IndexPage extends React.Component<{}, ComponentState> {
  state: ComponentState = {
    loading: false,
    inputField: "",
    error: "",
    queue: [],
  }

  changeInput = (event: React.FormEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value

    this.setState(() => ({
      inputField: value,
    }))
  }

  queueSong = async () => {
    const songId = this.state.inputField
    console.log("queuing song", songId)

    this.setState(() => ({
      loading: true,
      error: "",
    }))
    try {
      await axios.post(`${config.apiRoot}/queue`, { songId })

      this.setState(() => ({
        loading: false,
        inputField: "",
      }))
    } catch (err) {
      this.setState(() => ({
        loading: false,
        error: err && err.response && err.response.text,
      }))
    }
  }
  socket: SocketIOClient.Socket | undefined

  componentDidMount() {
    const socket = io(config.host)
    this.socket = socket

    socket.on("state", (state: State) => {
      this.setState(() => ({
        queue: state.playlist.songs.filter(
          (song, index) => index >= state.playlist.currentPos
        ),
      }))
    })
  }

  componentWillUnmount() {
    if (this.socket) {
      this.socket.close()
    }
  }

  renderSong = (song: Song) => {
    return (
      <div key={song.uuid}>
        <img width="100px" src={song.thumbnailUrl} />
        {song.title} {msToTime(Number(song.duration))}
      </div>
    )
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
        <button onClick={this.queueSong} disabled={this.state.loading}>
          Submit
        </button>
        <div>{this.state.error}</div>

        <h2>queue</h2>

        {this.state.queue.map(this.renderSong)}
      </Layout>
    )
  }
}

export default IndexPage
