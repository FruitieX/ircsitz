import React from "react"

import Layout from "../components/layout"
import io from "socket.io-client"
import { PlaybackEvent } from "../../types"
import axios from "axios"
import config from "../../config"

import "./styles.css"

const initPlayer = async (id: string) => {
  // yuck, ew.
  // https://developers.google.com/youtube/iframe_api_reference

  return new Promise(resolve => {
    const tag = document.createElement("script")

    tag.src = "https://www.youtube.com/iframe_api"
    const firstScriptTag = document.getElementsByTagName("script")[0]
    firstScriptTag.parentNode!.insertBefore(tag, firstScriptTag)

    // @ts-ignore
    window.onYouTubeIframeAPIReady = function() {
      // @ts-ignore
      var player = new YT.Player(id, {
        events: {
          onReady: function() {
            resolve(player)
          },
        },
      })
    }
  })
}

const attachPlayerStateHandler = function(player: any, handler: any) {
  player.addEventListener("onStateChange", handler)
}

class Player extends React.Component {
  player?: any
  io?: {}

  callYTPlayer = (
    func: "loadVideoById" | "pauseVideo" | "playVideo" | "seekTo",
    args: any[]
  ) => {
    if (!this.player) return console.log("Player not initialized!")

    console.log("calling YT player with", func, args)
    if (this.player[func]) {
      this.player[func].apply(this.player, args)
    }
  }
  socket?: SocketIOClient.Socket

  async componentDidMount() {
    this.player = await initPlayer("player")

    attachPlayerStateHandler(this.player, async (event: any) => {
      console.log("YT player event", event)

      // Video ended
      if (event.data === 0) {
        console.log("end of video")
        await axios.post(`${config.apiRoot}/playback`, {
          state: "play",
          skip: 1,
        })
      }
    })

    const socket = io(config.host)
    this.socket = socket
    socket.on("playback", (playback: PlaybackEvent) => {
      console.log(playback)

      // Player should be playing
      if (playback.state === "play") {
        const song = playback.song

        if (!song) {
          return this.callYTPlayer("pauseVideo", [])
        }

        if (song.backend === "youtube") {
          this.callYTPlayer("loadVideoById", [
            {
              videoId: song.songId,
              startSeconds: playback.seek / 1000,
            },
          ])
          if (playback.seek !== undefined) {
            //this.callYTPlayer('seekTo', [playback.seek / 1000, true])
          } else {
            //this.callYTPlayer('playVideo', [])
          }
        }
      } else {
        this.callYTPlayer("pauseVideo", [])
      }
    })
  }

  componentWillUnmount() {
    if (this.socket) {
      this.socket.close()
    }
  }

  render() {
    return (
      <Layout>
        <iframe
          id="player"
          src="https://www.youtube.com/embed?enablejsapi=1&controls=0&showinfo=0"
        />
      </Layout>
    )
  }
}

export default Player
