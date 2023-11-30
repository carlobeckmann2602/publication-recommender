import { ValueTransformer } from 'typeorm';
import { SourceVo } from '../vo/source.vo';

export class SourceTransformer implements ValueTransformer {
  from(value: string): SourceVo {
    return SourceVo.fromString(value);
  }

  to(value: SourceVo): string {
    return value.getValue();
  }
}
