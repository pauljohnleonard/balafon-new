import { Injectable } from '@angular/core';
import { Storage } from '@angular/fire/storage';
import { HttpClient } from '@angular/common/http';
import { mergeMap } from 'rxjs/operators';
import { Ensemble } from '../model/model';
// import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  itemMap = {};

  storageRef: any;
  loading = false;
  constructor(private storage: Storage, public http: HttpClient) {
    // Get a reference to the storage service, which is used to create references in your storage bucket
    // Create a storage reference from our storage service
  }

  async upload(data: any, path: string) {
    const ref = this.storage.ref(path);
    const payload = JSON.stringify(data);
    const myblob = new Blob([payload], {
      type: 'application/json',
    });

    await ref.put(myblob);

    // const buf = await data.arrayBuffer();
    // this.debug(buf);
  }

  debug(ab: ArrayBuffer) {
    const view = new Int8Array(ab);
    for (let i = 0; i < 10; i++) console.log(view[i]);
  }

  async list() {
    this.loading = true;
    const ensembleList: Ensemble[] = [] as any;
    const storageRef = this.storage.ref('');

    const list = await storageRef.listAll();

    const res = await list.toPromise();

    for (const prefix of res.prefixes) {
      const childRef = this.storage.ref(prefix.fullPath + '/');
      const childList = await childRef.listAll();

      const resChild = await childList.toPromise();

      const promises = [];
      for (const item of resChild.items) {
        // const url = await item.getDownloadURL();
        // const ensemble = await this.http.get<Ensemble>(url).toPromise();

        promises.push(this.getEnsemble(item, ensembleList));
      }

      await Promise.all(promises);
    }

    this.loading = false;
    return ensembleList;
  }

  async getEnsemble(item, ensembleList) {
    const url = await item.getDownloadURL();
    const ensemble = await this.http.get<Ensemble>(url).toPromise();
    this.itemMap[ensemble.key] = item;
    ensembleList.push(ensemble);
  }
}
