import {Service} from "@tsed/common";

@Service()
export class MemoryStorage {


  public set = (key: string, value: any) => this.states.set(key, value);
  private states: Map<string, any> = new Map<string, any>();

  public get<T>(key: string): T {
    let data = this.states.get(key);
    if (data === undefined) data = [];
    return data
  }
}