get arrayBuffer -> decodeArrayBuffer -> loadDecodedBuffer

load
-> this.ac = new AudioContext()

`createBufferSource()` 方法用于创建一个新的`AudioBufferSourceNode`接口, 该接口可以通过 `AudioBuffer` 对象来播放音频数据.
`AudioBuffer` 对象可以通过 `AudioContext.createBuffer` 来创建或者通过 `AudioContext.decodeAudioData` 成功解码音轨后获取.

-> this.source = this.ac.createBufferSource()

AudioContext
OfflineAudioContext

参考 wavesurfer.js
