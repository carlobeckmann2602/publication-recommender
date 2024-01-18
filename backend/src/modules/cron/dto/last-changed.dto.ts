import { Expose } from 'class-transformer';

export class LastChangedInfo {
  @Expose({ name: 'last_changed' })
  lastChanged: number;
}
