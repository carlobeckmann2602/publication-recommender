import { AnnoyVectorData } from '../interfaces/annoyVectorData.interface';

export class SendAnnoyDataDto {
  constructor(annoyVectorData: AnnoyVectorData[], moreData: boolean) {
    this.annoyVectorData = annoyVectorData;
    this.moreData = moreData;
  }
  annoyVectorData: AnnoyVectorData[];
  moreData: boolean;
}
