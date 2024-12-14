import { HttpClient } from '@angular/common/http';
import { Instrument } from './instrument';

export class InstrumentPrototype {
  buffers: AudioBuffer[];
  audioContext: AudioContext;
  name: string;
  notes: string[];
  http: HttpClient;
  //   filter: any;
  legacy = false;
  constructor({
    audioContext,
    name,
    notes,
    http,
  }: {
    audioContext: AudioContext;
    name: string;
    notes: string[];
    http: HttpClient;
  }) {
    this.audioContext = audioContext;
    this.name = name;
    this.notes = notes;
    this.http = http;
  }
  async load(cb) {
    // this.state = LooperState.FROZEN;
    this.buffers = [];
    let cnt = 0;

    const promises = [];

    for (const note of this.notes) {
      promises.push(this.getNote(note, cnt, cb));
      cnt++;
    }

    await Promise.all(promises);

    console.log(` ${this.name}   loaded `);
  }

  private async getNote(note, cnt, cb) {
    const arrayBuffer = await this.http
      .get(`assets/${this.name}/${note}.mp3`, {
        responseType: 'arraybuffer',
      })
      .toPromise();

    const promise = new Promise<void>((resolve, reject) => {
      this.audioContext.decodeAudioData(
        arrayBuffer,
        (audiobuffer) => {
          this.buffers[cnt++] = audiobuffer;
          resolve();
        },
        (err) => {
          reject(err);
          console.error(`Error with decoding audio data ${err.message}`);
        }
      );
    });
    await promise;

    if (cb) cb();
  }

  create(): Instrument {
    return new Instrument({ audioContext: this.audioContext, prototype: this });
  }
}
