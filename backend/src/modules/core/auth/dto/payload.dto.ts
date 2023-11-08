import { Expose } from 'class-transformer';

export class PayloadDto {
  @Expose()
  public id: string;
  @Expose()
  public isRefreshToken: boolean;

  constructor(id: string, isRefreshToken: boolean = false) {
    this.id = id;
    this.isRefreshToken = isRefreshToken;
  }
}
