import React, { Component } from 'react';

class AudioPlayer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            audioContext: null,
            bufferSource: null,
            currentDuration: 0,
            currentAudio: null,
            responseData: null
        };
    }

    componentWillUnmount() {
        if (this.state.bufferSource) {
            this.state.bufferSource.stop();
        }
    }

    handlePlayButtonClick = () => {
        if (!this.state.audioContext) {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.setState({ audioContext }, this.fetchAndPlayAudio);
        } else {
            this.fetchAndPlayAudio();
        }
    };

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    async fetchAndPlayAudio() {
        try {
            if (this.state.bufferSource) {
                this.state.bufferSource.stop();
            }
            var response = null
            if (this.state.responseData != null && this.state.responseData.last_date_added != null) {
                response = await fetch('http://192.168.1.171:5003/audio?last_date_added=' + this.state.responseData.last_date_added); // Înlocuiește cu URL-ul corect
            } else {
                response = await fetch('http://192.168.1.171:5003/audio'); // Înlocuiește cu URL-ul corect
            }
            const responseData = await response.json();
            if (this.state.responseData != null && this.state.responseData.audio != null && this.state.responseData.audio === responseData.audio) {
                console.log("There is no new recording. Wait")
                await this.sleep(3000);
                this.fetchAndPlayAudio()
                return;
            }
            const audioBuffer = await this.base64ToArrayBuffer(responseData.audio);
            const audioContext = this.state.audioContext;
            const audioBufferSource = audioContext.createBufferSource();

            audioContext.decodeAudioData(audioBuffer, (buffer) => {
                audioBufferSource.buffer = buffer;
                audioBufferSource.connect(audioContext.destination);

                const currentDuration = responseData.duration;
                audioBufferSource.onended = () => {
                    setTimeout(() => {
                        this.fetchAndPlayAudio();
                    }, 1000); // Așteaptă durata specificată în secunde înainte de a apela din nou
                };

                audioBufferSource.start();

                this.setState({
                    bufferSource: audioBufferSource,
                    currentDuration: currentDuration,
                    currentAudio: audioBufferSource,
                    responseData: responseData,
                });
            });
        } catch (error) {
            console.error('Error fetching or playing audio:', error);
        }
    }

    async base64ToArrayBuffer(base64) {
        const response = await fetch(`data:audio/mp3;base64,${base64}`);
        const buffer = await response.arrayBuffer();
        return buffer;
    }

    render() {
        return (
            <div>
                <h2>Audio Player</h2>
                <button onClick={this.handlePlayButtonClick}>Play</button>
            </div>
        );
    }
}

export default AudioPlayer;
