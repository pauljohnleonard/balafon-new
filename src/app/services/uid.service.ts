import { Injectable } from '@angular/core';
import { v1 as uuidv1 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class UidService {
  lastPushTime: number;
  lastRandChars: any[];

  constructor() {
    this.lastPushTime = 0;
    this.lastRandChars = [];
  }

  //   uuid(): string {
  //     const now = Date.now();
  //     if (now === this.lastdate) this.cnt++;
  //     this.lastdate = now;
  //     return uuidv1();
  //   }

  /**
   * Fancy ID generator that creates 20-character string identifiers with the following properties:
   *
   * 1. They're based on timestamp so that they sort *after* any existing ids.
   * 2. They contain 72-bits of random data after the timestamp so that IDs won't collide with other clients' IDs.
   * 3. They sort *lexicographically* (so the timestamp is converted to characters that will sort properly).
   * 4. They're monotonically increasing.  Even if you generate more than one in the same timestamp, the
   *    latter ones will sort after the former ones.  We do this by using the previous random bits
   *    but "incrementing" them by 1 (only in the case of a timestamp collision).
   */
  generatePushID() {
    // Modeled after base64 web-safe chars, but ordered by ASCII.
    const PUSH_CHARS =
      '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz';

    // Timestamp of last push, used to prevent local collisions if you push twice in one ms.

    // We generate 72-bits of randomness which get turned into 12 characters and appended to the
    // timestamp to prevent collisions with other clients.  We store the last characters we
    // generated because in the event of a collision, we'll use those same characters except
    // "incremented" by one.

    let now = Date.now();
    const duplicateTime = now === this.lastPushTime;
    this.lastPushTime = now;

    const timeStampChars = new Array(8);
    for (let i = 7; i >= 0; i--) {
      timeStampChars[i] = PUSH_CHARS.charAt(now % 64);
      // NOTE: Can't use << here because javascript will convert to int and lose the upper bits.
      now = Math.floor(now / 64);
    }
    if (now !== 0)
      throw new Error('We should have converted the entire timestamp.');

    let id = timeStampChars.join('');

    if (!duplicateTime) {
      for (let i = 0; i < 12; i++) {
        this.lastRandChars[i] = Math.floor(Math.random() * 64);
      }
    } else {
      // If the timestamp hasn't changed since last push, use the same random number, except incremented by 1.
      let i = 11;
      for (; i >= 0 && this.lastRandChars[i] === 63; i--) {
        this.lastRandChars[i] = 0;
      }
      this.lastRandChars[i]++;
    }
    for (let i = 0; i < 12; i++) {
      id += PUSH_CHARS.charAt(this.lastRandChars[i]);
    }
    if (id.length !== 20) throw new Error('Length should be 20.');

    return id;
  }
}
