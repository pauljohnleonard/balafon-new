import { Injectable } from '@angular/core';
import { verbs } from '../classes/verbs';
import { nouns } from '../classes/nouns';
import { adjectives } from '../classes/adjectives';
import { adverbs } from '../classes/adverbs';
import { prepositions } from '../classes/preposition';

const listMap = {
  verb: verbs,
  noun: nouns,
  adjective: adjectives,
  preposition: prepositions,
  adverb: adverbs
};
const structures = [
  ['subject', 'verb'],
  ['verb', 'subject'],
  ['subject'],
  ['preposition', 'subject'],
  ['adjective', 'preposition', 'subject'],
  ['subject', 'preposition', 'subject'],
  ['subject', 'verb', 'adjective'],
  ['verb', 'adverb', 'subject'],
  ['subject', 'verb', 'subject']
];

const probNoArticle = 0.4;
const probTheArticle = 0.3;

function capitalise(x: string) {
  return x[0].toUpperCase() + x.slice(1);
}

@Injectable({
  providedIn: 'root'
})
export class TitleService {
  constructor() { }

  makeTitle() {
    const title: string[] = [];
    const structure = this.randomItem(structures);

    structure.forEach(el => {
      if (el === 'subject') {
        this.randomSubject(title);
      } else {
        const list = listMap[el];
        title.push(this.randomItem(list));
      }
    });

    title[0] = capitalise(title[0]);

    return title.join(' ');
  }

  randomSubject(title: string[]) {
    const noun = this.randomItem(nouns);
    const article = this.randomArticle(noun);
    if (article) title.push(article);
    title.push(noun);
  }

  randomItem(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  randomArticle(subject: string) {
    let x = Math.random();
    if (x < probNoArticle) {
      return null;
    }

    x -= probTheArticle;

    if (x < probTheArticle) {
      return 'the';
    }

    const exp = new RegExp(/^(A|E|I|O|U|e|i|o|a|u)/);

    if (exp.test(subject)) {
      return 'an';
    } else {
      return 'a';
    }
  }
}
