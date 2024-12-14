import { HttpClient } from '@angular/common/http';
import { InstrumentPrototype } from './intrument-prototype';

export class Instrument {
  audioContext: AudioContext;
  //   filter: any;
  panner: any;
  volume: any;
  legacy = false;
  prototype: InstrumentPrototype;

  constructor({
    audioContext,
    prototype,
  }: {
    audioContext: AudioContext;
    prototype: InstrumentPrototype;
  }) {
    this.audioContext = audioContext;
    this.prototype = prototype;

    // this.filter = this.audioContext.createBiquadFilter();

    if (this.audioContext.createStereoPanner) {
      this.panner = this.audioContext.createStereoPanner();
    } else {
      this.legacy = true;

      this.panner = this.audioContext.createPanner();
      this.panner.panningModel = 'equalpower';
    }

    // this.panner = this.audioContext.createStereoPanner();
    this.volume = this.audioContext.createGain();

    // this.filter.connect(this.panner);
    this.panner.connect(this.audioContext.destination);
    this.volume.connect(this.panner);
  }

  setPan(pan) {
    if (!this.legacy) {
      this.panner.pan.setValueAtTime(pan, 0);
    } else {
      this.panner.setPosition(pan, 0, 1 - Math.abs(pan));
    }
  }

  setVolume(value) {
    this.volume.gain.setValueAtTime(value, 0);
  }

  async play(note) {

    const ab = this.prototype.buffers[note];
    const source = this.audioContext.createBufferSource(); // creates a sound source
    source.buffer = ab; // tell the source which sound to play
    source.connect(this.volume); // connect the source to the context's destination (the speakers)
    source.start(0);
  }

  get notes() {
    return this.prototype.notes;
  }
}
