import { Injectable } from '@angular/core';
import { Storage } from '@angular/fire/storage';
import { HttpClient } from '@angular/common/http';
import { Ensemble } from '../model/model';
import {
  ref,
  uploadBytes,
  listAll,
  StorageReference,
  ListResult,
  getDownloadURL,
} from 'firebase/storage';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  itemMap = {};

  storageRef: StorageReference;
  loading = false;
  constructor(private storage: Storage, public http: HttpClient) {
    // Get a reference to the storage service, which is used to create references in your storage bucket
    // Create a storage reference from our storage service
  }

  async upload(data: any, path: string): Promise<void> {
    const storageRef = ref(this.storage, path);
    const payload = JSON.stringify(data);
    const myblob = new Blob([payload], {
      type: 'application/json',
    });

    await uploadBytes(storageRef, myblob);

    // const buf = await data.arrayBuffer();
    // this.debug(buf);
  }

  debug(ab: ArrayBuffer) {
    const view = new Int8Array(ab);
    for (let i = 0; i < 10; i++) console.log(view[i]);
  }

  async list(): Promise<Ensemble[]> {
    this.loading = true;
    const ensembleList: Ensemble[] = [] as any;
    const storageRef = ref(this.storage, ''); // <-- fixed here

    const res = await listAll(storageRef);

    for (const prefix of res.prefixes) {
      const childRef = ref(this.storage, prefix.fullPath + '/');
      const resChild: ListResult = await listAll(childRef);

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

  async getEnsemble(
    item: StorageReference,
    ensembleList: Ensemble[]
  ): Promise<void> {
    const url = await getDownloadURL(item);
    const ensemble = await this.http.get<Ensemble>(url).toPromise();
    this.itemMap[ensemble.key] = item;
    ensembleList.push(ensemble);
  }
}
