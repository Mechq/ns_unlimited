import { Injectable } from '@nestjs/common';
import {stations} from '../data/data';

@Injectable()
export class AppService {
  getDailyStation(){
      const stationData = stations[0];
      const keys = Object.keys(stationData);
      const dayIndex = Math.floor((Date.now() / (1000 * 60 * 60 * 24)) % keys.length);
      const stationName = keys[dayIndex];
      const anagrams = stationData[stationName];
      return { station: stationName, anagrams };
  }
}
