import { IsArray, IsUUID } from 'class-validator';

export class MatchGroup {
  @IsArray()
  matches: Match[];
}

class Match {
  @IsUUID()
  id: string;
}
